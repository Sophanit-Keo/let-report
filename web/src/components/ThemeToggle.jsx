// Dark / Light switch, the same pill as the language switch. It sets <html data-theme> (styles/tokens/theme.css),
// keeps the choice in this browser (prefs.theme, read again by index.html before the CSS loads) and matches the
// browser bar's colour. `v` is optional: without it (e.g. before the app has strings) the labels are English.
import { useEffect, useState } from 'react';
import { tap } from '../utils/tap.js';
import { savePrefs } from '../state/storage.js';
import { EN } from '../i18n/en.js';

// Deliberate hex: <meta name="theme-color"> cannot read CSS variables, so these are the two themes' --c-bg (as in index.html).
const BAR = { dark: '#070B0E', light: '#F2F8FE' };

const current = () => (document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

function setTheme(k) {
  document.documentElement.setAttribute('data-theme', k);
  const m = document.querySelector('meta[name="theme-color"]');
  if (m) m.setAttribute('content', BAR[k]);
  savePrefs({ theme: k });
}

export function ThemeToggle({ v }) {
  const [theme, setT] = useState(current);
  // stay in step when another switch (sidebar, account menu, sign-in) changes the theme
  useEffect(() => {
    const MO = window.MutationObserver;
    if (!MO) return undefined;
    const o = new MO(() => setT(current()));
    o.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => o.disconnect();
  }, []);
  const t = (v && v.t && v.t.theme) || EN.theme;
  return (
    <div role="group" aria-label={t.label} style={{ display: 'flex', background: 'var(--c-field)', border: '1.5px solid var(--c-line)', borderRadius: 999, padding: 3, gap: 2, flex: 'none' }}>
      {['dark', 'light'].map(k => {
        const on = theme === k;
        return (
          <div key={k} {...tap(() => { setTheme(k); setT(k); })} aria-pressed={on} style={{ height: 26, padding: '0 10px', borderRadius: 999, display: 'flex', alignItems: 'center', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
            background: on ? 'var(--c-selected-bg)' : 'transparent', color: on ? 'var(--c-selected-ink)' : 'var(--c-muted)' }}>{t[k]}</div>
        );
      })}
    </div>
  );
}
