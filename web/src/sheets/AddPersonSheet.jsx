// Add a person (plant managers): name, email, temporary password and role. The account works straight away.
import { Button, Field, Pill } from '../components/index.js';
import { tap } from '../utils/tap.js';
import { inputStyle } from '../styles/inline.js';
import { title, col, grid } from './sheetStyles.js';

export function AddPersonSheet({ v }) {
  const t = v.t, a = v.addPerson;
  return (
    <form style={col(16)} onSubmit={e => { e.preventDefault(); if (!a.disabled) a.save(); }}>
      <h2 style={{ ...title, paddingRight: 40 }}>{t.people.addTitle}</h2>
      <Field label={t.people.name}><input id="new-name" value={a.name} onChange={a.onName} autoComplete="off" style={inputStyle} /></Field>
      <Field label={t.people.email}><input id="new-email" type="email" inputMode="email" autoCapitalize="none" value={a.email} onChange={a.onEmail} autoComplete="off" style={inputStyle} /></Field>
      <Field label={t.people.tempPw}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input id="new-password" value={a.password} onChange={a.onPassword} autoComplete="new-password" style={{ ...inputStyle, flex: 1, fontFamily: 'ui-monospace,Menlo,monospace' }} />
          <div {...tap(a.generate)} style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue-600)', padding: '0 4px', whiteSpace: 'nowrap' }}>{t.people.generate}</div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--gray-500)', lineHeight: 1.4 }}>{t.people.tempPwSub}</div>
      </Field>
      <Field label={t.people.role}><div role="radiogroup" style={grid(4)}>{a.roles.map((o, i) => <Pill key={i} o={o} h={38} px={4} />)}</div></Field>
      <Button type="submit" variant="primary" icon="user-plus" fullWidth disabled={a.disabled}>{a.busy ? '…' : t.people.add}</Button>
    </form>
  );
}
