// Per-browser preferences (language). Reports and everything shared live in Supabase.
const KEY = 'let-report:prefs';

export function loadPrefs() {
  try { return JSON.parse(window.localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
}

export function savePrefs(patch) {
  try { window.localStorage.setItem(KEY, JSON.stringify({ ...loadPrefs(), ...patch })); } catch (e) { /* storage blocked */ }
}
