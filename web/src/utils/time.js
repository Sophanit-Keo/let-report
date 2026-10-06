// Turns stored ISO times into short labels: "09:12" today, "Wed" this week, "12 Sep" older.
// Anything that isn't an ISO time (e.g. "Today 12:00") is shown as it is.
const isIso = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v);
const hm = d => String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
const startOfDay = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
export const daysAgo = v => (isIso(v) ? Math.round((startOfDay(new Date()) - startOfDay(new Date(v))) / 86400000) : 99);

export function timeLabel(v) {
  if (!isIso(v)) return v || '';
  const d = new Date(v), ago = daysAgo(v);
  if (ago === 0) return hm(d);
  if (ago > 0 && ago < 7) return d.toLocaleDateString('en-GB', { weekday: 'short' });
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// Activity timestamps: "09:12" today, "Wed 14:05" this week.
export function stampLabel(v) {
  if (!isIso(v)) return v || '';
  const ago = daysAgo(v);
  return ago === 0 ? hm(new Date(v)) : timeLabel(v) + ' ' + hm(new Date(v));
}

export const nowIso = () => new Date().toISOString();
export function addDaysIso(days) { const d = startOfDay(new Date()); d.setDate(d.getDate() + days); d.setHours(8, 0, 0, 0); return d.toISOString(); }
export const isDue = iso => isIso(iso) && new Date(iso) <= new Date();

// A length of time: "45 min", "2 h 10 min", "1 d 3 h". Never negative.
export function durLabel(ms) {
  const m = Math.max(0, Math.round(ms / 60000)), h = Math.floor(m / 60), d = Math.floor(h / 24);
  if (d >= 1) return d + ' d ' + (h % 24) + ' h';
  if (h >= 1) return h + ' h' + (m % 60 ? ' ' + (m % 60) + ' min' : '');
  return m + ' min';
}
