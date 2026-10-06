// Live chat (team room + 1-to-1) and discussion comments on troubles.
// Mixed into AppController (see the bottom of AppController.js), so `this` is the app.
// New messages arrive over Supabase Realtime; when the live connection is down the app
// asks for anything newer on every refresh, so nothing is missed.
import { repo, rowToMessage, rowToComment } from '../api/repo.js';
import { connectRealtime } from '../api/realtime.js';
import { toSmallJpeg } from '../utils/image.js';
import { nowIso } from '../utils/time.js';

export const TEAM_ROOM = 'team';
const LIVE_TABLES = ['messages', 'report_comments', 'reports', 'notifications', 'production_lines'];
// Tables from later database updates: only watched once the database has them, so a missing one
// cannot break the live connection for chat and everything else.
const LOT_TABLES = ['line_lots'], PLAN_TABLES = ['lot_events', 'lot_log', 'factory_settings'];
// Times come from the database ("…+00:00") and from this device ("…Z"): compare them as dates.
const ms = iso => Date.parse(iso) || 0;
const byTime = (a, b) => ms(a.t) - ms(b.t);

// Add rows (new or updated) to a list, by id, keeping it in time order.
function merge(list, rows) {
  if (!rows.length) return list;
  const map = new Map(list.map(x => [x.id, x]));
  rows.forEach(r => map.set(r.id, r));
  return [...map.values()].sort(byTime);
}

export const chatState = {
  messages: [], chatReads: {}, comments: [], online: {}, live: false,
  chatRoom: null, chatDrafts: {}, chatPhotos: {}, commentDrafts: {}, commentPhotos: {}, chatSending: false, commentSending: false,
};

