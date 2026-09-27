// Production line control: status, output today, note for the next shift, open reports.
// Managers can also edit the line's info or remove it.
import { Button, Icon } from '../components/index.js';
import { tap } from '../utils/tap.js';
import { areaStyle, inputStyle } from '../styles/inline.js';
import { title, col } from './sheetStyles.js';

export function LineSheet({ v }) {
  const t = v.t, l = v.lineSheet;
  if (!l) return null;
  const label = { fontSize: 13, fontWeight: 700 };
  return (
    <div style={col(18)}>
      <div style={{ ...col(4), paddingRight: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: 'var(--navy-900)', color: '#fff' }}>{l.type}</span>
          <h2 style={title}>{l.name}</h2>
        </div>
        <div style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 600 }}>{l.product}</div>
        <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{l.updated}</div>
      </div>

      <div style={col(8)}>
        <div style={label}>{t.line.status}</div>
        <div role="radiogroup" aria-label={t.line.status} style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 8 }}>
          {l.states.map((o, i) => (
            <div key={i} {...tap(o.pick, 'pill-tap')} role="radio" aria-checked={o.on}
              style={{ minHeight: 44, padding: '6px 12px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, background: o.bg, color: o.fg, border: '1.5px solid ' + o.bd, transition: 'all 120ms' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: o.dot, flex: 'none' }} />{o.label}
            </div>
          ))}
        </div>
      </div>

      <div style={col(8)}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={label}>{t.line.output}</div>
          <div {...tap(l.reset)} style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue-600)' }}>{t.line.reset}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <input aria-label={t.line.output} inputMode="numeric" value={String(l.qty)} onChange={l.onQty}
            style={{ ...inputStyle, width: 110, height: 52, fontSize: 26, fontWeight: 800, textAlign: 'center', letterSpacing: '-0.02em' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-500)' }}>/ {l.target} {t.pal}</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'var(--gray-100)', overflow: 'hidden' }}><div style={{ height: '100%', width: l.pct, background: l.bar, borderRadius: 3, transition: 'width 200ms' }} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 8 }}>
          {l.steps.map((o, i) => (
            <div key={i} {...tap(o.pick, 'pill-tap')} style={{ height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, background: '#fff', border: '1.5px solid var(--blue-200)', color: 'var(--navy-900)' }}>{o.label}</div>
          ))}
        </div>
      </div>

      <div style={col(8)}>
        <div style={label}>{t.line.note}</div>
        <textarea value={l.note} onChange={l.onNote} placeholder={t.line.notePh} rows={2} style={{ ...areaStyle, fontSize: 14 }} />
        {l.noteDirty ? <Button variant="secondary" fullWidth onClick={l.saveNote}>{t.line.saveNote}</Button> : null}
      </div>

      <div {...tap(l.seeIssues, 'card-tap')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 14, border: '1.5px solid var(--blue-200)', background: 'var(--blue-50)' }}>
        <Icon name={l.issues ? 'triangle-alert' : 'circle-check'} size={18} color={l.issues ? 'var(--red-700)' : 'var(--green-700)'} />
        <span style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{t.line.seeIssues}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: l.issues ? 'var(--red-700)' : 'var(--gray-500)' }}>{l.issues}</span>
        <Icon name="chevron-right" size={16} color="var(--navy-300)" />
      </div>

      {l.canManage ? (
        l.confirm ? (
          <div style={{ ...col(10), padding: 14, borderRadius: 14, background: 'var(--red-100)', border: '1.5px solid var(--red-500)' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--red-700)' }}>{t.line.removeQ}</div>
            <div style={{ fontSize: 13, color: 'var(--red-700)', lineHeight: 1.4 }}>{t.line.removeSub}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <Button variant="secondary" fullWidth onClick={l.cancelRemove}>{t.line.cancel}</Button>
              <button type="button" onClick={l.remove} style={{ height: 40, borderRadius: 8, border: 'none', background: 'var(--red-700)', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'inherit' }}>{t.line.remove}</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Button variant="secondary" icon="pencil-line" fullWidth onClick={l.edit}>{t.line.edit.split(' ')[0]}</Button>
            <div {...tap(l.askRemove)} style={{ height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: 'var(--red-700)', border: '2px solid var(--red-100)' }}>
              <Icon name="trash-2" size={16} color="var(--red-700)" />{t.line.remove}
            </div>
          </div>
        )
      ) : null}
    </div>
  );
}
