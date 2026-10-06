// Data access for Let Report: turns database rows into the app's report objects and back.
import { db, storage, functions } from './supabase.js';

const PHOTO_BUCKET = 'photos';
// False when the database has no lot table yet (migration 0008 not run): lot features then stay off.
let lotsReady = true;

// ───── Reports ─────
export function rowToReport(r) {
  return {
    id: r.id, title: r.title, cat: r.cat, sev: r.sev, status: r.status, level: r.level, loc: r.loc,
    by: r.by_name, byId: r.by_id, createdAt: r.created_at, updatedAt: r.updated_at,
    photoPath: r.photo_path, signaturePath: r.signature_path, signedAt: r.signed_at,
    photo: r.photo_path ? 'IMG_' + String(r.id).replace('TR-', '') + '.jpg' : 'No photo',
    ptype: r.ptype, pname: r.pname, lot: r.lot, qty: r.qty, unit: r.unit, hold: r.hold, holdCheck: r.hold_check,
    urgent: r.urgent, support: r.support || [], desc: r.description, action: r.action, suggestion: r.suggestion,
    voice: r.voice, capa: r.capa, needsApproval: r.needs_approval, tl: r.tl || [],
  };
}

const FIELDS = {
  title: 'title', cat: 'cat', sev: 'sev', status: 'status', level: 'level', loc: 'loc', by: 'by_name',
  photoPath: 'photo_path', signaturePath: 'signature_path', signedAt: 'signed_at',
  ptype: 'ptype', pname: 'pname', lot: 'lot', qty: 'qty', unit: 'unit', hold: 'hold', holdCheck: 'hold_check',
  urgent: 'urgent', support: 'support', desc: 'description', action: 'action', suggestion: 'suggestion',
  voice: 'voice', capa: 'capa', needsApproval: 'needs_approval', tl: 'tl', createdAt: 'created_at',
};

export function reportToRow(r, only) {
  const row = {};
  Object.entries(FIELDS).forEach(([k, col]) => {
    if (only && !only.includes(k)) return;
    if (r[k] !== undefined) row[col] = r[k] === undefined ? null : r[k];
  });
  return row;
}

// Only the fields that changed, so two people editing different parts don't overwrite each other.
export function diffReport(before, after) {
  const changed = Object.keys(FIELDS).filter(k => JSON.stringify(before[k]) !== JSON.stringify(after[k]));
  return reportToRow(after, changed);
}

