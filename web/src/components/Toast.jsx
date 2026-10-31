// Short message at the top of the screen (errors like "No connection", or confirmations). Its colours are in layout.css (.toast).
import { Icon } from './Icon.jsx';
import { tap } from '../utils/tap.js';

export function Toast({ v }) {
  const t = v.toast;
  if (!t || !t.show) return null;
  return (
    <div {...tap(t.close, 'toast')} role="status" aria-live="polite">
      <Icon name="bell" size={18} />
      <span style={{ flex: 1 }}>{t.text}</span>
      <Icon name="x" size={16} />
    </div>
  );
}
