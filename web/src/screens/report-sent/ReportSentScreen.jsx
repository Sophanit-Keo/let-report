// Confirmation after sending a report.
import { Button, Icon } from '../../components/index.js';

export function ReportSentScreen({ v }) {
  const t = v.t;
  return (
    <div style={{ minHeight: '100%', padding: 'calc(var(--safe-t) + 24px) 28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, textAlign: 'center', animation: 'lrFade 200ms cubic-bezier(.2,.7,.2,1)', maxWidth: 420, margin: '0 auto' }}>
      <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--c-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 10px var(--c-ok-bg)', flex: 'none' }}>
        <Icon name="check" size={44} color="var(--c-brand-ink)" strokeWidth={3} />
      </div>
      <h1 style={{ margin: '10px 0 0', fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em', color: 'var(--c-ink)' }}>{t.sent}</h1>
      <div style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--c-ink-2)', maxWidth: 300 }}>{v.lastId} · {t.sentSub}</div>
      {v.lastCritical ? (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'var(--c-bad-bg)', border: '1.5px solid var(--c-bad)', borderRadius: 14, padding: '12px 14px', textAlign: 'left' }}>
          <Icon name="siren" size={22} color="var(--c-bad-ink)" />
          <div style={{ fontSize: 13, lineHeight: 1.45, color: 'var(--c-bad-ink)', fontWeight: 700 }}>{t.alerted}</div>
        </div>
      ) : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 18 }}>
        <Button variant="primary" fullWidth icon="pencil-line" onClick={v.addDetailsNow}>{t.addDetails}</Button>
        <Button variant="secondary" fullWidth onClick={v.nav.home}>{t.later}</Button>
      </div>
    </div>
  );
}
