// Round selectable option used across forms and sheets.
import { tap } from '../utils/tap.js';

// Round selectable pill used across forms and sheets. The view model gives its colours (--c-selected-* when picked);
// it is pressed when the view model says so (o.on) or when it has a picked colour.
const PICKED = ['var(--c-selected-bg)', 'var(--c-accent)', 'var(--c-brand)'];

export function Pill({ o, h = 38, px = 14, center = true, gap }) {
  return (
    <div {...tap(o.pick, 'pill-tap')} aria-pressed={o.on != null ? !!o.on : PICKED.includes(o.bg)}
      style={{ minHeight: h, padding: '6px ' + px + 'px', borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: center ? 'center' : undefined,
        gap, fontSize: 13, fontWeight: 700, textAlign: 'center', lineHeight: 1.2, background: o.bg, color: o.fg, border: '1.5px solid ' + o.bd, transition: 'background 120ms, color 120ms' }}>
      {o.label}
    </div>
  );
}
