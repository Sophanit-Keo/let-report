// AlertsScreen: notifications for the current role (unread dot).
import { Icon } from '../../components/index.js';
import { tap } from '../../utils/tap.js';

const card = { background: '#fff', border: '1.5px solid var(--blue-200)', borderRadius: 20 };

export function AlertsScreen({ v }) {
  return (
    <div className="page narrow">
      <h1 style={{ margin: 0, fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em' }}>{v.t.alerts}</h1>
      <div style={{ ...card, overflow: 'hidden' }}>
        {v.alertItems.map((n, i) => (
          <div key={i} {...tap(n.open)} style={{ display: 'flex', gap: 12, padding: '14px 16px', borderTop: '1px solid ' + n.bd, background: n.bg }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: n.icBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <Icon name={n.icon} size={18} color={n.icFg} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ fontSize: 14, lineHeight: 1.4, fontWeight: 600 }}>{n.text}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{n.t}</div>
            </div>
            {n.unread ? <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue-500)', marginTop: 6, flex: 'none' }} /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
