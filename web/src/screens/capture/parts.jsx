// Small pieces shared by the capture flows.
import { Avatar, Icon } from '../../components/index.js';
import { tap } from '../../utils/tap.js';

export function PhotoBg({ c, height }) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: height || '100%', overflow: 'hidden' }}>
      {c.photoUrl
        ? <img src={c.photoUrl} alt="" className="photo-bg" />
        : <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(135deg,#1E3658 0 14px,#18304F 14px 28px)' }} />}
    </div>
  );
}

export function RetakeBtn({ v }) {
  return (
    <div {...tap(v.retake)} style={{ height: 36, padding: '0 14px', borderRadius: 999, background: 'rgba(11,26,48,.55)', display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontSize: 13, fontWeight: 700 }}>
      <Icon name="rotate-ccw" size={16} color="#fff" />{v.t.retake}
    </div>
  );
}

export const num = { width: 22, height: 22, borderRadius: '50%', background: 'var(--blue-500)', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' };

export const customInput = { height: 48, borderRadius: 12, border: '1.5px solid var(--blue-600)', padding: '0 14px', fontSize: 15, color: 'var(--navy-900)', background: '#fff', outline: 'none', width: '100%' };

export function Thumb({ c, size }) {
  return c.photoUrl
    ? <img src={c.photoUrl} alt="" style={{ width: size, height: size, borderRadius: 14, objectFit: 'cover', flex: 'none', border: '1.5px solid var(--blue-200)' }} />
    : <div style={{ width: size, height: size, borderRadius: 14, flex: 'none', background: 'repeating-linear-gradient(135deg,var(--blue-100) 0 8px,var(--blue-50) 8px 16px)', border: '1.5px solid var(--blue-200)' }} />;
}

export function Signature({ v, height }) {
  const t = v.t;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: 14, fontWeight: 800 }}>{t.signHere}</div>
        <div {...tap(v.clearSig)} style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue-600)' }}>{t.clear}</div>
      </div>
      <canvas ref={v.sigRef} className="sig-canvas" style={{ height }} aria-label={t.signHere} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#fff', border: '1.5px solid var(--blue-200)', borderRadius: 14 }}>
        <Avatar src={v.me.avatar} size={36} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}><span style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600 }}>{t.reporter}</span><span style={{ fontSize: 14, fontWeight: 800 }}>{v.me.name} · {v.me.roleLabel}</span></div>
        <span style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, flex: 'none' }}>{v.nowLabel}</span>
      </div>
    </div>
  );
}
