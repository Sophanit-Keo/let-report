// Screen header with a back/close button and a centered title.
import { tap } from '../utils/tap.js';
import { Icon } from './Icon.jsx';

export function TopBar({ onBack, icon = 'chevron-left', title, label }) {
  return (
    <div className="topbar">
      <div {...tap(onBack, 'icon-btn')} aria-label={label || 'Back'}>
        <Icon name={icon} size={icon === 'x' ? 22 : 24} color="var(--navy-900)" />
      </div>
      <div className="topbar-title">{title}</div>
      <div style={{ width: 40 }} />
    </div>
  );
}
