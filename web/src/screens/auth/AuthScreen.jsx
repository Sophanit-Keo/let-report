// Sign in / create account / reset password. Also the loading, error and "not set up" screens.
import { useState } from 'react';
import { Button, Field, Icon, LangToggle } from '../../components/index.js';
import { tap } from '../../utils/tap.js';
import { inputStyle } from '../../styles/inline.js';

function Shell({ v, children }) {
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="images/logo-badge.jpg" alt="" width="40" height="40" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
          <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', flex: 1, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Let Report</div>
          {v ? <LangToggle v={v} /> : null}
        </div>
        {children}
      </div>
    </div>
  );
}

export function AuthScreen({ v, app }) {
  const t = v.t;
  const [mode, setMode] = useState('in');          // in | up | reset
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const submit = async e => {
    e.preventDefault();
    setError(''); setInfo('');
    if (mode !== 'reset' && password.length < 6) { setError(t.pwShort); return; }
    setBusy(true);
    try {
      if (mode === 'in') await app.signIn(email.trim(), password);
      else if (mode === 'up') { const r = await app.signUp(email.trim(), password, name.trim()); if (r.needsConfirm) { setInfo(t.confirmEmail); setMode('in'); } }
      else { await app.resetPassword(email.trim()); setInfo(t.resetSent); setMode('in'); }
    } catch (err) { setError(err.message); }
    setBusy(false);
  };
  const switchTo = m => () => { setMode(m); setError(''); setInfo(''); };

  return (
    <Shell v={v}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h1 style={{ margin: 0, fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em' }}>{mode === 'up' ? t.signUp : mode === 'reset' ? t.forgot : t.signIn}</h1>
        <div style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.45 }}>{mode === 'up' ? t.firstUser : t.tagline}</div>
      </div>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} noValidate>
        {mode === 'up' ? (
          <Field label={t.yourName}><input id="auth-name" value={name} onChange={e => setName(e.target.value)} autoComplete="name" required style={inputStyle} /></Field>
        ) : null}
        <Field label={t.email}><input id="auth-email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" inputMode="email" autoCapitalize="none" required style={inputStyle} /></Field>
        {mode !== 'reset' ? (
          <Field label={t.password}><input id="auth-password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'up' ? 'new-password' : 'current-password'} required style={inputStyle} /></Field>
        ) : null}
        {error ? <div role="alert" style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: 'var(--red-100)', color: 'var(--red-700)', borderRadius: 12, padding: '10px 12px', fontSize: 13, fontWeight: 700, lineHeight: 1.4 }}><Icon name="circle-x" size={16} />{error}</div> : null}
        {info ? <div role="status" style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: 'var(--green-100)', color: 'var(--green-700)', borderRadius: 12, padding: '10px 12px', fontSize: 13, fontWeight: 700, lineHeight: 1.4 }}><Icon name="circle-check" size={16} />{info}</div> : null}
        <Button type="submit" variant="primary" fullWidth disabled={busy || !email || (mode !== 'reset' && !password) || (mode === 'up' && !name.trim())}>
          {busy ? '…' : mode === 'up' ? t.signUp : mode === 'reset' ? t.forgot.replace('?', '') : t.signIn}
        </Button>
      </form>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', fontSize: 14 }}>
        {mode === 'in' ? <div {...tap(switchTo('reset'))} style={{ color: 'var(--blue-600)', fontWeight: 700 }}>{t.forgot}</div> : null}
        {mode === 'in'
          ? <div style={{ color: 'var(--gray-500)' }}>{t.noAccount} <span {...tap(switchTo('up'))} style={{ color: 'var(--blue-600)', fontWeight: 700 }}>{t.signUp}</span></div>
          : <div style={{ color: 'var(--gray-500)' }}>{t.haveAccount} <span {...tap(switchTo('in'))} style={{ color: 'var(--blue-600)', fontWeight: 700 }}>{t.signIn}</span></div>}
      </div>
    </Shell>
  );
}

export function LoadingScreen({ v }) {
  return (
    <Shell>
      <div role="status" style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--gray-500)', fontWeight: 600, fontSize: 14 }}>
        <span className="spinner" />{v.t.loading}
      </div>
    </Shell>
  );
}

export function LoadErrorScreen({ v, app }) {
  return (
    <Shell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h1 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>{v.t.loadFailed}</h1>
        <div style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.45 }}>{app.state.loadError}</div>
      </div>
      <Button variant="primary" fullWidth icon="rotate-ccw" onClick={() => { app.setState({ booting: true, loadError: null }); app.refresh(true); }}>{v.t.retry}</Button>
      <div {...tap(app.signOut)} style={{ textAlign: 'center', color: 'var(--gray-500)', fontWeight: 700, fontSize: 14 }}>{v.t.signOut}</div>
    </Shell>
  );
}

export function NotConfiguredScreen({ v }) {
  return (
    <Shell>
      <h1 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>{v.t.notConfigured}</h1>
      <div style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.5 }}>{v.t.notConfiguredSub}</div>
    </Shell>
  );
}

export function TurnedOffScreen({ v, app }) {
  return (
    <Shell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h1 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>{v.t.people.offTitle}</h1>
        <div style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.5 }}>{v.t.people.offSub}</div>
      </div>
      <Button variant="secondary" fullWidth onClick={app.signOut}>{v.t.signOut}</Button>
    </Shell>
  );
}
