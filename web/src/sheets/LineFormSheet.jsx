// Add a production line (plant managers), or edit its name, type, product and target (everyone).
import { Button, Field, Pill } from '../components/index.js';
import { inputStyle } from '../styles/inline.js';
import { title, col, grid } from './sheetStyles.js';

export function LineFormSheet({ v }) {
  const t = v.t, f = v.lineForm;
  return (
    <form style={col(16)} onSubmit={e => { e.preventDefault(); if (!f.disabled) f.save(); }}>
      <h2 style={{ ...title, paddingRight: 40 }}>{f.isNew ? t.line.add : t.line.edit}</h2>
      <Field label={t.line.name}><input id="line-name" value={f.name} onChange={f.onName} placeholder="UHT line 5" style={inputStyle} /></Field>
      <Field label={t.line.type}><div style={grid(4)}>{f.types.map((o, i) => <Pill key={i} o={o} h={36} px={6} />)}</div></Field>
      <Field label={t.line.product}>
        {f.products.length ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{f.products.map((o, i) => <Pill key={i} o={o} h={34} px={12} />)}</div> : null}
        <input id="line-product" value={f.product} onChange={f.onProduct} placeholder="Commander" style={inputStyle} />
      </Field>
      <Field label={t.line.target}><input id="line-target" inputMode="numeric" value={f.target} onChange={f.onTarget} style={{ ...inputStyle, width: 140 }} /></Field>
      <Button type="submit" variant="primary" fullWidth disabled={f.disabled}>{f.isNew ? t.line.create : t.line.save}</Button>
    </form>
  );
}
