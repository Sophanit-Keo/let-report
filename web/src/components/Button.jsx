// Design-system Button: primary / success / secondary / navy, with hover and press states.
import { useState } from 'react';
import { Icon } from './Icon.jsx';

// Button sizes/variants exactly as the design-system Button (size "sm" is what the app uses).

const SZ = { sm: { h: 40, px: 18, fs: 18, r: 8, ic: 18 }, md: { h: 52, px: 24, fs: 22, r: 10, ic: 22 } };

const V = {
  primary: { bg: 'var(--blue-600)', hv: 'var(--blue-700)', fg: 'var(--white)' },
  success: { bg: 'var(--green-600)', hv: 'var(--green-700)', fg: 'var(--white)' },
  secondary: { bg: 'var(--white)', hv: 'var(--blue-50)', fg: 'var(--blue-700)', bd: 'var(--blue-600)' },
  navy: { bg: 'var(--navy-900)', hv: 'var(--navy-800)', fg: 'var(--white)' },
};

export function Button({ variant = 'primary', size = 'sm', icon, iconRight, fullWidth, disabled, onClick, children, type = 'button' }) {
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);
  const s = SZ[size] || SZ.sm;
  const v = V[variant] || V.primary;
  const st = disabled ? 'disabled' : down ? 'active' : hover ? 'hover' : 'default';
  let bg = v.bg, fg = v.fg, bd = v.bd, shadow = v.bd ? 'none' : 'var(--shadow-button)', ty = 0;
  if (st === 'hover') bg = v.hv;
  if (st === 'active') { bg = v.hv; shadow = v.bd ? 'none' : 'var(--shadow-button-pressed)'; ty = 2; }
  if (st === 'disabled') { bg = 'var(--gray-100)'; fg = 'var(--gray-500)'; bd = 'var(--gray-200)'; shadow = 'none'; }
  return (
    <button
      type={type}
      disabled={st === 'disabled'}
      onClick={onClick}
      onPointerEnter={e => { if (e.pointerType === 'mouse') setHover(true); }}
      onPointerLeave={() => { setHover(false); setDown(false); }}
      onPointerDown={() => setDown(true)}
      onPointerUp={() => setDown(false)}
      onPointerCancel={() => setDown(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, height: s.h, padding: '0 ' + s.px + 'px',
        width: fullWidth ? '100%' : undefined, borderRadius: s.r, border: bd ? '2px solid ' + bd : '2px solid transparent',
        background: bg, color: fg, boxShadow: shadow, transform: 'translateY(' + ty + 'px)', fontFamily: 'inherit', fontWeight: 700,
        fontSize: s.fs, lineHeight: 1, whiteSpace: 'nowrap', cursor: st === 'disabled' ? 'not-allowed' : 'pointer', maxWidth: '100%',
        transition: 'background var(--dur-fast) var(--ease-standard),transform var(--dur-fast) var(--ease-standard),box-shadow var(--dur-fast)',
        WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
      }}
    >
      {icon ? <Icon name={icon} size={s.ic} /> : null}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{children}</span>
      {iconRight ? <Icon name={iconRight} size={s.ic} /> : null}
    </button>
  );
}
