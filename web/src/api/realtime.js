// Live updates from Supabase Realtime over one WebSocket (protocol 1.0.0, JSON messages).
// - postgres_changes: new chat messages, comments, and changes to reports / alerts / lines
// - presence: who is online right now
// Reconnects by itself; the app keeps polling as a fallback, so nothing is lost while offline.
import { SUPABASE_URL, SUPABASE_KEY, auth } from './supabase.js';

const HEARTBEAT_MS = 25000;
const TOPIC = 'realtime:let-report';

export function connectRealtime({ tables, presenceKey, presenceMeta, onChange, onPresence, onStatus }) {
  if (!SUPABASE_URL || typeof window.WebSocket === 'undefined') return { close() {} };
  const url = SUPABASE_URL.replace(/^http/, 'ws') + '/realtime/v1/websocket?apikey=' + encodeURIComponent(SUPABASE_KEY) + '&vsn=1.0.0';
  let ws = null, ref = 0, joinRef = null, beat = null, retry = null, tries = 0, closed = false, online = {};
  const token = () => { const s = auth.session(); return s ? s.access_token : SUPABASE_KEY; };
  const send = (topic, event, payload, withJoin = true) => {
    if (!ws || ws.readyState !== 1) return;
    ref += 1;
    ws.send(JSON.stringify({ topic, event, payload, ref: String(ref), join_ref: withJoin ? joinRef : null }));
  };
  const status = s => { if (onStatus) onStatus(s); };

  function open() {
    if (closed) return;
    try { ws = new window.WebSocket(url); } catch (e) { schedule(); return; }
    ws.onopen = () => {
      tries = 0; ref += 1; joinRef = String(ref);
      ws.send(JSON.stringify({ topic: TOPIC, event: 'phx_join', ref: joinRef, join_ref: joinRef, payload: {
        config: {
          broadcast: { ack: false, self: false },
          presence: { enabled: !!presenceKey, key: presenceKey || '' },
          postgres_changes: tables.map(t => ({ event: '*', schema: 'public', table: t })),
          private: false,
        },
        access_token: token(),
      } }));
      clearInterval(beat);
      beat = setInterval(() => send('phoenix', 'heartbeat', {}, false), HEARTBEAT_MS);
    };
    ws.onmessage = m => {
      let msg; try { msg = JSON.parse(m.data); } catch (e) { return; }
      const { event, payload } = msg;
      if (event === 'phx_reply' && msg.ref === joinRef) {
        if (payload && payload.status === 'ok') {
          status('live');
          if (presenceKey) send(TOPIC, 'presence', { type: 'presence', event: 'track', payload: presenceMeta || {} });
        } else status('error');
      } else if (event === 'postgres_changes' && payload && payload.data) {
        onChange(payload.data);
      } else if (event === 'presence_state' && onPresence) {
        online = {}; Object.keys(payload || {}).forEach(k => { online[k] = true; }); onPresence({ ...online });
      } else if (event === 'presence_diff' && onPresence) {
        Object.keys((payload && payload.joins) || {}).forEach(k => { online[k] = true; });
        Object.keys((payload && payload.leaves) || {}).forEach(k => { delete online[k]; });
        onPresence({ ...online });
      } else if (event === 'phx_error' || event === 'phx_close') {
        try { ws.close(); } catch (e) { /* already closed */ }
      }
    };
    ws.onclose = () => { clearInterval(beat); status('offline'); online = {}; if (onPresence) onPresence({}); schedule(); };
    ws.onerror = () => { /* onclose follows */ };
  }
  function schedule() {
    if (closed) return;
    clearTimeout(retry);
    tries += 1;
    retry = setTimeout(open, Math.min(30000, 1000 * 2 ** Math.min(tries, 5)));
  }
  // Keep the socket's sign-in fresh when the session token is renewed.
  const off = auth.onChange(s => { if (s) send(TOPIC, 'access_token', { access_token: s.access_token }); });

  open();
  return {
    close() { closed = true; off(); clearInterval(beat); clearTimeout(retry); if (ws) { ws.onclose = null; try { ws.close(); } catch (e) { /* ignore */ } } },
  };
}
