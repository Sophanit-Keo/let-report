// Current user's avatar; opens the account menu. Its small badge is ink-on-page (navy and white in light, inverted in dark).
import { tap } from '../utils/tap.js';
import { Icon } from './Icon.jsx';
import { Avatar } from './Avatar.jsx';

export function MeButton({ v }) {
  return (
    <div {...tap(v.openRoles)} aria-label={v.t.switchRole} data-tour="me" style={{ position: 'relative' }}>
      <Avatar src={v.me.avatar} size={36} style={{ border: '1.5px solid var(--c-line)' }} />
      <div style={{ position: 'absolute', right: -3, bottom: -3, width: 16, height: 16, borderRadius: '50%', background: 'var(--c-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--c-bg)' }}>
        <Icon name="repeat-2" size={9} color="var(--c-surface)" strokeWidth={3} />
      </div>
    </div>
  );
}
