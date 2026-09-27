// Report filters: date, line, product, severity.
import { Button, Field, Pill } from '../components/index.js';
import { tap } from '../utils/tap.js';
import { title, col, grid } from './sheetStyles.js';

export function FiltersSheet({ v }) {
  const t = v.t;
  return (
    <div style={col(18)}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', paddingRight: 44 }}>
        <h2 style={title}>{t.filters}</h2>
        <div {...tap(v.resetF)} style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue-600)' }}>{t.reset}</div>
      </div>
      <Field label={t.fDate}><div style={grid(3)}>{v.fDates.map((o, i) => <Pill key={i} o={o} h={36} px={8} />)}</div></Field>
      <Field label={t.fLine}><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{v.fLines.map((o, i) => <Pill key={i} o={o} h={36} px={12} />)}</div></Field>
      <Field label={t.fProduct}><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{v.fProducts.map((o, i) => <Pill key={i} o={o} h={36} px={12} />)}</div></Field>
      <Field label={t.fSev}><div style={grid(4)}>{v.fSevs.map((o, i) => <Pill key={i} o={o} h={36} px={6} />)}</div></Field>
      <Button variant="primary" fullWidth onClick={v.closeSheet}>{v.showResults}</Button>
    </div>
  );
}
