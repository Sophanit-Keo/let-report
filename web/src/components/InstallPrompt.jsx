// Card that invites phone and tablet users to install the app (or add it to the Home Screen on iPhone/iPad).
import { useEffect, useState } from 'react';
import { Icon } from './Icon.jsx';
import { Button } from './Button.jsx';
import { tap } from '../utils/tap.js';
import { installMode, onInstallChange, postpone, promptInstall, wasPostponed } from '../utils/install.js';

const DELAY_MS = 2500;   // let the page settle first

export function InstallPrompt({ t, aboveTabs }) {
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(wasPostponed());
  const [, force] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setReady(true), DELAY_MS);
    const off = onInstallChange(() => force(n => n + 1));
    return () => { clearTimeout(id); off(); };
  }, []);

  const mode = installMode();
  if (!ready || hidden || !mode) return null;
  const i = t.install;
  const later = () => { postpone(); setHidden(true); };
  const install = async () => { const ok = await promptInstall(); if (ok) setHidden(true); };

  const step = (n, content) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, lineHeight: 1.35 }}>
      <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--blue-100)', color: 'var(--blue-700)', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{n}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>{content}</span>
    </div>
  );
  const chipIcon = name => (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, background: 'var(--blue-50)', border: '1.5px solid var(--blue-200)' }}>
      <Icon name={name} size={16} color="var(--blue-600)" />
    </span>
  );

  return (
    <div className={'install-card' + (aboveTabs ? ' above-tabs' : '')} role="dialog" aria-label={mode === 'ios' ? i.iosTitle : i.title}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <img src="icons/icon-192.png" alt="" width="48" height="48" style={{ width: 48, height: 48, borderRadius: 12, flex: 'none', boxShadow: 'var(--shadow-card)' }} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em' }}>{mode === 'ios' ? i.iosTitle : i.title}</div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.4 }}>{i.sub}</div>
        </div>
        <div {...tap(later, 'icon-btn')} aria-label={i.later} style={{ width: 32, height: 32, marginTop: -4, marginRight: -4 }}><Icon name="x" size={18} color="var(--navy-500)" /></div>
      </div>

      {mode === 'native' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Button variant="secondary" fullWidth onClick={later}>{i.later}</Button>
          <Button variant="primary" icon="download" fullWidth onClick={install}>{i.btn}</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 12px', borderRadius: 14, background: '#fff', border: '1.5px solid var(--blue-200)' }}>
          {mode === 'ios' ? (
            <>
              {step(1, <>{i.ios1} {chipIcon('share')} <span style={{ color: 'var(--gray-500)', fontWeight: 500 }}>{i.ios1b}</span></>)}
              {step(2, <>{chipIcon('square-plus')} {i.ios2}</>)}
              {step(3, <>{i.ios3}</>)}
            </>
          ) : (
            <>
              {step(1, <>{i.other1} {chipIcon('ellipsis-vertical')}</>)}
              {step(2, <>{chipIcon('smartphone')} {i.other2}</>)}
            </>
          )}
        </div>
      )}
    </div>
  );
}