export const repo = {
  async loadAll() {
    const [profiles, reports, notes, reads, ticks, lines, lots, plans] = await Promise.all([
      db.select('profiles', { order: 'created_at.asc' }),
      db.select('reports', { order: 'created_at.desc', limit: 500 }),
      db.select('notifications', { order: 'created_at.desc', limit: 200 }),
      db.select('notification_reads', { select: 'notification_id' }),
      db.select('checklist_ticks', { day: 'eq.' + today() }),
      db.select('production_lines', { order: 'sort.asc,created_at.asc' }),
      // Optional: if the lot table is missing (migration not run yet), everything else still loads.
      db.select('line_lots', { order: 'ended_at.desc.nullsfirst,started_at.desc', limit: 300 }).catch(e => { console.warn('line_lots:', e.message); lotsReady = false; return null; }),
      // Optional: the production plan, lot events and change log come with migration 0011.
      db.select('factory_settings', { id: 'eq.1' }).catch(e => { console.warn('factory_settings:', e.message); return null; }),
    ]);
    if (lots) lotsReady = true;
    return {
      profiles,
      reports: reports.map(rowToReport),
      notes: notes.map(n => ({ key: n.id, id: n.report_id, icon: n.icon, tone: n.tone, text: n.text, t: n.created_at, roles: n.roles || [], userIds: n.user_ids || [], by: n.created_by })),
      readIds: reads.map(r => r.notification_id),
      ticks: ticks.map(t => t.item),
      lines: lines.map(rowToLine),
      lots: (lots || []).map(rowToLot),
      lotsReady,
      plan: plans && plans[0] ? rowToPlan(plans[0]) : null,
    };
  },

  async createReport(report) {
    const [row] = await db.insert('reports', reportToRow(report));
    return rowToReport(row);
  },

  async updateReport(before, after) {
    const patch = diffReport(before, after);
    if (!Object.keys(patch).length) return after;
    const rows = await db.update('reports', { id: 'eq.' + after.id }, patch);
    return rows && rows[0] ? rowToReport(rows[0]) : after;
  },

  async deleteReports(ids) { return db.remove('reports', { id: 'in.(' + ids.join(',') + ')' }); },

  addNote(note) {
    return db.insert('notifications', { report_id: note.id || null, icon: note.icon, tone: note.tone, text: note.text, roles: note.roles || [], user_ids: note.userIds || [] }, { returning: false });
  },
  markRead(noteId) { return db.upsert('notification_reads', { notification_id: noteId }); },

  setTick(item, on) {
    return on ? db.upsert('checklist_ticks', { item, day: today() })
      : db.remove('checklist_ticks', { item: 'eq.' + item, day: 'eq.' + today() });
  },

  // ───── Production lines ─────
  async updateLine(id, patch) { const rows = await withoutMissing(lineToRow(patch), row => db.update('production_lines', { id: 'eq.' + id }, row)); return rows && rows[0] ? rowToLine(rows[0]) : null; },
  async addLine(line) { const [row] = await withoutMissing(lineToRow(line), r => db.insert('production_lines', r)); return rowToLine(row); },
  removeLine(id) { return db.remove('production_lines', { id: 'eq.' + id }); },
  // Reports store the line name as their location; keep them in step when a line is renamed.
  renameLoc(from, to) { return db.update('reports', { loc: 'eq.' + from }, { loc: to }); },
  // The record of a lot that ended (the line then goes into CIP).
  async addLot(lot) { const [row] = await withoutMissing(lotToRow(lot), r => db.insert('line_lots', r)); return rowToLot(row); },
  renameLotsLine(lineId, name) { return db.update('line_lots', { line_id: 'eq.' + lineId }, { line_name: name }); },
  async updateLot(id, patch) { const rows = await withoutMissing(lotToRow(patch), r => db.update('line_lots', { id: 'eq.' + id }, r)); return rows && rows[0] ? rowToLot(rows[0]) : null; },
  removeLot(id) { return db.remove('line_lots', { id: 'eq.' + id }); },
  // Events in a lot, and the change log (written by the database on every create, edit and delete).
  async lotDetail(lotId) {
    const [events, log] = await Promise.all([
      db.select('lot_events', { lot_id: 'eq.' + lotId, order: 'at.asc,id.asc' }),
      db.select('lot_log', { lot_id: 'eq.' + lotId, order: 'at.desc,id.desc', limit: 200 }),
    ]);
    return { events: events.map(rowToEvent), log: log.map(rowToLog) };
  },
  async addEvent(ev) { const [row] = await db.insert('lot_events', eventToRow(ev)); return rowToEvent(row); },
  async updateEvent(id, patch) { const rows = await db.update('lot_events', { id: 'eq.' + id }, eventToRow(patch)); return rows && rows[0] ? rowToEvent(rows[0]) : null; },
  removeEvent(id) { return db.remove('lot_events', { id: 'eq.' + id }); },
  // Move the start (or finish) event of a lot when its time is corrected elsewhere.
  moveEvent(lotId, kind, at) { return db.update('lot_events', { lot_id: 'eq.' + lotId, kind: 'eq.' + kind }, { at }); },
  // Production plan: one row for the factory; supervisors and the plant manager can change it.
  async updatePlan(patch) { const rows = await withoutMissing(planToRow(patch), r => db.update('factory_settings', { id: 'eq.1' }, r)); return rows && rows[0] ? rowToPlan(rows[0]) : null; },
  async planLog() { const rows = await db.select('lot_log', { entity: 'eq.plan', order: 'at.desc', limit: 30 }); return rows.map(rowToLog); },

  updateProfile(id, patch) { return db.update('profiles', { id: 'eq.' + id }, patch); },
  // Profile picture: stored in the public "avatars" bucket, in the person's own folder.
  async uploadAvatar(userId, dataUrl) {
    const blob = await (await fetch(dataUrl)).blob();
    const path = userId + '/' + randomId() + '.jpg';
    await storage.upload('avatars', path, blob);
    return storage.publicUrl('avatars', path);
  },
  // Manager-only account actions (server-side function "admin-users").
  createUser: form => functions.invoke('admin-users', { action: 'create', ...form }),
  deleteUser: id => functions.invoke('admin-users', { action: 'delete', id }),
  setPassword: (id, password) => functions.invoke('admin-users', { action: 'password', id, password }),

  // ───── Chat ─────
  // Newest messages in my rooms (the database only returns rooms I'm in). `since` = only newer ones.
  async loadMessages(since) {
    const rows = await db.select('messages', { order: 'created_at.desc', limit: 400, ...(since ? { created_at: 'gt.' + since } : {}) });
    return rows.map(rowToMessage).reverse();
  },
  async sendMessage(room, body, photoPath) {
    const [row] = await db.insert('messages', { room, body: body || '', photo_path: photoPath || null });
    return rowToMessage(row);
  },
  deleteMessage(id) { return db.remove('messages', { id: 'eq.' + id }); },
  async loadChatReads() { const rows = await db.select('chat_reads'); const out = {}; rows.forEach(r => { out[r.room] = r.read_at; }); return out; },
  markRoomRead(room, at) { return db.upsert('chat_reads', { room, read_at: at }); },

  // ───── Push notifications ─────
  async pushKey() { const rows = await db.select('app_settings', { key: 'eq.vapid_public_key' }); return rows[0] ? rows[0].value : null; },
  savePushSubscription(row) { return db.upsert('push_subscriptions', { ...row, updated_at: new Date().toISOString() }); },
  removePushSubscription(endpoint) { return db.remove('push_subscriptions', { endpoint: 'eq.' + endpoint }); },
  testPush(text) { return functions.invoke('push', { action: 'test', text }); },

  // ───── Discussion comments on a trouble ─────
  async loadComments(since) {
    const rows = await db.select('report_comments', { order: 'created_at.desc', limit: 1000, ...(since ? { created_at: 'gt.' + since } : {}) });
    return rows.map(rowToComment).reverse();
  },
  async addComment(reportId, body, photoPath) {
    const [row] = await db.insert('report_comments', { report_id: reportId, body: body || '', photo_path: photoPath || null });
    return rowToComment(row);
  },
  deleteComment(id) { return db.remove('report_comments', { id: 'eq.' + id }); },

  async uploadImage(dataUrl, folder) {
    const blob = await (await fetch(dataUrl)).blob();
    const ext = blob.type === 'image/png' ? 'png' : 'jpg';
    const path = folder + '/' + today() + '/' + randomId() + '.' + ext;
    return storage.upload(PHOTO_BUCKET, path, blob);
  },
  photoUrls(paths) { return storage.signedUrls(PHOTO_BUCKET, paths, 60 * 60 * 6); },
};

