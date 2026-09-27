// What the Chat screen and a trouble's Discussion section show (built from app state on each render).
import { TEAM_ROOM } from './chat.js';
import { timeLabel, daysAgo } from '../utils/time.js';

const hm = iso => { const d = new Date(iso); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
const dayLabel = (iso, C) => { const a = daysAgo(iso); return a === 0 ? C.today : a === 1 ? C.yesterday : new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }); };

// Messages → bubbles, with a day divider when the day changes and the name shown once per run.
function bubbles(app, list, C, canDelete) {
  const me = app.myId(), s = app.state, out = [];
  let lastDay = null, lastBy = null;
  list.forEach(m => {
    const by = m.senderId || m.authorId, day = new Date(m.t).toDateString();
    if (day !== lastDay) { out.push({ key: 'd' + m.t, divider: true, label: dayLabel(m.t, C) }); lastDay = day; lastBy = null; }
    const mine = by === me, p = app.profileById(by);
    out.push({ key: m.id, mine, first: by !== lastBy, name: mine ? C.you : (p ? p.name : '—'), avatar: app.avatarOf(p ? p.name : '?', p),
      body: m.body, photo: m.localPhoto || (m.photoPath ? s.photoUrls[m.photoPath] || null : null), hasPhoto: !!(m.localPhoto || m.photoPath),
      time: m.sending ? C.sending : hm(m.t), sending: !!m.sending,
      del: mine && !m.sending && canDelete ? () => canDelete(m.id) : null });
    lastBy = by;
  });
  return out;
}

export function buildChatView(app, T) {
  const s = app.state, C = T.chat, me = app.myId();
  const lastIn = room => { let last = null; s.messages.forEach(m => { if (m.room === room) last = m; }); return last; };
  const preview = m => (m ? (m.senderId === me ? C.you + ': ' : '') + (m.body || C.photo) : '');
  const q = (s.chatQ || '').trim().toLowerCase();

  const team = lastIn(TEAM_ROOM);
  const teamRow = { room: TEAM_ROOM, team: true, name: C.team, sub: team ? preview(team) : C.teamSub, time: team ? timeLabel(team.t) : '', unread: app.unreadIn(TEAM_ROOM),
    on: s.chatRoom === TEAM_ROOM, open: () => app.openRoom(TEAM_ROOM) };
  const people = app.activeProfiles().filter(p => p.id !== me && (!q || (p.name || '').toLowerCase().includes(q))).map(p => {
    const room = app.dmRoom(p.id), last = lastIn(room);
    return { room, name: p.name, avatar: app.avatarOf(p.name, p), role: T.short[p.role] || '', online: !!s.online[p.id], sub: last ? preview(last) : (T.roles && T.roles[p.role]) || T.short[p.role] || '',
      time: last ? timeLabel(last.t) : '', lastT: last ? last.t : '', unread: app.unreadIn(room), on: s.chatRoom === room, open: () => app.openRoom(room) };
  }).sort((a, b) => ((Date.parse(b.lastT) || 0) - (Date.parse(a.lastT) || 0)) || a.name.localeCompare(b.name));

  const room = s.chatRoom, other = room && room !== TEAM_ROOM ? app.profileById(app.roomOther(room)) : null;
  const inRoom = room ? s.messages.filter(m => m.room === room) : [];
  const onlineCount = Object.keys(s.online).filter(id => id !== me).length;
  const thread = room ? {
    team: room === TEAM_ROOM, title: room === TEAM_ROOM ? C.team : (other ? other.name : '—'), avatar: other ? app.avatarOf(other.name, other) : null,
    sub: room === TEAM_ROOM ? C.teamSub + (onlineCount ? ' · ' + onlineCount + ' ' + C.online.toLowerCase() : '') : other ? (s.online[other.id] ? C.online : (T.short[other.role] || '')) : '',
    online: !!(other && s.online[other.id]),
    items: bubbles(app, inRoom, C, id => app.deleteMessage(id)), empty: !inRoom.length,
    composer: composer(app, C, C.write, s.chatDrafts[room] || '', s.chatPhotos[room], s.chatSending,
      text => app.setChatDraft(room, text), f => app.pickPhoto(f, 'chatPhotos', room), () => app.clearPhoto('chatPhotos', room), () => app.sendChat()),
    back: () => app.closeRoom(),
  } : null;

  return {
    teamRow, people, thread, hasRoom: !!room, q: s.chatQ || '', onQ: e => app.setState({ chatQ: e.target.value }),
    live: s.live, unread: app.chatUnread(),
  };
}

export function buildDiscussion(app, T, reportId) {
  const s = app.state, C = T.chat, list = app.commentsFor(reportId);
  return {
    title: C.discussion, count: list.filter(c => !c.sending).length, empty: !list.length, emptyText: C.noComments,
    items: bubbles(app, list, C, id => app.deleteComment(id)),   // people can delete their own comments
    composer: composer(app, C, C.comment, s.commentDrafts[reportId] || '', s.commentPhotos[reportId], s.commentSending,
      text => app.setCommentDraft(reportId, text), f => app.pickPhoto(f, 'commentPhotos', reportId), () => app.clearPhoto('commentPhotos', reportId), () => app.sendComment(reportId)),
  };
}

function composer(app, C, placeholder, text, photo, busy, setText, pick, clear, send) {
  return { placeholder, text, photo: photo || null, busy: !!busy, canSend: !busy && (!!text.trim() || !!photo),
    onText: e => setText(e.target.value), onPick: e => { pick(e.target.files && e.target.files[0]); e.target.value = ''; }, clear, send,
    labels: { send: C.send, add: C.addPhoto, remove: C.removePhoto } };
}
