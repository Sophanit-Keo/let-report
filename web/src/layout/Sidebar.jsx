// Left sidebar navigation (computers, 1024px and wider).
import { Button, Icon, LangToggle, Avatar } from '../components/index.js';
import { tap } from '../utils/tap.js';

export function Sidebar({ v }) {
  const tabs = [...v.tabsL, ...v.tabsR];
  return (
    <aside className="sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 18px' }}>
        <img src="images/logo-badge.jpg" alt="" width="38" height="38" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} />
        <div style={{ fontWeight: 800, fontSize: 19, letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Let Report</div>
      </div>
      <div style={{ padding: '0 4px 14px' }}>
        <Button variant="success" icon="camera" fullWidth onClick={v.nav.capture}>{v.t.reportIssue}</Button>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {tabs.map((tb, i) => {
          const on = tb.fg === 'var(--blue-600)';
          return (
            <div key={i} {...tap(tb.go, 'nav-item' + (on ? ' on' : ''))} aria-current={on ? 'page' : undefined}>
              <Icon name={tb.icon} size={20} />
              <span>{tb.label}</span>
              {tb.hasBadge ? <span className={'nav-badge' + (tb.icon === 'bell' ? '' : ' blue')}>{tb.badge}</span> : null}
            </div>
          );
        })}
      </nav>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 16, borderTop: '1.5px solid var(--blue-100)' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}><LangToggle v={v} /></div>
        <div {...tap(v.openRoles)} aria-label={v.t.switchRole} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 14, border: '1.5px solid var(--blue-200)', background: 'var(--blue-50)' }}>
          <Avatar src={v.me.avatar} size={36} />
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{ fontSize: 14, fontWeight: 800 }}>{v.me.name}</span>
            <span style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.me.roleLabel}</span>
          </div>
          <Icon name="repeat-2" size={16} color="var(--navy-500)" />
        </div>
      </div>
    </aside>
  );
}
