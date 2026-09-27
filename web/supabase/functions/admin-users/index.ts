// Let Report: manager-only account actions (add a person, remove a person, set a new password).
// Runs on Supabase with the service role; every request is checked: the caller must be an active plant manager.
// Deploy: supabase functions deploy admin-users
import { createClient } from 'jsr:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const ROLES = ['qc', 'qa', 'supervisor', 'manager'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Use POST' }, 405);

  const url = Deno.env.get('SUPABASE_URL')!;
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

  // Who is calling?
  const token = (req.headers.get('Authorization') || '').replace('Bearer ', '');
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData?.user) return json({ error: 'Please sign in again.' }, 401);
  const { data: me } = await admin.from('profiles').select('role, active').eq('id', userData.user.id).single();
  if (!me || me.role !== 'manager' || !me.active) return json({ error: 'Only a plant manager can do this.' }, 403);

  let body: Record<string, string>;
  try { body = await req.json(); } catch { return json({ error: 'Bad request' }, 400); }

  if (body.action === 'create') {
    const email = String(body.email || '').trim().toLowerCase();
    const name = String(body.name || '').trim();
    const password = String(body.password || '');
    const role = ROLES.includes(body.role) ? body.role : 'qc';
    if (!email || !name) return json({ error: 'Enter a name and an email.' }, 400);
    if (password.length < 6) return json({ error: 'The password needs at least 6 characters.' }, 400);
    const { data, error } = await admin.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { name }, app_metadata: { role },
    });
    if (error) return json({ error: /already/i.test(error.message) ? 'That email already has an account.' : error.message }, 400);
    return json({ id: data.user?.id });
  }

  if (body.action === 'delete') {
    const id = String(body.id || '');
    if (!id) return json({ error: 'Missing person.' }, 400);
    if (id === userData.user.id) return json({ error: 'You cannot remove your own account.' }, 400);
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) return json({ error: /manager/i.test(error.message) ? 'Keep at least one active plant manager.' : error.message }, 400);
    return json({ ok: true });
  }

  if (body.action === 'password') {
    const id = String(body.id || '');
    const password = String(body.password || '');
    if (!id || password.length < 6) return json({ error: 'The password needs at least 6 characters.' }, 400);
    const { error } = await admin.auth.admin.updateUserById(id, { password });
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true });
  }

  return json({ error: 'Unknown action' }, 400);
});
