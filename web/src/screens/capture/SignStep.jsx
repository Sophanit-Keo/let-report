// Last step for flows A and B: summary, signature, send.
import { Button, Icon } from '../../components/index.js';
import { tap } from '../../utils/tap.js';
import { chip } from '../../styles/inline.js';
import { Thumb, Signature } from './parts.jsx';

export function SignStep({ v }) {
  const t = v.t, c = v.cap;
  return (
    <div className="capture-scroll" style={{ background: 'var(--blue-50)', display: 'flex', flexDirection: 'column', animation: 'lrFade 200ms cubic-bezier(.2,.7,.2,1)' }}>
      <div className="cap-top" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px' }}>
        <div {...tap(v.stepBack, 'icon-btn')} aria-label="Back"><Icon name="chevron-left" size={24} color="var(--navy-900)" /></div>
        <div style={{ flex: 1, fontWeight: 700, fontSize: 15, textAlign: 'center' }}>{t.signSend}</div>
        <div style={{ width: 40 }} />
      </div>
      <div className="cap-bottom" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ background: '#fff', border: '1.5px solid var(--blue-200)', borderRadius: 20, padding: 14, display: 'flex', gap: 14, alignItems: 'center' }}>
          <Thumb c={c} size={72} />
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 16, fontWeight: 800, overflowWrap: 'anywhere' }}>{c.catLabel}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={chip(c.sevBg, c.sevFg)}>{c.sevLabel}</span>
              <span style={chip('var(--blue-100)', 'var(--blue-700)')}>{c.locLabel}</span>
            </div>
          </div>
        </div>
        <Signature v={v} height={160} />
        {c.critical ? (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'var(--red-100)', border: '1.5px solid var(--red-500)', borderRadius: 14, padding: '12px 14px' }}>
            <Icon name="siren" size={20} color="var(--red-700)" />
            <div style={{ fontSize: 13, lineHeight: 1.45, color: 'var(--red-700)', fontWeight: 700 }}>{t.willAlert}</div>
          </div>
        ) : null}
        <div style={{ fontSize: 13, color: 'var(--gray-500)', textAlign: 'center' }}>{t.detailsLater}</div>
        <Button variant="primary" icon="send" fullWidth disabled={c.sendDisabled} onClick={v.send}>{t.send}</Button>
      </div>
    </div>
  );
}
