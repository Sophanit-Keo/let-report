// Round profile photo with a camera badge: tap to take or choose a new picture.
import { Avatar } from './Avatar.jsx';
import { Icon } from './Icon.jsx';

export function PhotoPicker({ src, size = 64, onChange, label, busy }) {
  return (
    <label style={{ position: 'relative', display: 'inline-flex', flex: 'none', cursor: busy ? 'wait' : 'pointer' }} aria-label={label} title={label}>
      <Avatar src={src} size={size} style={{ border: '2px solid #fff', boxShadow: '0 0 0 1.5px var(--blue-200)', opacity: busy ? 0.5 : 1 }} />
      <span style={{ position: 'absolute', right: -2, bottom: -2, width: 26, height: 26, borderRadius: '50%', background: 'var(--blue-600)', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="camera" size={13} color="#fff" />
      </span>
      <input type="file" accept="image/*" onChange={onChange} disabled={busy} style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden' }} />
    </label>
  );
}
