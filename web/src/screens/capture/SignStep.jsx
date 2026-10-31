// Last step for flows A and B: summary, signature, send.
import { Button, Icon } from '../../components/index.js';
import { tap } from '../../utils/tap.js';
import { chip } from '../../styles/inline.js';
import { Thumb, Signature } from './parts.jsx';

export function SignStep({ v }) {
  const t = v.t, c = v.cap;
  return (
    <div className="capture-scroll" style={{ background: 'var(--c-bg)', display: 'flex', flexDirection: 'column', animation: 'lrFade 200ms cubic-bezier(.2,.7,.2,1)' }}>
      <div className="cap-top" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px' }}>
        <div {...tap(v.stepBack, 'icon-btn')} aria-label="Back"><Icon name="chevron-left" size={24} color="var(--c-ink)" /></div>
        <div style={{ flex: 1, fontWeight: 700, fontSize: 15, textAlign: 'center', color: 'var(--c-ink)' }}>{t.signSend}</div>
        <div style={{ width: 40 }} />
      </div>
      <div className="cap-bottom" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ background: 'var(--c-surface)', border: '1.5px solid var(--c-line)', borderRadius: 20, padding: 14, display: 'flex', gap: 14, alignItems: 'center' }}>
          <Thumb c={c} size={72} />
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 16, fontWeight: 800, overflowWrap: 'anywhere', color: 'var(--c-ink)' }}>{c.catLabel}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={chip(c.sevBg, c.sevFg)}>{c.sevLabel}</span>
              <span style={chip('var(--c-info-bg)', 'var(--c-info-ink)')}>{c.locLabel}</span>
            </div>
          </div>
        </div>
        <Signature v={v} height={160} />
        {c.critical ? (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'var(--c-bad-bg)', border: '1.5px solid var(--c-bad)', borderRadius: 14, padding: '12px 14px' }}>
            <Icon name="siren" size={20} color="var(--c-bad-ink)" />
            <div style={{ fontSize: 13, lineHeight: 1.45, color: 'var(--c-bad-ink)', fontWeight: 700 }}>{t.willAlert}</div>
          </div>
        ) : null}
        <div style={{ fontSize: 13, color: 'var(--c-muted)', textAlign: 'center' }}>{t.detailsLater}</div>
        <Button variant="primary" icon="send" fullWidth disabled={c.sendDisabled} onClick={v.send}>{t.send}</Button>
      </div>
    </div>
  );
}
