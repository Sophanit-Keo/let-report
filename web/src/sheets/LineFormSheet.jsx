// Add a production line, or edit its name, type, product, target, maximum lot run and CIP filling rule (everyone),
// and its place in the factory: the UHT that feeds it, its filler, speed and pack size (the simulation's Factory board reads them).
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
      <Field label={t.line.uht}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{f.uhts.map((o, i) => <Pill key={i} o={o} h={36} px={14} />)}</div>
        <div style={hint}>{f.uhtEmpty ? t.line.uhtNone : t.line.uhtSub}</div>
      </Field>
      <Field label={t.line.filler}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          {f.fillers.map((o, i) => <Pill key={i} o={o} h={36} px={12} />)}
          {f.otherOn ? <input id="line-filler" aria-label={t.line.fillerPh} value={f.fillerText} onChange={f.onFillerText} placeholder={t.line.fillerPh} maxLength={40}
            style={{ ...inputStyle, width: 160, height: 36, padding: '0 12px', fontSize: 14, fontWeight: 700, borderRadius: 999 }} /> : null}
        </div>
      </Field>
      <div style={col(8)}>
        <div style={{ ...grid(2, 12), alignItems: 'end' }}>
          <Field label={t.line.speed}><input id="line-speed" inputMode="numeric" value={f.packsPerH} onChange={f.onPacksPerH} style={inputStyle} /></Field>
          <Field label={t.line.packMl}><input id="line-pack-ml" inputMode="numeric" value={f.packMl} onChange={f.onPackMl} style={inputStyle} /></Field>
        </div>
        {f.lph ? <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--navy-900)' }}>{f.lph}</div> : null}
      </div>
      <Button type="submit" variant="primary" fullWidth disabled={f.disabled}>{f.isNew ? t.line.create : t.line.save}</Button>
    </form>
  );
}
