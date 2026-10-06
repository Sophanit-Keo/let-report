// What the lot details sheet and the production plan sheet show: the lot's facts, its events
// (view, add, edit, delete), the change log written by the database, and the editable plan.
import { CIP_REASONS } from '../data/constants.js';
import { fromLocalInput } from '../utils/time.js';

const ms = v => Date.parse(v) || 0;
const EVENT_ICON = { start: 'play', status: 'circle-pause', fill_cip: 'refresh-ccw', continue: 'play', finish: 'square', note: 'pencil-line' };
const EVENT_COLOR = { start: 'var(--green-700)', status: 'var(--amber-700)', fill_cip: 'var(--blue-700)', continue: 'var(--green-700)', finish: 'var(--navy-900)', note: 'var(--gray-700)' };
const ADD_KINDS = ['stopped', 'running', 'maintenance', 'fill', 'cont', 'note'];
const EDIT_STATUSES = ['stopped', 'running', 'maintenance', 'changeover', 'idle'];
// Columns that are bookkeeping, not something a person changed
const HIDDEN = ['kind', 'line_id', 'lot_id', 'id'];

// "Stopped", "CIP filling · 2 h", "Finish · CIP 4 h · Maintenance"…
function eventLabel(T, stLabelOf, kind, detail, hours) {
  const E = T.lotd.ev, h = hours != null && hours !== '' ? ' · ' + hours + ' ' + T.lot.hoursShort : '';
  if (kind === 'start') return E.start;
  if (kind === 'status') return detail === 'running' ? E.resumed : E.status.replace('{s}', stLabelOf(detail || 'stopped'));
  if (kind === 'fill_cip') return E.fill + h;
  if (kind === 'continue') return E.cont;
  if (kind === 'finish') return E.finish + (hours != null ? ' · ' + T.lot.cipShort + ' ' + hours + ' ' + T.lot.hoursShort : '') + (detail && detail !== 'standard' ? ' · ' + (T.lot.reasons[detail] || detail) : '');
  return E.note;
}

// One change-log entry as a title and "Field: before → after" lines.
export function formatLog(g, { T, stLabelOf, stampLabel }) {
  const F = T.lotd.fields, c = g.changes || {};
  const val = (k, v) => {
    if (v === null || v === undefined || v === '') return '—';
    if (k === 'at' || /_at$/.test(k)) return stampLabel(v);
    if (k === 'cip_reason') return T.lot.reasons[v] || v;
    if (k === 'detail') return g.eventKind === 'status' ? stLabelOf(v) : (T.lot.reasons[v] || v);
    if (Array.isArray(v)) return v.join(', ') + ' ' + T.lot.hoursShort;
    if (/hours$/.test(k)) return v + ' ' + T.lot.hoursShort;
    return String(v);
  };
  // A new lot shows what was started; a new or deleted event is already described by its title.
  const CREATE_LOT = ['lot', 'product', 'started_at', 'plan_hours'];
  const show = k => !HIDDEN.includes(k) && F[k]
    && !(g.entity === 'lot' && g.action === 'create' && !CREATE_LOT.includes(k))
    && !(g.entity === 'event' && g.action !== 'edit' && (k === 'detail' || k === 'hours'));
  const lines = Object.keys(c).filter(show).map(k => {
    const [a, b] = c[k];
    if (g.action === 'create') return F[k] + ': ' + val(k, b);
    if (g.action === 'delete') return F[k] + ': ' + val(k, a);
    // empty and blank read the same ("—"): not a change worth showing
    return val(k, a) === val(k, b) ? null : F[k] + ': ' + val(k, a) + ' → ' + val(k, b);
  }).filter(Boolean);
  const L = T.lotd.log;
  let title;
  if (g.entity === 'plan') title = L.plan;
  else if (g.entity === 'lot') title = g.action === 'create' ? L.lotCreate : g.action === 'delete' ? L.lotDelete : (c.ended_at && c.ended_at[0] === null ? L.lotFinish : L.lotEdit);
  else {
    const detail = c.detail ? (c.detail[1] || c.detail[0]) : '', hours = c.hours ? (c.hours[1] != null ? c.hours[1] : c.hours[0]) : null;
    title = L[g.action === 'create' ? 'evAdd' : g.action === 'delete' ? 'evDelete' : 'evEdit'] + ': ' + eventLabel(T, stLabelOf, g.eventKind, detail, g.action === 'edit' ? null : hours);
  }
  return { id: g.id, title, lines, who: g.byName || '—', when: stampLabel(g.at), tone: g.action === 'delete' ? 'var(--red-700)' : g.action === 'create' ? 'var(--green-700)' : 'var(--blue-700)' };
}

