// Production plan: the run choices, the normal maximum run and the CIP times the factory uses.
// Line supervisors and the plant manager can change it; every change goes into the change log.
import { Button, Field, Icon } from '../components/index.js';
import { tap } from '../utils/tap.js';
import { inputStyle } from '../styles/inline.js';
import { title, col } from './sheetStyles.js';

const small = { fontSize: 12, color: 'var(--gray-500)', lineHeight: 1.4 };
const numInput = { ...inputStyle, width: 120, textAlign: 'center', fontWeight: 800, fontSize: 17 };

export function PlanSheet({ v }) {
  const t = v.t, p = v.planView;
  if (!p) return null;
  const ro = !p.canEdit;
  const hint = text => <div style={small}>{text}</div>;
  return (
    <form style={col(16)} onSubmit={e => { e.preventDefault(); if (!p.disabled) p.save(); }}>
      <div style={{ ...col(4), paddingRight: 40 }}>
        <h2 style={title}>{t.plan.title}</h2>
        <div style={small}>{t.plan.sub}</div>
        {p.updated ? <div style={small}>{p.updated}</div> : null}
      </div>
      {!p.ready ? <div style={{ ...small, color: 'var(--amber-700)', fontWeight: 700 }}>{t.plan.notReady}</div>
        : ro ? <div style={{ display: 'flex', gap: 6, ...small, color: 'var(--gray-700)', fontWeight: 700 }}><Icon name="shield-check" size={15} color="var(--gray-700)" />{t.plan.viewOnly}</div> : null}

      <Field label={t.plan.site}>
        <input aria-label={t.plan.site} value={p.siteName} onChange={p.onSiteName} placeholder={p.sitePh} readOnly={ro} style={inputStyle} />
        {hint(t.plan.siteSub)}
      </Field>
      <Field label={t.plan.runChoices}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          {p.choices.map((c, i) => (
            <span key={i} style={{ height: 36, padding: '0 6px 0 14px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 800, background: 'var(--navy-900)', color: '#fff', paddingRight: c.remove ? 6 : 14 }}>
              {c.label}
              {c.remove ? <span {...tap(c.remove)} aria-label={'− ' + c.label} style={{ width: 24, height: 24, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={14} color="#fff" /></span> : null}
            </span>
          ))}
          {!ro ? <>
            <input aria-label={t.plan.addChoice} inputMode="numeric" value={p.add} onChange={p.onAdd} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); p.addChoice(); } }}
              style={{ ...inputStyle, width: 72, height: 36, padding: '0 10px', fontSize: 14, fontWeight: 700, textAlign: 'center', borderRadius: 999 }} />
            <span {...tap(p.addChoice, 'pill-tap')} style={{ height: 36, padding: '0 12px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', fontSize: 13, fontWeight: 700, color: 'var(--blue-700)', border: '1.5px solid var(--blue-200)' }}>+ {t.plan.addChoice}</span>
          </> : null}
        </div>
        {hint(t.plan.runChoicesSub)}
      </Field>
      <Field label={t.plan.runMax}><input aria-label={t.plan.runMax} inputMode="numeric" value={p.runMax} onChange={p.onRunMax} readOnly={ro} style={numInput} />{hint(t.plan.runMaxSub)}</Field>
      <Field label={t.plan.cipHours}><input aria-label={t.plan.cipHours} inputMode="decimal" value={p.cipHours} onChange={p.onCipHours} readOnly={ro} style={numInput} /></Field>
      <Field label={t.plan.fillCipHours}><input aria-label={t.plan.fillCipHours} inputMode="decimal" value={p.fillCipHours} onChange={p.onFillCipHours} readOnly={ro} style={numInput} /></Field>
      <Field label={t.plan.fillEvery}><input aria-label={t.plan.fillEvery} inputMode="numeric" value={p.fillEvery} onChange={p.onFillEvery} readOnly={ro} style={numInput} />{hint(t.plan.fillEverySub)}</Field>
      {!ro ? <Button type="submit" variant="primary" fullWidth disabled={p.disabled}>{t.plan.save}</Button> : null}

      {p.ready ? (
        <div style={col(8)}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{t.plan.history}</div>
          {p.logLoading ? <div style={small}>{t.lotd.loading}</div> : !p.log.length ? <div style={small}>{t.lotd.log.empty}</div> : (
            <div style={{ borderRadius: 14, border: '1.5px solid var(--blue-200)', overflow: 'hidden' }}>
              {p.log.map((g, i) => (
                <div key={g.id} style={{ ...col(3), padding: '10px 14px', borderTop: i ? '1px solid var(--blue-100)' : 'none' }}>
                  <div style={{ display: 'flex', gap: 8 }}><span style={{ fontSize: 13, fontWeight: 800, color: g.tone, flex: 1 }}>{g.title}</span><span style={small}>{g.when}</span></div>
                  <div style={small}>{t.lotd.log.by} {g.who}</div>
                  {g.lines.map((ln, j) => <div key={j} style={{ fontSize: 12, color: 'var(--gray-700)' }}>{ln}</div>)}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </form>
  );
}
