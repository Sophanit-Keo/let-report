// QA decision for a held product after a failed hold check.
import { Button, Field, Icon, Pill } from '../components/index.js';
import { tap } from '../utils/tap.js';
import { areaStyle } from '../styles/inline.js';
import { title, col, grid } from './sheetStyles.js';

export function DecisionSheet({ v }) {
  const t = v.t;
  return (
    <div style={col(16)}>
      <div style={col(4)}>
        <h2 style={title}>{t.decTitle}</h2>
        <div style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.45 }}>{v.decSub}</div>
      </div>
      <div role="radiogroup" style={col(8)}>
        {v.decOpts.map((o, i) => (
          <div key={i} {...tap(o.pick)} role="radio" aria-checked={o.dot !== 'transparent'} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12, borderRadius: 14, border: '1.5px solid ' + o.bd, background: o.bg, transition: 'all 120ms cubic-bezier(.2,.7,.2,1)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: o.icBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <Icon name={o.icon} size={18} color={o.icFg} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 800 }}>{o.label}</span>
              <span style={{ fontSize: 12, color: 'var(--gray-500)', lineHeight: 1.35 }}>{o.sub}</span>
            </div>
            <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid ' + o.radio, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: o.dot }} /></div>
          </div>
        ))}
      </div>
      {v.dec.showSched ? (
        <div style={{ ...col(12), animation: 'lrFade 160ms' }}>
          <Field label={t.hcRemind}>
            <div style={grid(3)}>{v.decDays.map((o, i) => <Pill key={i} o={o} h={36} px={8} />)}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="bell-ring" size={14} color="var(--gray-500)" />{v.dec.dueText}</div>
          </Field>
          <Field label={t.hcWho}><div style={grid(2)}>{v.decOwners.map((o, i) => <Pill key={i} o={o} h={36} px={8} />)}</div></Field>
        </div>
      ) : null}
      {v.dec.showText ? <textarea value={v.dec.text} onChange={v.onDecText} placeholder={t.decOtherPh} rows={3} style={{ ...areaStyle, fontSize: 14 }} /> : null}
      <Button variant="primary" fullWidth disabled={v.dec.disabled} onClick={v.confirmDecision}>{t.decConfirm}</Button>
    </div>
  );
}
