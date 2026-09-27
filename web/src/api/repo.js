// Data access for Let Report: turns database rows into the app's report objects and back.
import { db, storage, functions } from './supabase.js';

const PHOTO_BUCKET = 'photos';

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
    const [profiles, reports, notes, reads, ticks, lines] = await Promise.all([
      db.select('profiles', { order: 'created_at.asc' }),
      db.select('reports', { order: 'created_at.desc', limit: 500 }),
      db.select('notifications', { order: 'created_at.desc', limit: 200 }),
      db.select('notification_reads', { select: 'notification_id' }),
      db.select('checklist_ticks', { day: 'eq.' + today() }),
      db.select('production_lines', { order: 'sort.asc,created_at.asc' }),
    ]);
    return {
      profiles,
      reports: reports.map(rowToReport),
      notes: notes.map(n => ({ key: n.id, id: n.report_id, icon: n.icon, tone: n.tone, text: n.text, t: n.created_at, roles: n.roles || [], userIds: n.user_ids || [], by: n.created_by })),
      readIds: reads.map(r => r.notification_id),
      ticks: ticks.map(t => t.item),
      lines: lines.map(rowToLine),
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
  async updateLine(id, patch) { const rows = await db.update('production_lines', { id: 'eq.' + id }, lineToRow(patch)); return rows && rows[0] ? rowToLine(rows[0]) : null; },
  async addLine(line) { const [row] = await db.insert('production_lines', lineToRow(line)); return rowToLine(row); },
  removeLine(id) { return db.remove('production_lines', { id: 'eq.' + id }); },
  // Reports store the line name as their location; keep them in step when a line is renamed.
  renameLoc(from, to) { return db.update('reports', { loc: 'eq.' + from }, { loc: to }); },

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
    sort: r.sort, statusSince: r.status_since, updatedBy: r.updated_by_name, updatedAt: r.updated_at };
}
function lineToRow(l) {
  const map = { name: 'name', type: 'type', product: 'product', qty: 'qty', target: 'target', status: 'status', note: 'note', sort: 'sort', updatedBy: 'updated_by_name' };
  const row = {}; Object.entries(map).forEach(([k, c]) => { if (l[k] !== undefined) row[c] = l[k]; }); return row;
}

function today() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function randomId() {
  try { return window.crypto.randomUUID(); } catch (e) { return Date.now().toString(36) + Math.random().toString(36).slice(2, 10); }
}
