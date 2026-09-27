// Short message at the top of the screen (errors like "No connection", or confirmations).
import { Icon } from './Icon.jsx';
import { tap } from '../utils/tap.js';

export function Toast({ v }) {
  const t = v.toast;
  if (!t || !t.show) return null;
  return (
    <div {...tap(t.close, 'toast')} role="status" aria-live="polite">
      <Icon name="bell" size={18} color="#fff" />
      <span style={{ flex: 1 }}>{t.text}</span>
      <Icon name="x" size={16} color="#fff" />
    </div>
  );
}
