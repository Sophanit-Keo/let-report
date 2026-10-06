// App state and actions: the signed-in person, which screen is open, the reports and every
// workflow action (send, assign, escalate, verify, hold checks). Changes show at once and are
// saved to Supabase in the background; the app re-loads from the database every 15 seconds.
// Screens get their data from ./viewModel.js, which reads this state.
import React from 'react';
import { strings } from '../i18n/index.js';
import { CATS, SEV, ST, ORDER, TITLES, MGR_AV, CIP_HOURS, RUN_MAX_HOURS, FILL_CIP_HOURS } from '../data/constants.js';
import { SEED, NOTES } from '../data/seed.js';
import { auth, isConfigured } from '../api/supabase.js';
import { repo } from '../api/repo.js';
import { nowIso, isDue, addDaysIso, stampLabel } from '../utils/time.js';
import { toSmallJpeg } from '../utils/image.js';
import { dueLabel } from '../data/constants.js';
import { loadPrefs, savePrefs } from './storage.js';
import { buildViewModel } from './viewModel.js';
import { chatState, chatMethods } from './chat.js';
import { pushState, pushMethods } from './push.js';
import { tourState, tourMethods } from './tour.js';

const REFRESH_MS = 15000;
const AVATARS = { Sokha: 'images/avatars/sokha.png', Vina: 'images/avatars/vina.png', Dara: 'images/avatars/dara.png', Chanthy: MGR_AV };
const COLORS = ['#0F2D58', '#1F74D0', '#1E8449', '#8A5300', '#B42318', '#155AA3'];

// Round avatar with initials, for people without a photo.
function initialsAvatar(name) {
  const n = (name || '?').trim();
  const ini = n.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  const c = COLORS[[...n].reduce((a, ch) => a + ch.charCodeAt(0), 0) % COLORS.length];
  return "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect width='40' height='40' fill='${c}'/><text x='20' y='26' font-family='Arial,sans-serif' font-size='15' font-weight='700' fill='white' text-anchor='middle'>${ini}</text></svg>`);
}

// A scheduled hold check whose date has come becomes "due".
// Easy-to-read temporary password, e.g. "mango-4821".
const WORDS = ['mango', 'lotus', 'river', 'tiger', 'mekong', 'jasmine', 'rice', 'palm', 'amber', 'cloud'];
function makePassword() { return WORDS[Math.floor(Math.random() * WORDS.length)] + '-' + String(Math.floor(1000 + Math.random() * 9000)); }

const hoursFromNow = h => new Date(Date.now() + h * 3600000).toISOString();
const withDue = r => (r.holdCheck && r.holdCheck.status === 'scheduled' && isDue(r.holdCheck.dueAt) ? { ...r, holdCheck: { ...r.holdCheck, status: 'due', due: 'Today' } } : r);

export class AppController extends React.Component {
  state = {
    // session + data
    session: auth.session(), profiles: [], reports: [], notes: [], read: {}, checks: [], photoUrls: {},
    booting: true, loadError: null, toast: null, busy: false,
    // ui
    screen: 'home', prev: 'home', lang: loadPrefs().lang || null, filter: 'all', selId: null, lastId: null, lastCritical: false,
    cap: { stage: 'camera', cat: null, sev: null, photo: false, customText: '' }, signed: false, draft: {}, recording: false,
    sheet: null, asg: {}, trendBy: 'line', esc: {}, lines: [], lineId: null, lineForm: {}, lineConfirm: false, lineNote: null,
    // lots on the lines: records of ended lots, the "start lot" form, the "finish lot" form, and a clock for the CIP countdown
    lots: [], lotsReady: true, lineLot: null, lineEnd: null, lineFill: null, clock: Date.now(),
    // chat + comments (./chat.js)
    ...chatState,
    // push notifications (./push.js)
    ...pushState,
    // "How to use" guide (./tour.js)
    ...tourState,
  };
  scrollRef = React.createRef();

