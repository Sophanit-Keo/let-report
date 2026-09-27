// Bottom bar on the report detail: the current role's next action and escalation.
import { Button, Icon } from '../../components/index.js';

export function DetailActionBar({ v }) {
  const b = v.detailBar;
  if (!b.show) return null;
  return (
    <div className="bottombar">
      <div className="bottombar-inner">
        {b.canAct ? <Button variant={b.variant} icon={b.icon} fullWidth onClick={b.onClick}>{b.label}</Button> : null}
        {b.canEsc ? <Button variant="secondary" icon="arrow-up-right" fullWidth onClick={b.escalate}>{b.escLabel}</Button> : null}
        {b.waiting ? (
          <div style={{ height: 40, borderRadius: 10, background: 'var(--gray-100)', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, fontWeight: 700, padding: '0 12px', textAlign: 'center' }}>
            <Icon name="hourglass" size={16} color="var(--gray-500)" />{b.label}
          </div>
        ) : null}
      </div>
    </div>
  );
}
