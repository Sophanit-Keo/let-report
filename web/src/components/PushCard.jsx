// "Get notified" card on Home: turn on push notifications for this device (shown until turned on or "Not now").
import { Button } from './Button.jsx';
import { Icon } from './Icon.jsx';

export function PushCard({ p, t }) {
  if (!p || !p.showCard) return null;
  return (
    <div className="push-card" role="region" aria-label={t.push.cardTitle}>
      <div className="push-card-ic"><Icon name="bell-ring" size={22} color="#fff" /></div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{t.push.cardTitle}</div>
          <div style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.45, marginTop: 2 }}>{t.push.cardSub}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="primary" icon="bell" disabled={p.busy} onClick={p.enable}>{p.busy ? '…' : t.push.turnOn}</Button>
          <Button variant="secondary" onClick={p.later}>{t.install.later}</Button>
        </div>
      </div>
    </div>
  );
}