  componentDidMount() {
    this._onKey = e => { if (e.key === 'Escape') { if (this.state.tour) this.endTour(); else if (this.state.sheet) this.setState({ sheet: null }); else if (this.state.screen === 'capture') this.go('home'); } };
    this._onFocus = () => { if (document.visibilityState !== 'hidden') this.refresh(); };
    this.listenForLinks();
    window.addEventListener('keydown', this._onKey);
    document.addEventListener('visibilitychange', this._onFocus);
    window.addEventListener('online', this._onFocus);
    this._offAuth = auth.onChange(session => {
      const who = session && session.user && session.user.id;
      if (this._chatFor && this._chatFor !== who) this.stopLive();   // signed out, or someone else signed in
      this.setState({ session }); if (!session) this.setState({ profiles: [], reports: [], notes: [], screen: 'home', sheet: null });
    });
    // With the live connection up, a full reload every minute is enough; otherwise every 15 s.
    this._tick = 0;
    this._poll = setInterval(() => {
      this._tick += 1; if (document.visibilityState === 'hidden') return;
      this.setState({ clock: Date.now() });   // keeps "running for 2 h 10 min" and the CIP countdown current
      if (!this.state.live || this._tick % 4 === 0) this.refresh();
    }, REFRESH_MS);
    document.documentElement.lang = this.lang();
    if (this.state.session) this.refresh(true); else this.setState({ booting: false });
  }
  componentWillUnmount() {
    clearInterval(this._poll); clearTimeout(this._tt);
    window.removeEventListener('keydown', this._onKey); document.removeEventListener('visibilitychange', this._onFocus); window.removeEventListener('online', this._onFocus);
    if (this._offAuth) this._offAuth();
    if (this._rt) this._rt.close(); clearTimeout(this._liveRefresh); this.stopListeningForLinks();
  }
  componentDidUpdate(pp, ps) {
    if (ps.screen !== this.state.screen && this.scrollRef.current) this.scrollRef.current.scrollTop = 0;
    if (ps.lang !== this.state.lang) { savePrefs({ lang: this.state.lang }); document.documentElement.lang = this.lang(); }
  }

  // ───── Loading ─────
  async refresh(first) {
    // Use the live session (state may not have caught up right after signing in).
    if (!auth.session()) { if (first) this.setState({ booting: false }); return; }
    if (this._loading) { if (first) this._again = true; return; }
    this._loading = true;
    try {
      const d = await repo.loadAll();
      const read = {}; d.readIds.forEach(id => { read[id] = true; });
      const checks = []; d.ticks.forEach(i => { checks[i] = true; });
      // keep optimistic changes that are still being saved
      const pending = this._pending || {};
      const reports = d.reports.map(r => withDue(pending[r.id] || r));
      const pl = this._pendingLines || {};
      const lines = d.lines.map(l => (pl[l.id] ? { ...l, ...pl[l.id] } : l));
      this.setState({ profiles: d.profiles, reports, notes: d.notes, read, checks, lines, lots: d.lots, lotsReady: d.lotsReady, booting: false, loadError: null });
      this.loadPhotos(reports);
      this.syncChat();
      if (this._pushFor !== this.myId()) { this._pushFor = this.myId(); this.initPush(); }
      // after the new data is on screen: open a notification's link, or the guide for new people
      this.setState(null, () => { if (this._link) { const l = this._link; this._link = null; this.openLink(l); } else this.maybeStartTour(); });
    } catch (e) {
      this.setState({ booting: false, loadError: first ? e.message : null });
      if (!first && e.code !== 'offline') this.toast(e.message);
    } finally {
      this._loading = false;
      if (this._again) { this._again = false; this.refresh(true); }
    }
  }
  async loadPhotos(reports) {
    const have = this.state.photoUrls;
    const paths = [];
    reports.forEach(r => { if (r.photoPath && !have[r.photoPath]) paths.push(r.photoPath); });
    if (!paths.length) return;
    try { const urls = await repo.photoUrls(paths); this.setState(s => ({ photoUrls: { ...s.photoUrls, ...urls } })); } catch (e) { /* photos load next time */ }
  }

  toast(text) { clearTimeout(this._tt); this.setState({ toast: text }); this._tt = setTimeout(() => this.setState({ toast: null }), 4000); }
  toastView() { return { show: !!this.state.toast, text: this.state.toast || '', close: () => this.setState({ toast: null }) }; }

  // ───── Auth ─────
  signIn = async (email, password) => { await auth.signIn(email, password); this.setState({ booting: true }); await this.refresh(true); };
  signUp = async (email, password, name) => {
    const r = await auth.signUp(email, password, name);
    if (r.session) { this.setState({ booting: true }); await this.refresh(true); }
    return r;
  };
  signOut = async () => { await this.forgetPushDevice(); this._pushFor = null; await auth.signOut(); };
  resetPassword = email => auth.resetPassword(email);
  email() { const s = this.state.session; return (s && s.user && s.user.email) || ''; }

