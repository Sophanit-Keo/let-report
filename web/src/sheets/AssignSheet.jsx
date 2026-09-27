// AssignSheet a corrective action: root cause, task, owner, due.
import { Avatar, Button, Field, Pill } from '../components/index.js';
import { tap } from '../utils/tap.js';
import { areaStyle } from '../styles/inline.js';
import { title, col, grid } from './sheetStyles.js';

export function AssignSheet({ v }) {
  const t = v.t;
  return (
    <div style={col(18)}>
      <h2 style={title}>{t.assign}</h2>
      <Field label={t.rootCause}><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{v.roots.map((o, i) => <Pill key={i} o={o} h={36} />)}</div></Field>
      <Field label={t.whatToDo}><textarea value={v.asg.text || ''} onChange={v.onAsgText} rows={3} style={{ ...areaStyle, fontSize: 14 }} /></Field>
      <Field label={t.owner}>
        <div style={grid(4, 8)}>
          {v.owners.map((o, i) => (
            <div key={i} {...tap(o.pick)} aria-pressed={o.bd === 'var(--blue-600)'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '10px 4px', borderRadius: 14, border: '1.5px solid ' + o.bd, background: o.bg }}>
              <Avatar src={o.avatar} size={40} />
              <div style={{ fontSize: 13, fontWeight: 700 }}>{o.name}</div>
            </div>
          ))}
        </div>
      </Field>
      <Field label={t.due}>
        <div style={grid(3, 8)}>
          {v.dues.map((o, i) => (
            <div key={i} {...tap(o.pick)} style={{ height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, background: o.bg, color: o.fg, border: '1.5px solid ' + o.bd }}>{o.label}</div>
          ))}
        </div>
      </Field>
      <Button variant="primary" fullWidth disabled={v.asgDisabled} onClick={v.doAssign}>{t.assignBtn}</Button>
    </div>
  );
}