export function buildLotView(app, { T, pill, stLabelOf, hoursLabel, stampLabel, P }) {
  const s = app.state, x = (s.lots || []).find(o => o.id === s.lotId);
  const back = { label: s.lotBack ? ((s.lines.find(o => o.id === s.lotBack) || {}).name || T.lotd.back) : T.lotd.back, go: app.backFromLot };
  if (!x) return { missing: true, back };
  const d = s.lotDetail && s.lotDetail.lotId === x.id ? s.lotDetail : { events: [], log: [], loading: true };
  const line = s.lines.find(o => o.id === x.lineId), max = (line && line.maxRunHours) || P.runMax;
  const running = !x.endedAt, ranMs = x.startedAt ? (running ? Date.now() : ms(x.endedAt)) - ms(x.startedAt) : 0;
  const set = (key, p) => app.setState(st => ({ [key]: { ...st[key], ...p } }));
  const timeMsg = (kind, v) => { const at = fromLocalInput(v); if (!at) return T.lotd.timeMissing; return app.evTimeOk(kind, at, x) ? '' : T.lotd.timeBad; };

  const facts = [
    [T.lotd.line, x.lineName || '—'],
    [T.lot.product, x.product || '—'],
    [T.lotd.start, x.startedAt ? stampLabel(x.startedAt) + (x.startedByName ? ' · ' + x.startedByName : '') : '—'],
    [T.lotd.end, running ? T.lotd.running : stampLabel(x.endedAt) + (x.endedByName ? ' · ' + x.endedByName : '')],
    [T.lotd.ran, x.startedAt ? hoursLabel(ranMs) + (x.planHours ? ' · ' + T.lot.planOf.replace('{plan}', x.planHours) : '') : '—'],
    [T.lotd.output, x.qty + ' / ' + (x.target || '—') + ' ' + T.lot.pal],
    running ? null : [T.lotd.cipAfter, x.cipHours + ' ' + T.lot.hoursShort + ' · ' + (T.lot.reasons[x.cipReason] || x.cipReason)],
    x.fillCips ? [T.lot.fillCount, String(x.fillCips)] : null,
  ].filter(Boolean).map(([k, v]) => ({ k, v }));

  const editing = s.lotEdit ? (() => { const f = s.lotEdit; return {
    ...f, on: k => e => set('lotEdit', { [k]: k === 'lot' ? e.target.value.toUpperCase() : (k === 'qty' || k === 'plan') ? e.target.value.replace(/[^0-9.]/g, '') : e.target.value }),
    plans: P.runChoices.map(n => ({ label: n + ' ' + T.lot.hoursShort, ...pill(parseFloat(f.plan) === n), pick: () => set('lotEdit', { plan: String(n) }) })),
    special: parseFloat(f.plan) > max ? T.lot.special.replace('{max}', max) : '',
    disabled: !!s.busy || !(f.lot || '').trim(), save: app.saveLotEdit, cancel: () => app.setState({ lotEdit: null }) }; })() : null;

  const events = (d.events || []).map(ev => {
    const fixed = ev.kind === 'start' || ev.kind === 'finish';
    const ed = s.evEdit && s.evEdit.id === ev.id ? (() => { const f = s.evEdit, bad = timeMsg(ev.kind, f.at); return {
      at: f.at, onAt: e => set('evEdit', { at: e.target.value }), bad,
      hasHours: ev.kind === 'fill_cip' || ev.kind === 'finish', hours: f.hours, onHours: e => set('evEdit', { hours: e.target.value.replace(/[^0-9.]/g, '') }),
      reasons: ev.kind === 'finish' ? CIP_REASONS.map(k => ({ label: T.lot.reasons[k], ...pill(f.detail === k), pick: () => set('evEdit', { detail: k }) })) : null,
      statuses: ev.kind === 'status' ? EDIT_STATUSES.map(k => ({ label: stLabelOf(k), ...pill(f.detail === k), pick: () => set('evEdit', { detail: k }) })) : null,
      note: f.note, onNote: e => set('evEdit', { note: e.target.value }),
      disabled: !!s.busy || !!bad, save: app.saveEvEdit, cancel: () => app.setState({ evEdit: null }) }; })() : null;
    return { id: ev.id, kind: ev.kind, icon: EVENT_ICON[ev.kind] || 'clock', color: EVENT_COLOR[ev.kind] || 'var(--gray-700)',
      time: stampLabel(ev.at), label: eventLabel(T, stLabelOf, ev.kind, ev.detail, ev.hours), by: ev.byName, note: ev.note,
      edit: () => app.openEvEdit(ev), canDelete: !fixed, fixedNote: fixed ? T.lotd.fixed : '',
      askDelete: () => app.setState({ evDel: ev.id, evEdit: null }), confirming: s.evDel === ev.id, del: () => app.deleteEvent(ev.id), cancelDel: () => app.setState({ evDel: null }), editing: ed };
  });

  const adding = s.evAdd ? (() => { const f = s.evAdd, bad = timeMsg('other', f.at); return {
    kinds: ADD_KINDS.map(k => ({ label: T.lotd.add[k], ...pill(f.kind === k), pick: () => set('evAdd', { kind: k }) })),
    at: f.at, onAt: e => set('evAdd', { at: e.target.value }), bad,
    hasHours: f.kind === 'fill', hours: f.hours, onHours: e => set('evAdd', { hours: e.target.value.replace(/[^0-9.]/g, '') }),
    note: f.note, onNote: e => set('evAdd', { note: e.target.value }), needNote: f.kind === 'note',
    disabled: !!s.busy || !!bad || (f.kind === 'note' && !(f.note || '').trim()), save: app.saveEvAdd, cancel: () => app.setState({ evAdd: null }) }; })() : null;

  return {
    back, lot: x.lot, product: x.product || '—', running, facts, note: x.note, overNote: x.overNote,
    over: !!(x.startedAt && ranMs > max * H(1)), maxLabel: T.lot.overWhy.replace('{max}', max),
    openEdit: app.openLotEdit, editing,
    loading: !!d.loading, error: d.error || '', events, openAdd: app.openEvAdd, adding,
    log: (d.log || []).map(g => formatLog(g, { T, stLabelOf, stampLabel })),
    canDelete: app.role() === 'manager', askDelete: () => app.setState({ lotDel: true }), confirmDelete: !!s.lotDel, del: app.deleteLot, cancelDelete: () => app.setState({ lotDel: false }),
  };
}

