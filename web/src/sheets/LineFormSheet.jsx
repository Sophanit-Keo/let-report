// Add a production line, or edit its name, type, product, target, maximum lot run and CIP filling rule (everyone).
import { Button, Field, Pill } from '../components/index.js';
import { inputStyle } from '../styles/inline.js';
import { title, col, grid } from './sheetStyles.js';

const hint = { fontSize: 12, color: 'var(--gray-500)', lineHeight: 1.4 };

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
      <Field label={t.lot.maxRun}>
        <input id="line-max-run" inputMode="numeric" value={f.maxRun} onChange={f.onMaxRun} style={{ ...inputStyle, width: 140 }} />
        <div style={hint}>{t.lot.maxRunSub}</div>
      </Field>
      <Field label={t.lot.fillEvery}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {f.fillOpts.map((o, i) => <Pill key={i} o={o} h={36} px={14} />)}
          <input id="line-fill-every" aria-label={t.lot.fillEvery} inputMode="numeric" value={f.fillEvery} onChange={f.onFillEvery} style={{ ...inputStyle, width: 72, height: 36, padding: '0 10px', fontSize: 14, fontWeight: 700, textAlign: 'center', borderRadius: 999 }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-500)' }}>{t.lot.hoursShort}</span>
        </div>
        <div style={hint}>{t.lot.fillEverySub}</div>
      </Field>
      <Button type="submit" variant="primary" fullWidth disabled={f.disabled}>{f.isNew ? t.line.create : t.line.save}</Button>
    </form>
  );
}