  // ───── Who's who ─────
  profile() { const s = this.state.session; const id = s && s.user && s.user.id; return this.state.profiles.find(p => p.id === id) || null; }
  me() { const p = this.profile(); const name = (p && p.name) || this.email().split('@')[0] || 'Me'; return { id: p && p.id, name, avatar: this.avatarOf(name, p) }; }
  avatarOf = (name, p) => { const prof = p || this.state.profiles.find(x => x.name === name); return (prof && prof.avatar_url) || AVATARS[name] || initialsAvatar(name); };
  activeProfiles() { return this.state.profiles.filter(p => p.active !== false); }
  staffNames() { const names = this.activeProfiles().map(p => p.name).filter(Boolean); return names.length ? names : [this.me().name]; }
  // The person shown for each level of the escalation ladder: the first staff member with that role.
  people() {
    const T = this.T(), out = {};
    ORDER.forEach(k => { const p = this.activeProfiles().find(x => x.role === k); const name = p ? p.name : T.short[k]; out[k] = { name, avatar: p ? this.avatarOf(p.name, p) : initialsAvatar(T.short[k]) }; });
    return out;
  }
  isTurnedOff() { const p = this.profile(); return !!(p && p.active === false); }

  // ───── Team (plant managers) + profile pictures (everyone) ─────
  patchProfile = async (id, patch, okText) => {
    const before = this.state.profiles;
    this.setState({ profiles: before.map(p => (p.id === id ? { ...p, ...patch } : p)) });
    try { await repo.updateProfile(id, patch); if (okText) this.toast(okText); return true; }
    catch (e) { this.setState({ profiles: before }); this.toast(/manager/i.test(e.message) ? 'Keep at least one active plant manager.' : e.message); return false; }
  };
  // Pick a photo file → shrink it → upload → save on the profile.
  changePhoto = async (id, file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    try {
      const small = await toSmallJpeg(url, 320);
      if (!small) throw new Error('That file is not a photo.');
      this.setState({ busy: true });
      const avatar = await repo.uploadAvatar(id, small);
      await this.patchProfile(id, { avatar_url: avatar }, this.T().people.photoSaved);
    } catch (e) { this.toast(e.message); }
    finally { URL.revokeObjectURL(url); this.setState({ busy: false }); }
  };
  openPerson = id => this.setState({ sheet: 'person', personId: id, personName: null, personPw: '', personConfirm: false });
  openAddPerson = () => this.setState({ sheet: 'addPerson', newPerson: { name: '', email: '', password: makePassword(), role: 'qc' } });
  addPerson = async () => {
    const f = this.state.newPerson;
    this.setState({ busy: true });
    try {
      await repo.createUser({ name: f.name.trim(), email: f.email.trim(), password: f.password, role: f.role });
      this.setState({ busy: false, sheet: null });
      this.toast(f.name.trim() + ' ' + this.T().people.added);
      this.refresh();
    } catch (e) { this.setState({ busy: false }); this.toast(e.message); }
  };
  removePerson = async id => {
    const p = this.state.profiles.find(x => x.id === id);
    this.setState({ busy: true });
    try {
      await repo.deleteUser(id);
      this.setState(s => ({ busy: false, sheet: null, profiles: s.profiles.filter(x => x.id !== id) }));
      this.toast((p ? p.name : '') + ' ' + this.T().people.removed);
    } catch (e) { this.setState({ busy: false }); this.toast(e.message); }
  };
  setPersonPassword = async id => {
    this.setState({ busy: true });
    try { await repo.setPassword(id, this.state.personPw); this.setState({ busy: false, personPw: '' }); this.toast(this.T().people.pwSet); }
    catch (e) { this.setState({ busy: false }); this.toast(e.message); }
  };

  setRole = async (id, role) => {
    const before = this.state.profiles;
    this.setState({ profiles: before.map(p => (p.id === id ? { ...p, role } : p)) });
    try { await repo.updateProfile(id, { role }); } catch (e) { this.setState({ profiles: before }); this.toast(/manager/i.test(e.message) ? 'Keep at least one active plant manager.' : e.message); }
  };

  // Start options can be set in the URL: ?lang=km&flow=B
  param(k) { try { return new URLSearchParams(window.location.search).get(k); } catch (e) { return null; } }
  role() { const p = this.profile(); return (p && p.role) || 'qc'; }
  lang() { return this.state.lang || (this.param('lang') === 'km' ? 'km' : 'en'); }
  flow() { const f = (this.param('flow') || 'A').toUpperCase(); return ['A', 'B', 'C'].includes(f[0]) ? f[0] : 'A'; }
  T() { return strings(this.lang()); }
  go(screen, extra) { this.setState(s => ({ prev: s.screen, screen, ...(extra || {}) })); }