function H(n) { return n * 3600000; }

// The production plan: run choices, the normal maximum and CIP times. Supervisors and the plant manager edit it.
export function buildPlanView(app, { T, pill, stampLabel, P }) {
  const s = app.state, f = s.planForm || {}, can = app.canEditPlan() && !!s.planReady;
  const set = p => app.setState(st => ({ planForm: { ...st.planForm, ...p } }));
  const num = k => e => set({ [k]: e.target.value.replace(/[^0-9.]/g, '') });
  const choices = (f.runChoices || []).map(Number).filter(n => n > 0).sort((a, b) => a - b);
  const addChoice = () => { const n = parseFloat(f.add); if (n > 0 && !choices.includes(n)) set({ runChoices: [...choices, n].map(String), add: '' }); else set({ add: '' }); };
  const pos = k => parseFloat(f[k]) > 0;
  return {
    ready: !!s.planReady, canEdit: can, viewOnly: T.plan.viewOnly.replace('{role}', T.roles[app.role()] || app.role()),
    siteName: f.siteName || '', onSiteName: e => set({ siteName: e.target.value.slice(0, 80) }), sitePh: T.site,
    choices: choices.map(n => ({ label: n + ' ' + T.lot.hoursShort, remove: can && choices.length > 1 ? () => set({ runChoices: choices.filter(c => c !== n).map(String) }) : null })),
    add: f.add || '', onAdd: num('add'), addChoice,
    runMax: f.runMax || '', onRunMax: num('runMax'), cipHours: f.cipHours || '', onCipHours: num('cipHours'),
    fillCipHours: f.fillCipHours || '', onFillCipHours: num('fillCipHours'), fillEvery: f.fillEvery || '', onFillEvery: num('fillEvery'),
    updated: P.updatedAt && P.updatedByName ? T.plan.updated.replace('{who}', P.updatedByName || '—').replace('{when}', stampLabel(P.updatedAt)) : '',
    log: (s.planLog || []).map(g => formatLog(g, { T, stLabelOf: k => k, stampLabel })), logLoading: s.planReady && s.planLog === null,
    disabled: !can || !!s.busy || !choices.length || !pos('runMax') || !pos('cipHours') || !pos('fillCipHours') || !pos('fillEvery'),
    save: app.savePlan, pill,
  };
}
