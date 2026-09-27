// Switch row (e.g. Put product on hold, Urgent).
import { tap } from '../utils/tap.js';
import { Icon } from './Icon.jsx';

export function Toggle({ o, icon, title, sub }) {
  return (
    <div {...tap(o.toggle)} role="switch" aria-checked={o.knob === '21px'} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, background: o.bg, border: '1.5px solid ' + o.bd, transition: 'all 160ms cubic-bezier(.2,.7,.2,1)' }}>
      <Icon name={icon} size={22} color={o.ic} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 14, fontWeight: 700 }}>{title}</span><span style={{ fontSize: 12, color: 'var(--gray-500)', lineHeight: 1.35 }}>{sub}</span></div>
      <div style={{ width: 44, height: 26, borderRadius: 13, background: o.track, position: 'relative', flex: 'none', transition: 'background 160ms' }}><div style={{ position: 'absolute', top: 3, left: o.knob, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(15,45,88,.25)', transition: 'left 160ms cubic-bezier(.2,.7,.2,1)' }} /></div>
    </div>
  );
}