  // ───── Workflow rules (unchanged from the design) ─────
  canAct(r, role = this.role()) {
    const me = this.me().name;
    if (r.status === 'closed') return null;
    if (r.status === 'action') return r.capa && r.capa.owner === me ? 'done' : null;
    if (r.status === 'verify') return r.needsApproval ? (role === 'manager' ? 'approve' : null) : (role === 'qa' || role === 'manager' ? 'verify' : null);
    if (r.status === 'open' && r.level === role) return role === 'qc' ? 'fix' : 'assign';
    return null;
  }
  // QC, QA and Supervisor can close a trouble at any stage (critical ones still go to the manager for approval).
  canClose(r, role = this.role()) {
    if (r.status === 'closed' || r.needsApproval || !['qc', 'qa', 'supervisor'].includes(role)) return false;
    return !['fix', 'verify'].includes(this.canAct(r, role));
  }
  canEsc(r, role = this.role()) { return r.status !== 'closed' && r.level === role && role !== 'manager' && !r.needsApproval; }
  canCheck(r, role = this.role()) {
    const hc = r.holdCheck, me = this.me().name; if (!hc || hc.status !== 'due') return false;
    return hc.owner === me || role === 'qa' || (hc.owner === 'QC team' && role === 'qc');
  }
  decider(r) { return (r.holdCheck && r.holdCheck.decider) || 'qa'; }
  tasksFor(r, role = this.role()) {
    const out = []; if (r.holdCheck && r.holdCheck.status === 'decision' && this.decider(r) === role) out.push('decide');
    if (this.canCheck(r, role)) out.push('check'); const a = this.canAct(r, role); if (a) out.push(a); return out;
  }
  taskLabel(r, k, T) { return k === 'check' ? T.hcTypes[r.holdCheck.type] + ' · ' + T.hcSt.due : T.task[k]; }
  deco(r) {
    const T = this.T(), st = ST[r.status], sv = SEV[r.sev], ci = Math.max(0, CATS.findIndex(c => c[0] === r.cat));
    return { ...r, time: stampLabel(r.createdAt).replace(/ \d\d:\d\d$/, ''), photoUrl: r.photoPath ? this.state.photoUrls[r.photoPath] : r.photoUrl,
      icon: CATS[ci][1], catLabel: T.cats[ci], sev: T.sev[r.sev], sevBg: sv.bg, sevFg: sv.fg, stLabel: T.st[st.i], stBg: st.bg, stFg: st.fg,
      mine: this.tasksFor(r).length > 0, levelLabel: T.short[r.level || 'qa'], moveLabel: T.youMove, open: () => this.go('detail', { selId: r.id }) };
  }
  // Issues by line or product over the last 7 days (manager home).
  trend(by) {
    const week = Date.now() - 7 * 86400000, counts = {};
    this.state.reports.forEach(r => { if (new Date(r.createdAt) < week) return; const k = by === 'line' ? r.loc : r.pname; if (k) counts[k] = (counts[k] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }

  hcView(r, T, me) {
    const hc = r.holdCheck; if (!hc) return {}; const st = hc.status;
    const tone = { scheduled: ['var(--blue-100)', 'var(--blue-700)', 'clock', 'var(--blue-200)'], due: ['var(--amber-100)', 'var(--amber-700)', 'bell-ring', 'var(--amber-500)'], passed: ['var(--green-100)', 'var(--green-700)', 'circle-check', 'var(--green-300)'], failed: ['var(--red-100)', 'var(--red-700)', 'circle-x', 'var(--red-500)'], decision: ['var(--red-100)', 'var(--red-700)', 'triangle-alert', 'var(--red-500)'], decided: ['var(--blue-100)', 'var(--navy-900)', 'gavel', 'var(--blue-200)'] }[st] || ['var(--blue-100)', 'var(--blue-700)', 'clock', 'var(--blue-200)'];
    const can = this.canCheck(r); const ownerL = hc.owner === 'QC team' ? T.qcTeam : hc.owner;
    const finish = ok => () => {
      const t = this.now(); const hist = [...(hc.history || []), { ok, t, by: me.name }];
      if (ok) this.update(r.id, x => ({ ...x, hold: false, holdCheck: { ...x.holdCheck, history: hist, status: 'passed', due: 'Today' }, tl: [...x.tl, ['hcOk', me.name, t]] }));
      else {
        this.update(r.id, x => ({ ...x, holdCheck: { ...x.holdCheck, history: hist, status: 'decision' }, tl: [...x.tl, ['hcFound', me.name, t]] }));
        if (this.role() === this.decider(r)) this.openDecide(r);
        else this.addNote({ id: r.id, icon: 'triangle-alert', tone: 'red', text: 'Decision needed: problem found at hold check for ' + (r.pname || r.title) + (r.lot ? ', lot ' + r.lot : ''), roles: [this.decider(r)] });
      }
    };
    const history = (hc.history || []).map((x, i) => ({ n: i + 1, res: (x.ok ? T.resOk : T.resBad) + ' · ' + x.by, t: stampLabel(x.t), fg: x.ok ? 'var(--green-700)' : 'var(--red-700)' }));
    const due = st === 'due' ? 'Today' : hc.dueAt ? dueLabel(hc.dueAt) : hc.due;
    return { typeLabel: T.hcTypes[hc.type] + ((hc.history || []).length && st !== 'decision' && st !== 'passed' && st !== 'failed' ? ' · ' + T.checkN + ' ' + ((hc.history || []).length + 1) : ''), sub: (r.qty ? r.qty + ' ' + r.unit + ' · ' : '') + (r.pname || '') + (r.lot ? ' · ' + r.lot : ''), due, owner: ownerL,
      stLabel: T.hcSt[st], stBg: tone[0], stFg: tone[1], icon: tone[2], icBg: tone[0], icFg: tone[1], bd: tone[3],
      canCheck: can, waiting: st === 'due' && !can, needDecision: st === 'decision' && this.role() === this.decider(r), waitDecision: st === 'decision' && this.role() !== this.decider(r), decide: () => this.openDecide(r),
      hasNote: !!hc.note, note: hc.note || '', history, hasHistory: history.length > 0,
      // "Jump to check day" is a testing shortcut, shown to managers only
      scheduled: st === 'scheduled' && this.role() === 'manager', passLabel: T.hcPass[hc.type], failLabel: T.hcFail[hc.type], pass: finish(true), fail: finish(false),
      skip: () => {
        this.update(r.id, x => ({ ...x, holdCheck: { ...x.holdCheck, status: 'due', due: 'Today', dueAt: nowIso() }, tl: [...x.tl, ['hcRem', 'System', this.now()]] }));
        this.addNote({ id: r.id, icon: 'bell-ring', tone: 'amber', text: 'Reminder: ' + T.hcTypes[hc.type].toLowerCase() + ' due today for ' + (r.pname || r.title) + (r.lot ? ', lot ' + r.lot : ''), roles: ['qc', 'qa', 'supervisor'] });
      } };
  }
  openDecide(r) { const hc = r.holdCheck || {}; this.setState({ sheet: 'decide', dec: { choice: 'keep', days: 3, owner: hc.owner || 'QC team', text: '' } }); }
  now() { return nowIso(); }

  // ───── Saving ─────
  // Apply a change right away, then save only the changed fields to the database.
  update(id, fn) {
    const before = this.state.reports.find(r => r.id === id); if (!before) return;
    const after = fn(before);
    this._pending = { ...(this._pending || {}), [id]: after };
    this.setState(s => ({ reports: s.reports.map(r => (r.id === id ? after : r)) }));
    repo.updateReport(before, after)
      .then(saved => { this.setState(s => ({ reports: s.reports.map(r => (r.id === id ? withDue(saved) : r)) })); })
      .catch(e => { this.toast(e.message); this.setState(s => ({ reports: s.reports.map(r => (r.id === id ? before : r)) })); })
      .finally(() => { if (this._pending) delete this._pending[id]; });
  }
  addNote(note) {
    const temp = { ...note, key: 'tmp-' + Math.random(), t: nowIso() };
    this.setState(s => ({ notes: [temp, ...s.notes] }));
    repo.addNote(note).catch(e => this.toast(e.message));
  }
  markRead(key) {
    if (this.state.read[key]) return;
    this.setState(s => ({ read: { ...s.read, [key]: true } }));
    if (typeof key === 'number') repo.markRead(key).catch(() => {});
  }
  toggleTick(i) {
    const on = !this.state.checks[i];
    this.setState(s => { const c = [...s.checks]; c[i] = on; return { checks: c }; });
    repo.setTick(i, on).catch(e => { this.toast(e.message); this.setState(s => { const c = [...s.checks]; c[i] = !on; return { checks: c }; }); });
  }

  setupSig = el => {
    if (!el || el === this._sig) return; this._sig = el;
    // size the drawing buffer to the on-screen size (sharp on retina, any screen width)
    const r = el.getBoundingClientRect(), k = Math.min(3, Math.max(2, window.devicePixelRatio || 1)); el.width = Math.round((r.width || 362) * k); el.height = Math.round((r.height || 100) * k);
    const ctx = el.getContext('2d'); ctx.lineWidth = 2.5 * k; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0F2D58';
    let down = false; const pos = e => { const b = el.getBoundingClientRect(); return [(e.clientX - b.left) * el.width / b.width, (e.clientY - b.top) * el.height / b.height]; };
    el.onpointerdown = e => { down = true; try { el.setPointerCapture(e.pointerId); } catch (_) { /* old browsers */ } const [x, y] = pos(e); ctx.beginPath(); ctx.moveTo(x, y); e.preventDefault(); };
    el.onpointermove = e => { if (!down) return; const [x, y] = pos(e); ctx.lineTo(x, y); ctx.stroke(); if (!this.state.signed) this.setState({ signed: true }); e.preventDefault(); };
    el.onpointerup = el.onpointercancel = () => { down = false; };
  };

  send = async () => {
    if (this.state.busy) return;
    const { cap } = this.state; const role = this.role(), me = this.me().name; const t = this.now();
    const tl = [['reported', me, t]]; if (cap.sev === 3) tl.push(['alert', 'System', t]);
    const level = cap.sev >= 2 && ORDER.indexOf(role) < 1 ? 'qa' : role; if (level !== role) tl.push(['esc', 'System', t, ' QA · ' + (cap.sev === 3 ? 'critical' : 'high severity')]);
    const title = cap.cat === 'custom' ? (cap.customText || '').trim() : TITLES[cap.cat];
    let signature = null; try { signature = this._sig ? this._sig.toDataURL('image/png') : null; } catch (e) { signature = null; }
    this.setState({ busy: true });
    try {
      const photoPath = cap.photoUrl ? await repo.uploadImage(cap.photoUrl, 'reports') : null;
      const signaturePath = signature ? await repo.uploadImage(signature, 'signatures') : null;
      const saved = await repo.createReport({ level, title, cat: cap.cat, sev: cap.sev, loc: this.locs()[0], status: 'open', by: me, photoPath, signaturePath, signedAt: t,
        ptype: '', pname: '', lot: '', qty: '', unit: 'pcs', hold: false, urgent: cap.sev === 3, support: [], desc: '', action: '', suggestion: '', voice: false, capa: null, tl });
      if (cap.photoUrl && photoPath) this.setState(s => ({ photoUrls: { ...s.photoUrls, [photoPath]: cap.photoUrl } }));
      const id = saved.id;
      if (cap.sev === 3) this.addNote({ id, icon: 'siren', tone: 'red', text: 'Critical: ' + title, roles: ['qa', 'supervisor', 'manager'] });
      else if (level !== role) this.addNote({ id, icon: 'arrow-up-right', tone: 'blue', text: 'New for QA: ' + title, roles: ['qa'] });
      this._sig = null;
      this.setState(s => ({ reports: [saved, ...s.reports], lastId: id, lastCritical: cap.sev === 3, selId: id, prev: s.screen, screen: 'done', signed: false, busy: false }));
    } catch (e) {
      this.setState({ busy: false });
      this.toast(e.message);
    }
  };

  // Managers: fill an empty database with the design's sample reports (for demos and testing).
  loadSample = async () => {
    this.setState({ busy: true });
    const me = this.me().name;
    const ago = (d, hm) => { const x = new Date(); x.setDate(x.getDate() - d); const [h, m] = (hm || '09:00').split(':'); x.setHours(+h, +m, 0, 0); return x.toISOString(); };
    const DAYS = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };
    const back = lbl => { const w = (lbl || '').match(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/); if (!w) return 0; const diff = (new Date().getDay() - DAYS[w[1]] + 7) % 7; return diff || 7; };
    const toIso = lbl => { if (!lbl) return nowIso(); const hm = (lbl.match(/\d\d:\d\d/) || [])[0]; return ago(/^Today/.test(lbl) ? 0 : back(lbl), hm || '09:00'); };
    try {
      const saved = [];
      for (const r of [...SEED].reverse()) {
        const hc = r.holdCheck ? { ...r.holdCheck, dueAt: r.holdCheck.status === 'due' ? nowIso() : addDaysIso(r.holdCheck.days || 3) } : null;
        const tl = r.tl.map(e => [e[0], e[1], toIso(e[2]), e[3]].filter(x => x !== undefined));
        const row = { ...r, holdCheck: hc, tl, by: r.by, createdAt: tl[0][2], photoPath: null, signedAt: tl[0][2] };
        saved.push(await repo.createReport(row));
      }
      const idMap = {}; SEED.forEach((r, i) => { idMap[r.id] = saved[saved.length - 1 - i].id; });
      for (const n of NOTES) await repo.addNote({ ...n, id: idMap[n.id] });
      this.setState({ busy: false, sheet: null });
      this.toast(me + ': ' + saved.length + ' sample reports added.');
      this.refresh();
    } catch (e) { this.setState({ busy: false }); this.toast(e.message); }
  };

  // ───── Production lines ─────
  // Where a problem can be: every production line, plus the non-line areas.
  locs() { return [...this.state.lines.map(l => l.name), 'Packing', 'Receiving']; }
  canManageLines() { return this.role() === 'manager'; }
  openLine = id => this.setState({ sheet: 'line', lineId: id, lineConfirm: false, lineNote: null, lineLot: null, lineEnd: null, lineFill: null });
  // Change a line right away, then save it (status, output, note, lot, CIP).
  updateLine = (id, patch) => {
    const before = this.state.lines.find(l => l.id === id); if (!before) return;
    const full = { ...patch, updatedBy: this.me().name };
    if (patch.status && patch.status !== before.status) {
      full.statusSince = nowIso();
      // Into CIP: plan the standard 4 hours unless told otherwise. Out of CIP: the countdown ends.
      if (patch.status === 'cleaning') { if (full.cipUntil === undefined) full.cipUntil = hoursFromNow(CIP_HOURS); if (full.cipReason === undefined) full.cipReason = 'standard'; }
      else if (before.status === 'cleaning') {
        if (full.cipUntil === undefined) full.cipUntil = null; if (full.cipReason === undefined) full.cipReason = '';
        // Back to Running after a CIP filling: the same lot carries on and the filling clock starts again.
        if (before.cipReason === 'filling' && patch.status === 'running' && full.fillSince === undefined) full.fillSince = nowIso();
      }
    }
    this._pendingLines = { ...(this._pendingLines || {}), [id]: { ...((this._pendingLines || {})[id] || {}), ...full } };
    this.setState(s => ({ lines: s.lines.map(l => (l.id === id ? { ...l, ...full, updatedAt: nowIso() } : l)) }));
    clearTimeout((this._lineTimers || (this._lineTimers = {}))[id]);
    // quick taps on +1/−1 are sent together
    this._lineTimers[id] = setTimeout(() => {
      const send = (this._pendingLines || {})[id]; if (!send) return;
      repo.updateLine(id, send)
        .then(saved => { if (this._pendingLines && this._pendingLines[id] === send) delete this._pendingLines[id]; if (saved) this.setState(s => ({ lines: s.lines.map(l => (l.id === id ? { ...l, ...saved } : l)) })); })
        .catch(e => { if (this._pendingLines) delete this._pendingLines[id]; this.toast(e.message); this.refresh(); });
    }, 600);
  };
  openLineForm = line => this.setState({ sheet: 'lineForm', lineId: line ? line.id : null,
    lineForm: line ? { name: line.name, type: line.type, product: line.product, target: String(line.target), maxRun: String(line.maxRunHours || RUN_MAX_HOURS), fillEvery: line.fillEvery ? String(line.fillEvery) : '' }
      : { name: '', type: 'UHT', product: '', target: '100', maxRun: String(RUN_MAX_HOURS), fillEvery: '' } });
  saveLineForm = async () => {
    const f = this.state.lineForm, id = this.state.lineId;
    const data = { name: f.name.trim(), type: f.type, product: f.product.trim(), target: Math.max(1, parseInt(f.target, 10) || 100),
      maxRunHours: Math.max(1, parseInt(f.maxRun, 10) || RUN_MAX_HOURS), fillEvery: parseInt(f.fillEvery, 10) > 0 ? parseInt(f.fillEvery, 10) : null };
    this.setState({ busy: true });
    try {
      if (id) {
        const old = this.state.lines.find(l => l.id === id);
        await repo.updateLine(id, { ...data, updatedBy: this.me().name });
        // Renamed: move its reports and lot records to the new name so filters and "See open reports" still work.
        if (old && old.name !== data.name) { await repo.renameLoc(old.name, data.name); await repo.renameLotsLine(id, data.name); }
      }
      else { const sort = Math.max(0, ...this.state.lines.map(l => l.sort || 0)) + 1; await repo.addLine({ ...data, sort, status: 'idle', qty: 0, updatedBy: this.me().name }); }
      this.setState({ busy: false, sheet: null });
      this.toast((id ? '' : '+ ') + data.name);
      this.refresh();
    } catch (e) {
      this.setState({ busy: false });
      this.toast(/duplicate|unique/i.test(e.message) ? '"' + data.name + '" already exists.' : e.message);
    }
  };
  // ───── Lots: what a line is running now, finishing a lot, CIP after it ─────
  // "Start lot": the lot number (and product) the line is going to run. The line goes to Running.
  // The planned run is picked from 24 / 28 / 32 / 36 h (the line's maximum by default); more than the maximum is a special case.
  openStartLot = () => { const l = this.state.lines.find(x => x.id === this.state.lineId);
    this.setState({ lineLot: { lot: '', product: l ? l.product : '', plan: String(Math.min(RUN_MAX_HOURS, (l && l.maxRunHours) || RUN_MAX_HOURS)) }, lineEnd: null, lineFill: null }); };
  startLot = () => {
    const id = this.state.lineId, f = this.state.lineLot || {}; const lot = (f.lot || '').trim(); if (!id || !lot) return;
    const plan = parseFloat(f.plan) > 0 ? parseFloat(f.plan) : null, t = nowIso();
    this.updateLine(id, { status: 'running', lot, product: (f.product || '').trim(), lotStartedAt: t, planHours: plan, fillSince: t, fillCips: 0, cipUntil: null, cipReason: '' });
    this.setState({ lineLot: null });
    this.toast('▶ ' + lot + (plan ? ' · ' + plan + ' h' : ''));
  };
  // CIP filling: the filler is cleaned in the middle of a lot (UHT line 1 after 24 h). The lot stays on the line.
  openFillCip = () => this.setState({ lineFill: { hours: String(FILL_CIP_HOURS) }, lineLot: null, lineEnd: null });
  startFillCip = () => {
    const l = this.state.lines.find(x => x.id === this.state.lineId), f = this.state.lineFill || {}; if (!l || !l.lot) return;
    const hours = parseFloat(f.hours) > 0 ? parseFloat(f.hours) : FILL_CIP_HOURS;
    this.updateLine(l.id, { status: 'cleaning', cipReason: 'filling', cipUntil: hoursFromNow(hours), fillCips: (l.fillCips || 0) + 1 });
    this.setState({ lineFill: null });
    this.toast('CIP filling · ' + l.lot + ' · ' + hours + ' h');
  };
  // After the CIP filling: carry on with the same lot.
  continueLot = () => { const l = this.state.lines.find(x => x.id === this.state.lineId); if (!l || !l.lot) return;
    this.updateLine(l.id, { status: 'running', fillSince: nowIso() }); this.toast('▶ ' + l.lot); };
  // "Finish lot": record the lot that ended, then the line goes into CIP (4 h standard, longer for maintenance or a system error).
  openFinishLot = () => { const l = this.state.lines.find(x => x.id === this.state.lineId); if (!l) return;
    this.setState({ lineEnd: { qty: String(l.qty), hours: String(CIP_HOURS), reason: 'standard', note: '', overNote: '' }, lineLot: null, lineFill: null }); };
  finishLot = async () => {
    const id = this.state.lineId, l = this.state.lines.find(x => x.id === id), f = this.state.lineEnd; if (!l || !f) return;
    const hours = Math.max(0, parseFloat(f.hours) || 0), me = this.me();
    const rec = { lineId: l.id, lineName: l.name, product: l.product || '', lot: l.lot || '—', startedAt: l.lotStartedAt || null, endedAt: nowIso(),
      qty: Math.max(0, parseInt(f.qty, 10) || 0), target: l.target || 0, cipHours: hours, cipReason: f.reason || 'standard', note: (f.note || '').trim(), endedBy: this.myId(), endedByName: me.name,
      planHours: l.planHours || null, fillCips: l.fillCips || 0, overNote: (f.overNote || '').trim() };
    this.setState({ busy: true });
    try {
      const saved = await repo.addLot(rec);
      this.setState(s => ({ busy: false, lineEnd: null, lots: [saved, ...s.lots.filter(x => x.id !== saved.id)] }));
      this.updateLine(id, { status: 'cleaning', lot: '', lotStartedAt: null, planHours: null, fillSince: null, fillCips: 0, cipUntil: hoursFromNow(hours), cipReason: rec.cipReason });
      this.toast('■ ' + rec.lot + ' · CIP ' + hours + ' h');
    } catch (e) { this.setState({ busy: false }); this.toast(e.message); }
  };
  // CIP is taking longer (maintenance, system error): push the planned end out.
  extendCip = hours => { const l = this.state.lines.find(x => x.id === this.state.lineId); if (!l) return;
    const from = l.cipUntil && Date.parse(l.cipUntil) > Date.now() ? Date.parse(l.cipUntil) : Date.now();
    this.updateLine(l.id, { cipUntil: new Date(from + hours * 3600000).toISOString() }); };
  removeLine = async id => {
    const line = this.state.lines.find(l => l.id === id);
    this.setState(s => ({ sheet: null, lines: s.lines.filter(l => l.id !== id) }));
    try { await repo.removeLine(id); this.toast('− ' + (line ? line.name : '')); } catch (e) { this.toast(e.message); this.refresh(); }
  };

  // Everything the screens display, recomputed on each render.
  viewModel() { return buildViewModel(this); }
  isConfigured() { return isConfigured(); }
}

// Chat and comment actions live in ./chat.js, push notifications in ./push.js, the guide in ./tour.js.
Object.assign(AppController.prototype, chatMethods, pushMethods, tourMethods);
