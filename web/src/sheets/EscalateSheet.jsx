// EscalateSheet a report to the next level with a reason.
import { Avatar, Button, Field, Pill } from '../components/index.js';
import { areaStyle } from '../styles/inline.js';
import { title, col } from './sheetStyles.js';

export function EscalateSheet({ v }) {
  const t = v.t, e = v.esc;
  return (
    <div style={col(16)}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Avatar src={e.avatar} size={44} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <h2 style={title}>{t.escTitle} {e.toLabel}</h2>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.4 }}>{e.toName} {t.escSub}</div>
        </div>
      </div>
      <Field label={t.escReason}><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{v.escReasons.map((o, i) => <Pill key={i} o={o} h={36} px={12} />)}</div></Field>
      <Field label={t.escNote}><textarea value={e.note} onChange={v.onEscNote} rows={2} style={{ ...areaStyle, fontSize: 14 }} /></Field>
      <Button variant="navy" icon="arrow-up-right" fullWidth disabled={e.disabled} onClick={v.doEscalate}>{t.escBtn}</Button>
    </div>
  );
}
