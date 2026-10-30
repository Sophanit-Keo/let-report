// Design-system Button: primary / success / secondary / navy, with hover and press states. Colours are the theme's --c-*
// tokens; the secondary outline and two hovers that differ by theme are --lr-btn-* in styles/base.css.
import { useState } from 'react';
import { Icon } from './Icon.jsx';

// Button sizes/variants exactly as the design-system Button (size "sm" is what the app uses).

const SZ = { sm: { h: 40, px: 18, fs: 18, r: 8, ic: 18 }, md: { h: 52, px: 24, fs: 22, r: 10, ic: 22 } };

// bd: an outline (flat, no shadow); ln: an edge on a raised button (keeps its shadow; the same colour as the fill in light).
const V = {
  primary: { bg: 'var(--c-accent)', hv: 'var(--c-accent-hover)', fg: 'var(--c-accent-ink)' },
  success: { bg: 'var(--c-brand)', hv: 'var(--c-brand-hover)', fg: 'var(--c-brand-ink)' },
  secondary: { bg: 'var(--c-field)', hv: 'var(--lr-btn2-hover)', fg: 'var(--c-accent-hover)', bd: 'var(--lr-btn2-line)' },
  navy: { bg: 'var(--c-selected-bg)', hv: 'var(--lr-btn-navy-hover)', fg: 'var(--c-selected-ink)', ln: 'var(--c-selected-line)' },
};

export function Button({ variant = 'primary', size = 'sm', icon, iconRight, fullWidth, disabled, onClick, children, type = 'button' }) {
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);
  const s = SZ[size] || SZ.sm;
  const v = V[variant] || V.primary;
  const st = disabled ? 'disabled' : down ? 'active' : hover ? 'hover' : 'default';
  let bg = v.bg, fg = v.fg, bd = v.bd || v.ln, shadow = v.bd ? 'none' : 'var(--shadow-button)', ty = 0;
  if (st === 'hover') bg = v.hv;
  if (st === 'active') { bg = v.hv; shadow = v.bd ? 'none' : 'var(--shadow-button-pressed)'; ty = 2; }
  if (st === 'disabled') { bg = 'var(--c-raised)'; fg = 'var(--c-muted)'; bd = 'var(--c-line-soft)'; shadow = 'none'; }
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
