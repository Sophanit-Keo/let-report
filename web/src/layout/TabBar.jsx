// Bottom tab bar with the green camera button (phones and tablets).
import { Icon } from '../components/index.js';
import { tap } from '../utils/tap.js';

export function TabBar({ v }) {
  const Tab = ({ tb }) => (
    <div {...tap(tb.go, 'tab')} aria-label={tb.label} data-tour={tb.key}>
      <Icon name={tb.icon} size={24} color={tb.fg} />
      <span className="tab-label" style={{ color: tb.fg }}>{tb.label}</span>
      {tb.hasBadge ? <span className="tab-badge">{tb.badge}</span> : null}
    </div>
  );
  return (
    <nav className={'tabbar' + (v.chatHideTabs ? ' phone-hide' : '')}>
      {v.tabsL.map((tb, i) => <Tab key={i} tb={tb} />)}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div {...tap(v.nav.capture, 'fab')} aria-label={v.t.reportIssue} data-tour="report"><Icon name="camera" size={26} color="#fff" /></div>
      </div>
      {v.tabsR.map((tb, i) => <Tab key={i} tb={tb} />)}
    </nav>
  );
}
