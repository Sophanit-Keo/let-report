// Report flow C: everything on one sheet over the photo.
import { Button, Icon } from '../../components/index.js';
import { tap } from '../../utils/tap.js';
import { PhotoBg, RetakeBtn, customInput, Signature } from './parts.jsx';

// Flow C — one sheet over the photo

export function OneSheetFlow({ v }) {
  const t = v.t, c = v.cap;
  return (
    <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <PhotoBg c={c} height="42%" />
      <div className="cap-top" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
        <RetakeBtn v={v} />
        <span style={{ font: '600 11px ui-monospace,Menlo,monospace', color: '#9AABC3' }}>{c.photoUrl ? '' : c.photoName}</span>
      </div>
      <div className="cap-bottom" style={{ position: 'absolute', left: 0, right: 0, top: '32%', bottom: 0, background: 'var(--blue-50)', borderRadius: '28px 28px 0 0', padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', animation: 'lrUp 200ms cubic-bezier(.2,.7,.2,1)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 800 }}>{t.whatType}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {v.cats.map((k, i) => (
              <div key={i} {...tap(k.pick)} style={{ height: 36, padding: '0 11px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 6, background: k.bg, border: '1.5px solid ' + k.bd, fontSize: 13, fontWeight: 700, color: k.fg }}>
                <Icon name={k.icon} size={15} color={k.ic} />{k.label}
              </div>
            ))}
          </div>
          {c.isCustom ? <input value={c.customText} onChange={v.onCustom} placeholder={t.customPh} style={{ ...customInput, height: 44 }} /> : null}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 800 }}>{t.howSerious}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 6 }}>
            {v.sevs.map((s, i) => (
              <div key={i} {...tap(s.pick)} style={{ height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, background: s.bg, color: s.fg, border: '1.5px solid ' + s.bd, textAlign: 'center' }}>{s.label}</div>
            ))}
          </div>
        </div>
        <Signature v={v} height={100} />
        <Button variant="primary" icon="send" fullWidth disabled={c.sendDisabled} onClick={v.send}>{t.send}</Button>
      </div>
    </div>
  );
}