export const chatMethods = {
  myId() { const s = this.state.session; return (s && s.user && s.user.id) || null; },
  dmRoom(otherId) { return 'dm:' + [this.myId(), otherId].sort().join(':'); },
  roomOther(room) { if (!room || room === TEAM_ROOM) return null; const ids = room.slice(3).split(':'); return ids.find(x => x !== this.myId()) || ids[0]; },
  profileById(id) { return this.state.profiles.find(p => p.id === id) || null; },
  nameOf(id) { const p = this.profileById(id); return p ? p.name : '—'; },

  // ───── Start / stop ─────
  async startLive() {
    if (this._rt || !this.myId()) return;
    this._chatFor = this.myId();
    try {
      const [messages, comments, chatReads] = await Promise.all([repo.loadMessages(), repo.loadComments(), repo.loadChatReads()]);
      this.setState({ messages, comments, chatReads });
      this.loadPhotoPaths([...messages, ...comments].map(x => x.photoPath));
    } catch (e) { /* tried again on the next refresh */ this._chatFor = null; return; }
    const me = this.me();
    this._rt = connectRealtime({
      tables: [...LIVE_TABLES, ...(this.state.lotsReady !== false ? LOT_TABLES : []), ...(this.state.planReady ? PLAN_TABLES : [])], presenceKey: this.myId(), presenceMeta: { name: me.name },
      onStatus: s => this.setState({ live: s === 'live' }),
      onPresence: online => this.setState({ online }),
      onChange: d => this.onLiveChange(d),
    });
  },
  stopLive() {
    if (this._rt) this._rt.close();
    this._rt = null; this._chatFor = null;
    this.setState({ ...chatState });
  },
  onLiveChange(d) {
    if (d.table === 'messages') {
      if (d.type === 'DELETE') { const id = d.old_record && d.old_record.id; this.setState(s => ({ messages: s.messages.filter(m => m.id !== id) })); return; }
      if (d.record) this.gotMessages([rowToMessage(d.record)]);
    } else if (d.table === 'report_comments') {
      if (d.type === 'DELETE') { const id = d.old_record && d.old_record.id; this.setState(s => ({ comments: s.comments.filter(c => c.id !== id) })); return; }
      if (d.record) this.gotComments([rowToComment(d.record)]);
    } else {
      // a report, alert or line changed somewhere: reload soon (several changes come together)
      clearTimeout(this._liveRefresh);
      this._liveRefresh = setTimeout(() => this.refresh(), 400);
    }
  },
  // Poll for anything newer (used on every refresh; cheap when there is nothing new).
  async syncChat() {
    if (!this._chatFor) { this.startLive(); return; }
    const last = arr => (arr.length ? arr[arr.length - 1].t : null);
    try {
      const [m, c] = await Promise.all([repo.loadMessages(last(this.state.messages.filter(x => typeof x.id === 'number'))), repo.loadComments(last(this.state.comments.filter(x => typeof x.id === 'number')))]);
      this.gotMessages(m); this.gotComments(c);
    } catch (e) { /* next time */ }
  },

  gotMessages(rows) {
    if (!rows.length) return;
    const me = this.myId();
    const fresh = rows.filter(r => !this.state.messages.some(m => m.id === r.id));
    this.setState(s => ({ messages: merge(s.messages, rows) }));
    this.loadPhotoPaths(rows.map(r => r.photoPath));
    const s = this.state;
    const viewing = s.screen === 'chat' && document.visibilityState !== 'hidden';
    fresh.filter(r => r.senderId !== me).forEach(r => {
      if (viewing && s.chatRoom === r.room) this.markRoomRead(r.room, r.t);
      else this.toast(this.nameOf(r.senderId) + (r.room === TEAM_ROOM ? ' · ' + this.T().chat.team : '') + ': ' + (r.body || this.T().chat.photo).slice(0, 80));
    });
  },
  gotComments(rows) {
    if (!rows.length) return;
    this.setState(s => ({ comments: merge(s.comments, rows) }));
    this.loadPhotoPaths(rows.map(r => r.photoPath));
  },
  async loadPhotoPaths(paths) {
    const have = this.state.photoUrls;
    const need = [...new Set(paths.filter(p => p && !have[p]))];
    if (!need.length) return;
    try { const urls = await repo.photoUrls(need); this.setState(s => ({ photoUrls: { ...s.photoUrls, ...urls } })); } catch (e) { /* next time */ }
  },

  // ───── Chat ─────
  unreadIn(room) {
    const me = this.myId(), since = ms(this.state.chatReads[room]);
    return this.state.messages.filter(m => m.room === room && m.senderId !== me && ms(m.t) > since).length;
  },
  chatUnread() {
    const me = this.myId(), reads = this.state.chatReads;
    return this.state.messages.filter(m => m.senderId !== me && ms(m.t) > ms(reads[m.room])).length;
  },
  openRoom(room) {
    this.setState({ chatRoom: room });
    if (this.state.screen !== 'chat') this.go('chat');
    this.markRoomRead(room);
  },
  openChatWith(id) { this.openRoom(id ? this.dmRoom(id) : TEAM_ROOM); },
  closeRoom() { this.setState({ chatRoom: null }); },
  markRoomRead(room, at) {
    const inRoom = this.state.messages.filter(m => m.room === room);
    const t = at || (inRoom.length ? inRoom[inRoom.length - 1].t : nowIso());
    if (ms(this.state.chatReads[room]) >= ms(t)) return;
    this.setState(s => ({ chatReads: { ...s.chatReads, [room]: t } }));
    repo.markRoomRead(room, t).catch(() => {});
  },
  setChatDraft(room, text) { this.setState(s => ({ chatDrafts: { ...s.chatDrafts, [room]: text } })); },
  async pickPhoto(file, key, room) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    try {
      const small = await toSmallJpeg(url, 1280);
      if (!small) throw new Error(this.T().chat.notPhoto);
      this.setState(s => ({ [key]: { ...s[key], [room]: small } }));
    } catch (e) { this.toast(e.message); }
    finally { URL.revokeObjectURL(url); }
  },
  clearPhoto(key, room) { this.setState(s => ({ [key]: { ...s[key], [room]: null } })); },

  async sendChat() {
    const room = this.state.chatRoom; if (!room || this.state.chatSending) return;
    const body = (this.state.chatDrafts[room] || '').trim(), photo = this.state.chatPhotos[room];
    if (!body && !photo) return;
    const tmp = { id: 'tmp-' + Date.now(), room, senderId: this.myId(), body, photoPath: null, localPhoto: photo || null, t: nowIso(), sending: true };
    this.setState(s => ({ chatSending: true, messages: [...s.messages, tmp], chatDrafts: { ...s.chatDrafts, [room]: '' }, chatPhotos: { ...s.chatPhotos, [room]: null } }));
    try {
      const photoPath = photo ? await repo.uploadImage(photo, 'chat') : null;
      if (photo && photoPath) this.setState(s => ({ photoUrls: { ...s.photoUrls, [photoPath]: photo } }));
      const saved = await repo.sendMessage(room, body, photoPath);
      this.setState(s => ({ chatSending: false, messages: merge(s.messages.filter(m => m.id !== tmp.id), [saved]) }));
      this.markRoomRead(room, saved.t);
    } catch (e) {
      // put the text back so nothing typed is lost
      this.setState(s => ({ chatSending: false, messages: s.messages.filter(m => m.id !== tmp.id), chatDrafts: { ...s.chatDrafts, [room]: body }, chatPhotos: { ...s.chatPhotos, [room]: photo || null } }));
      this.toast(e.message);
    }
  },
  async deleteMessage(id) {
    const before = this.state.messages;
    this.setState({ messages: before.filter(m => m.id !== id) });
    try { await repo.deleteMessage(id); } catch (e) { this.setState({ messages: before }); this.toast(e.message); }
  },

  // ───── Discussion comments ─────
  commentsFor(reportId) { return this.state.comments.filter(c => c.reportId === reportId); },
  setCommentDraft(reportId, text) { this.setState(s => ({ commentDrafts: { ...s.commentDrafts, [reportId]: text } })); },
  async sendComment(reportId) {
    if (this.state.commentSending) return;
    const body = (this.state.commentDrafts[reportId] || '').trim(), photo = this.state.commentPhotos[reportId];
    if (!body && !photo) return;
    const r = this.state.reports.find(x => x.id === reportId); if (!r) return;
    const tmp = { id: 'tmp-' + Date.now(), reportId, authorId: this.myId(), body, photoPath: null, localPhoto: photo || null, t: nowIso(), sending: true };
    this.setState(s => ({ commentSending: true, comments: [...s.comments, tmp], commentDrafts: { ...s.commentDrafts, [reportId]: '' }, commentPhotos: { ...s.commentPhotos, [reportId]: null } }));
    try {
      const photoPath = photo ? await repo.uploadImage(photo, 'comments') : null;
      if (photo && photoPath) this.setState(s => ({ photoUrls: { ...s.photoUrls, [photoPath]: photo } }));
      const saved = await repo.addComment(reportId, body, photoPath);
      this.setState(s => ({ commentSending: false, comments: merge(s.comments.filter(c => c.id !== tmp.id), [saved]) }));
      // Alert: the reporter, everyone who commented before, and the role the trouble is with now.
      const me = this.myId();
      const people = [...new Set([r.byId, ...this.commentsFor(reportId).map(c => c.authorId)])].filter(id => id && id !== me);
      const roles = r.status !== 'closed' && r.level ? [r.level] : [];
      if (people.length || roles.length) {
        this.addNote({ id: reportId, icon: 'message-circle', tone: 'blue', roles, userIds: people,
          text: this.me().name + ' ' + this.T().chat.commented + ' ' + reportId + ': ' + (body || this.T().chat.photo).slice(0, 80) });
      }
    } catch (e) {
      this.setState(s => ({ commentSending: false, comments: s.comments.filter(c => c.id !== tmp.id), commentDrafts: { ...s.commentDrafts, [reportId]: body }, commentPhotos: { ...s.commentPhotos, [reportId]: photo || null } }));
      this.toast(e.message);
    }
  },
  async deleteComment(id) {
    const before = this.state.comments;
    this.setState({ comments: before.filter(c => c.id !== id) });
    try { await repo.deleteComment(id); } catch (e) { this.setState({ comments: before }); this.toast(e.message); }
  },
};
