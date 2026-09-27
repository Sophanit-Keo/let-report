// CloseSheet: QC, QA or Supervisor closes a trouble with a short note on how it was solved.
import { Button, Field } from '../components/index.js';
import { areaStyle } from '../styles/inline.js';
import { title, col } from './sheetStyles.js';

export function CloseSheet({ v }) {
  const t = v.t, c = v.closeForm;
  return (
    <div style={col(16)}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h2 style={title}>{t.closeTitle}</h2>
        <div style={{ fontSize: 13, color: c.crit ? 'var(--red-700)' : 'var(--gray-500)', lineHeight: 1.4 }}>{c.crit ? t.closeCritSub : t.closeSub}</div>
      </div>
      <Field label={t.closeNoteL}><textarea id="close-note" value={c.note} onChange={v.onCloseNote} rows={3} style={{ ...areaStyle, fontSize: 14 }} /></Field>
      <Button variant="success" icon={c.crit ? 'stamp' : 'circle-check'} fullWidth disabled={c.disabled} onClick={v.doClose}>{c.crit ? t.closeAskBtn : t.closeBtn}</Button>
    </div>
  );
}
