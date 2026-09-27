// Minimal Supabase client (Auth + REST + Storage) using fetch — no extra packages.
// Settings come from SUPABASE_URL / SUPABASE_ANON_KEY at build time (see scripts/build.mjs and .env.example).
// The anon key is public by design; the database rules (row-level security) protect the data.

/* global __SUPABASE_URL__, __SUPABASE_ANON_KEY__ */
export const SUPABASE_URL = (typeof __SUPABASE_URL__ !== 'undefined' ? __SUPABASE_URL__ : '').replace(/\/$/, '');
export const SUPABASE_KEY = typeof __SUPABASE_ANON_KEY__ !== 'undefined' ? __SUPABASE_ANON_KEY__ : '';
export const isConfigured = () => !!(SUPABASE_URL && SUPABASE_KEY);

const SESSION_KEY = 'let-report:session';
let session = readSession();
const listeners = new Set();

function readSession() {
  try { return JSON.parse(window.localStorage.getItem(SESSION_KEY)) || null; } catch (e) { return null; }
}
function writeSession(s) {
  session = s;
  try { s ? window.localStorage.setItem(SESSION_KEY, JSON.stringify(s)) : window.localStorage.removeItem(SESSION_KEY); } catch (e) { /* private mode */ }
  listeners.forEach(fn => fn(s));
}
function toSession(data) {
  return { access_token: data.access_token, refresh_token: data.refresh_token, expires_at: data.expires_at || Math.floor(Date.now() / 1000) + (data.expires_in || 3600), user: data.user };
}

export class ApiError extends Error {
  constructor(message, status, code) { super(message); this.status = status; this.code = code; }
}

async function raw(path, { method = 'GET', body, headers = {}, auth = true, isBlob = false } = {}) {
  if (!isConfigured()) throw new ApiError('The app is not connected to a database yet.', 0, 'not_configured');
  const h = { apikey: SUPABASE_KEY, ...headers };
  if (auth && session) h.Authorization = 'Bearer ' + session.access_token;
  if (body !== undefined && !isBlob) h['Content-Type'] = 'application/json';
  let res;
  try {
    res = await fetch(SUPABASE_URL + path, { method, headers: h, body: body === undefined ? undefined : isBlob ? body : JSON.stringify(body) });
  } catch (e) {
    throw new ApiError('No connection. Check your internet and try again.', 0, 'offline');
  }
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
  if (!res.ok) {
    const msg = (data && (data.msg || data.message || data.error_description || data.error)) || ('Request failed (' + res.status + ')');
    throw new ApiError(String(msg), res.status, data && (data.code || data.error_code || data.error));
  }
  return data;
}

// ───── Auth ─────
let refreshing = null;
async function ensureFresh() {
  if (!session) return;
  if (session.expires_at - 60 > Date.now() / 1000) return;
  if (!refreshing) {
    refreshing = raw('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: session.refresh_token }, auth: false })
      .then(d => writeSession(toSession(d)))
      .catch(e => { if (e.status === 400 || e.status === 401) writeSession(null); throw e; })
      .finally(() => { refreshing = null; });
  }
  await refreshing;
}

export const auth = {
  session: () => session,
  onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  async signIn(email, password) {
    const d = await raw('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password }, auth: false });
    writeSession(toSession(d));
    return session;
  },
  async signUp(email, password, name) {
    const d = await raw('/auth/v1/signup', { method: 'POST', body: { email, password, data: { name } }, auth: false });
    if (d && d.access_token) { writeSession(toSession(d)); return { session, needsConfirm: false }; }
    return { session: null, needsConfirm: true };   // email confirmation is switched on in Supabase
  },
  async signOut() {
    try { await raw('/auth/v1/logout', { method: 'POST' }); } catch (e) { /* already signed out */ }
    writeSession(null);
  },
  async resetPassword(email) {
    await raw('/auth/v1/recover', { method: 'POST', body: { email }, auth: false });
  },
};

// Authenticated request (refreshes the session first when it is about to expire).
async function request(path, opts) {
  await ensureFresh();
  try { return await raw(path, opts); }
  catch (e) {
    if (e.status === 401 && session) { writeSession(null); }
    throw e;
  }
}

// ───── Database (PostgREST) ─────
const qs = params => Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v)).join('&');

export const db = {
  select: (table, params = {}) => request('/rest/v1/' + table + '?' + qs({ select: '*', ...params })),
  insert: (table, rows, { returning = true } = {}) =>
    request('/rest/v1/' + table, { method: 'POST', body: rows, headers: { Prefer: returning ? 'return=representation' : 'return=minimal' } }),
  upsert: (table, rows) =>
    request('/rest/v1/' + table, { method: 'POST', body: rows, headers: { Prefer: 'resolution=merge-duplicates,return=minimal' } }),
  update: (table, match, patch) =>
    request('/rest/v1/' + table + '?' + qs(match), { method: 'PATCH', body: patch, headers: { Prefer: 'return=representation' } }),
  remove: (table, match) => request('/rest/v1/' + table + '?' + qs(match), { method: 'DELETE' }),
};

// ───── Storage ─────
export const storage = {
  async upload(bucket, path, blob) {
    await request('/storage/v1/object/' + bucket + '/' + path, { method: 'POST', body: blob, isBlob: true, headers: { 'Content-Type': blob.type || 'application/octet-stream', 'x-upsert': 'true' } });
    return path;
  },
  // Temporary links for private files. Returns { path: url }.
  async signedUrls(bucket, paths, expiresIn = 3600) {
    if (!paths.length) return {};
    const rows = await request('/storage/v1/object/sign/' + bucket, { method: 'POST', body: { expiresIn, paths } });
    const out = {};
    (rows || []).forEach(r => { if (r.signedURL) out[r.path] = SUPABASE_URL + '/storage/v1' + r.signedURL; });
    return out;
  },
};
