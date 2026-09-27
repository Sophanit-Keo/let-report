// Report flow A: photo with dark overlay chips.
import { Icon } from '../../components/index.js';
import { tap } from '../../utils/tap.js';
import { PhotoBg, RetakeBtn, num } from './parts.jsx';

// Flow A — photo with dark chips sheet

export function OverlayFlow({ v }) {
  const t = v.t, c = v.cap;
  return (
    <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', animation: 'lrFade 200ms cubic-bezier(.2,.7,.2,1)' }}>
      <PhotoBg c={c} />
      <div className="cap-top" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
        <RetakeBtn v={v} />
        <span style={{ font: '600 11px ui-monospace,Menlo,monospace', color: '#9AABC3' }}>{c.photoUrl ? '' : c.photoName}</span>
      </div>
      <div style={{ flex: 1, minHeight: 120 }} />
      <div className="cap-bottom" style={{ position: 'relative', background: 'var(--navy-900)', borderRadius: '28px 28px 0 0', padding: '20px 16px 0', display: 'flex', flexDirection: 'column', gap: 14, animation: 'lrUp 200ms cubic-bezier(.2,.7,.2,1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff' }}>
          <span style={num}>1</span><span style={{ fontSize: 15, fontWeight: 800 }}>{t.whatType}</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {v.catsDark.map((k, i) => (
            <div key={i} {...tap(k.pick)} style={{ height: 40, padding: '0 12px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 6, background: k.bg, color: k.fg, fontSize: 13, fontWeight: 700, transition: 'all 120ms cubic-bezier(.2,.7,.2,1)' }}>
              <Icon name={k.icon} size={16} color={k.fg} />{k.label}
            </div>
          ))}
        </div>
        {c.isCustom ? <input value={c.customText} onChange={v.onCustom} placeholder={t.customPh} autoFocus style={{ height: 46, borderRadius: 12, border: '1.5px solid rgba(255,255,255,.3)', background: 'rgba(255,255,255,.08)', padding: '0 14px', fontSize: 15, color: '#fff', outline: 'none', animation: 'lrFade 160ms' }} /> : null}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', opacity: c.sevOp, transition: 'opacity 200ms' }}>
          <span style={num}>2</span><span style={{ fontSize: 15, fontWeight: 800 }}>{t.howSerious}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 6, opacity: c.sevOp, pointerEvents: c.sevPe, transition: 'opacity 200ms' }}>
          {v.sevsDark.map((s, i) => (
            <div key={i} {...tap(s.pick)} style={{ height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, background: s.bg, color: s.fg, textAlign: 'center', padding: '0 4px' }}>{s.label}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
