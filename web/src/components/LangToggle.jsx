// EN / ខ្មែរ language switch.
import { tap } from '../utils/tap.js';

export function LangToggle({ v }) {
  return (
    <div role="group" aria-label="Language" style={{ display: 'flex', background: 'var(--c-field)', border: '1.5px solid var(--c-line)', borderRadius: 999, padding: 3, gap: 2, flex: 'none' }}>
      {v.langs.map((l, i) => (
        <div key={i} {...tap(l.pick)} aria-pressed={l.bg !== 'transparent'} style={{ height: 26, padding: '0 10px', borderRadius: 999, display: 'flex', alignItems: 'center', fontSize: 12, fontWeight: 700, background: l.bg, color: l.fg }}>{l.label}</div>
      ))}
    </div>
  );
}
