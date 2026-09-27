// Let Report: sends push notifications.
// - Called by the database (trigger + pg_net) for each new alert or chat message, with a secret header.
//   It reads the row itself, works out who should get it, and pushes to their browsers.
// - A signed-in person can also call it with { action: 'test' } to get a test notification.
// Deploy: supabase functions deploy push --no-verify-jwt   (the function checks callers itself)
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { sendPush, b64u } from './webpush.js';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const SUBJECT = 'https://let-report.vercel.app';   // who sends the pushes (your app's address)

type Sub = { user_id: string; endpoint: string; p256dh: string; auth: string; updated_at: string };
type Msg = { title: string; body: string; url: string; tag: string };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Use POST' }, 405);
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

  // Keys: made once, the first time this runs.
  let { data: cfg } = await admin.rpc('push_config');
  if (!cfg?.vapid_private || !cfg?.vapid_public) {
    const k = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
    const jwk = await crypto.subtle.exportKey('jwk', k.privateKey);
    const pub = b64u.enc(await crypto.subtle.exportKey('raw', k.publicKey));
    await admin.rpc('push_save_keys', { pub, priv: jwk.d });
    ({ data: cfg } = await admin.rpc('push_config'));
  }
  const vapid = { publicKey: cfg.vapid_public, privateKey: cfg.vapid_private, subject: SUBJECT };

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: 'Bad request' }, 400); }

  // Send one message to these people's browsers (a browser shared by two accounts goes to whoever used it last).
  async function deliver(userIds: string[], msg: Msg) {
    if (!userIds.length) return { sent: 0 };
    const { data: subs } = await admin.from('push_subscriptions').select('*').in('user_id', userIds);
    if (!subs?.length) return { sent: 0 };
    const { data: all } = await admin.from('push_subscriptions').select('user_id, endpoint, updated_at').in('endpoint', subs.map((s: Sub) => s.endpoint));
    const latest: Record<string, Sub> = {};
    (all || []).forEach((s: Sub) => { if (!latest[s.endpoint] || s.updated_at > latest[s.endpoint].updated_at) latest[s.endpoint] = s; });
    const targets = (subs as Sub[]).filter(s => latest[s.endpoint]?.user_id === s.user_id);
    const text = JSON.stringify(msg);
    const results = await Promise.all(targets.map(async s => {
      try {
        const status = await sendPush(s, text, vapid);
        if (status === 404 || status === 410) await admin.from('push_subscriptions').delete().eq('endpoint', s.endpoint).eq('user_id', s.user_id);
        return status;
      } catch (_) { return 0; }
    }));
    return { sent: results.filter(x => x >= 200 && x < 300).length, results };
  }

  // ── Test from the app ──
  if (body.action === 'test') {
    const token = (req.headers.get('Authorization') || '').replace('Bearer ', '');
    const { data: u } = await admin.auth.getUser(token);
    if (!u?.user) return json({ error: 'Please sign in again.' }, 401);
    const r = await deliver([u.user.id], { title: 'Let Report', body: String(body.text || 'Notifications are on.'), url: '#', tag: 'test' });
    return json(r);
  }

  // ── From the database ──
  if (!cfg?.webhook_secret || req.headers.get('x-push-secret') !== cfg.webhook_secret) return json({ error: 'Not allowed' }, 401);
  const { data: people } = await admin.from('profiles').select('id, name, role, active');
  const active = (people || []).filter((p: { active: boolean }) => p.active);
  const nameOf = (id: string) => (people || []).find((p: { id: string }) => p.id === id)?.name || 'Someone';

  if (body.table === 'notifications') {
    const { data: n } = await admin.from('notifications').select('*').eq('id', body.id).single();
    if (!n) return json({ sent: 0 });
    const to = active.filter((p: { id: string; role: string }) => p.id !== n.created_by && ((n.roles || []).includes(p.role) || (n.user_ids || []).includes(p.id))).map((p: { id: string }) => p.id);
    const title = n.icon === 'message-circle' ? 'New comment' : n.icon === 'siren' ? 'Critical trouble' : n.icon === 'circle-check' ? 'Trouble closed' : 'Let Report';
    return json(await deliver(to, { title, body: n.text, url: n.report_id ? '#report=' + n.report_id : '#alerts', tag: 'alert-' + (n.report_id || n.id) }));
  }

  if (body.table === 'messages') {
    const { data: m } = await admin.from('messages').select('*').eq('id', body.id).single();
    if (!m) return json({ sent: 0 });
    const members = m.room === 'team' ? active.map((p: { id: string }) => p.id) : String(m.room).slice(3).split(':');
    const to = members.filter((id: string) => id !== m.sender_id && active.some((p: { id: string }) => p.id === id));
    const who = nameOf(m.sender_id);
    return json(await deliver(to, { title: m.room === 'team' ? who + ' · Team room' : who, body: m.body || '📷 Photo', url: '#chat=' + m.room, tag: 'chat-' + m.room }));
  }
  return json({ error: 'Unknown' }, 400);
});
