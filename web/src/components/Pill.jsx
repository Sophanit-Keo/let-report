// Round selectable option used across forms and sheets.
import { tap } from '../utils/tap.js';

// Round selectable pill used across forms and sheets.

export function Pill({ o, h = 38, px = 14, center = true, gap }) {
  return (
    <div {...tap(o.pick, 'pill-tap')} aria-pressed={o.bg === 'var(--navy-900)' || o.bg === 'var(--blue-600)'}
      style={{ minHeight: h, padding: '6px ' + px + 'px', borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: center ? 'center' : undefined,
        gap, fontSize: 13, fontWeight: 700, textAlign: 'center', lineHeight: 1.2, background: o.bg, color: o.fg, border: '1.5px solid ' + o.bd, transition: 'background 120ms, color 120ms' }}>
      {o.label}
    </div>
  );
}
