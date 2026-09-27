// Current user's avatar; opens the role switcher.
import { tap } from '../utils/tap.js';
import { Icon } from './Icon.jsx';
import { Avatar } from './Avatar.jsx';

export function MeButton({ v }) {
  return (
    <div {...tap(v.openRoles)} aria-label={v.t.switchRole} data-tour="me" style={{ position: 'relative' }}>
      <Avatar src={v.me.avatar} size={36} style={{ border: '1.5px solid var(--blue-200)' }} />
      <div style={{ position: 'absolute', right: -3, bottom: -3, width: 16, height: 16, borderRadius: '50%', background: 'var(--navy-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--blue-50)' }}>
        <Icon name="repeat-2" size={9} color="#fff" strokeWidth={3} />
      </div>
    </div>
  );
}