export function rowToMessage(r) { return { id: r.id, room: r.room, senderId: r.sender_id, body: r.body || '', photoPath: r.photo_path, t: r.created_at }; }
export function rowToComment(r) { return { id: r.id, reportId: r.report_id, authorId: r.author_id, body: r.body || '', photoPath: r.photo_path, t: r.created_at }; }

// ───── Production lines ─────
export function rowToLine(r) {
  return { id: r.id, name: r.name, type: r.type, product: r.product, qty: r.qty, target: r.target, status: r.status, note: r.note,
    sort: r.sort, statusSince: r.status_since, updatedBy: r.updated_by_name, updatedAt: r.updated_at,
    lot: r.lot || '', lotStartedAt: r.lot_started_at || null, cipUntil: r.cip_until || null, cipReason: r.cip_reason || '',
    maxRunHours: r.max_run_hours || 36, fillEvery: r.fill_cip_every_hours || null, planHours: r.lot_plan_hours != null ? Number(r.lot_plan_hours) : null,
    fillSince: r.fill_since || null, fillCips: r.fill_cips || 0, hasRunLimits: r.max_run_hours !== undefined, cipStartedAt: r.cip_started_at || null, currentLotId: r.current_lot_id || null };
}
function lineToRow(l) {
  const map = { name: 'name', type: 'type', product: 'product', qty: 'qty', target: 'target', status: 'status', note: 'note', sort: 'sort', updatedBy: 'updated_by_name',
    lot: 'lot', lotStartedAt: 'lot_started_at', cipUntil: 'cip_until', cipReason: 'cip_reason',
    maxRunHours: 'max_run_hours', fillEvery: 'fill_cip_every_hours', planHours: 'lot_plan_hours', fillSince: 'fill_since', fillCips: 'fill_cips', cipStartedAt: 'cip_started_at', currentLotId: 'current_lot_id' };
  const row = {}; Object.entries(map).forEach(([k, c]) => { if (l[k] !== undefined) row[c] = l[k]; }); return row;
}

// If the database is older than the app (a migration not run yet), PostgREST answers
// "Could not find the 'x' column": leave those columns out and try again, so the rest still saves.
async function withoutMissing(row, send) {
  let r = { ...row };
  for (let i = 0; i < 12; i++) {
    try { return await send(r); } catch (e) {
      const m = e.code === 'PGRST204' && /'([a-z_]+)' column/.exec(e.message || '');
      if (!m || !(m[1] in r)) throw e;
      console.warn('Column missing in the database, not saved:', m[1]);
      delete r[m[1]]; r = { ...r };
      if (!Object.keys(r).length) return [];
    }
  }
  return send(r);
}

// ───── Lot records (a lot that ended on a line) ─────
export function rowToLot(r) {
  return { id: r.id, lineId: r.line_id, lineName: r.line_name, product: r.product, lot: r.lot, startedAt: r.started_at, endedAt: r.ended_at,
    qty: r.qty, target: r.target, cipHours: Number(r.cip_hours), cipReason: r.cip_reason, note: r.note || '', endedBy: r.ended_by, endedByName: r.ended_by_name || '',
    planHours: r.plan_hours != null ? Number(r.plan_hours) : null, fillCips: r.fill_cips || 0, overNote: r.over_note || '', startedByName: r.started_by_name || '' };
}
function lotToRow(l) {
  const map = { lineId: 'line_id', lineName: 'line_name', product: 'product', lot: 'lot', startedAt: 'started_at', endedAt: 'ended_at', qty: 'qty', target: 'target',
    cipHours: 'cip_hours', cipReason: 'cip_reason', note: 'note', endedBy: 'ended_by', endedByName: 'ended_by_name',
    planHours: 'plan_hours', fillCips: 'fill_cips', overNote: 'over_note', startedByName: 'started_by_name' };
  const row = {}; Object.entries(map).forEach(([k, c]) => { if (l[k] !== undefined) row[c] = l[k]; }); return row;
}

function today() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function randomId() {
  try { return window.crypto.randomUUID(); } catch (e) { return Date.now().toString(36) + Math.random().toString(36).slice(2, 10); }
}

// ───── Lot events and the change log ─────
export function rowToEvent(r) {
  return { id: r.id, lotId: r.lot_id, kind: r.kind, at: r.at, hours: r.hours != null ? Number(r.hours) : null, detail: r.detail || '', note: r.note || '', byName: r.by_name || '', updatedAt: r.updated_at };
}
function eventToRow(e) {
  const map = { lotId: 'lot_id', kind: 'kind', at: 'at', hours: 'hours', detail: 'detail', note: 'note', byName: 'by_name' };
  const row = {}; Object.entries(map).forEach(([k, c]) => { if (e[k] !== undefined) row[c] = e[k]; }); return row;
}
export function rowToLog(r) {
  return { id: r.id, lotId: r.lot_id, lot: r.lot || '', lineName: r.line_name || '', entity: r.entity, eventKind: r.event_kind || '', action: r.action, changes: r.changes || {}, byName: r.by_name || '', at: r.at };
}

// ───── Production plan ─────
export function rowToPlan(r) {
  return { runChoices: (r.run_choices || []).map(Number).filter(n => n > 0).sort((a, b) => a - b), runMax: r.run_max_hours, cipHours: Number(r.cip_hours),
    fillCipHours: Number(r.fill_cip_hours), fillEvery: r.fill_every_hours, updatedByName: r.updated_by_name || '', updatedAt: r.updated_at, siteName: r.site_name || '' };
}
function planToRow(p) {
  const map = { runChoices: 'run_choices', runMax: 'run_max_hours', cipHours: 'cip_hours', fillCipHours: 'fill_cip_hours', fillEvery: 'fill_every_hours', updatedByName: 'updated_by_name', siteName: 'site_name' };
  const row = {}; Object.entries(map).forEach(([k, c]) => { if (p[k] !== undefined) row[c] = p[k]; }); return row;
}
