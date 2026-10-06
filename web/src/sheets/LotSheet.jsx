// Lot details: the lot's facts, its events (view, add, edit, delete) and the change log.
// Every change is written to the log by the database; nobody can edit or delete the log.
import { Button, Icon, Pill } from '../components/index.js';
import { tap } from '../utils/tap.js';
import { areaStyle, inputStyle } from '../styles/inline.js';
import { title, col } from './sheetStyles.js';

const label = { fontSize: 13, fontWeight: 700 };
const small = { fontSize: 12, color: 'var(--gray-500)', lineHeight: 1.4 };
const box = { borderRadius: 14, border: '1.5px solid var(--blue-200)', background: '#fff' };
const linkBtn = { fontSize: 13, fontWeight: 700, color: 'var(--blue-600)' };

function When({ value, onChange, bad, name }) {
  return (
    <div style={col(6)}>
      <input type="datetime-local" aria-label={name} value={value} onChange={onChange}
        style={{ ...inputStyle, fontSize: 15, fontWeight: 700, borderColor: bad ? 'var(--red-500)' : 'var(--blue-200)' }} />
      {bad ? <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--red-700)' }}>{bad}</div> : null}
    </div>
  );
}

function Hours({ value, onChange, t }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <input aria-label={t.lotd.hours} inputMode="decimal" value={value} onChange={onChange} style={{ ...inputStyle, width: 90, textAlign: 'center', fontWeight: 700 }} />
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-500)' }}>{t.lot.hoursShort}</span>
    </div>
  );
}

function SaveCancel({ f, t, saveLabel }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      <Button variant="secondary" fullWidth onClick={f.cancel}>{t.lotd.cancel}</Button>
      <Button type="submit" variant="primary" fullWidth disabled={f.disabled}>{saveLabel || t.lotd.save}</Button>
    </div>
  );
}

function EventRow({ e, t, last }) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 'none' }}>
        <div style={{ width: 30, height: 30, borderRadius: 10, background: 'var(--blue-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={e.icon} size={16} color={e.color} /></div>
        {!last ? <div style={{ flex: 1, width: 2, background: 'var(--blue-100)', marginTop: 4 }} /> : null}
      </div>
      <div style={{ ...col(4), flex: 1, minWidth: 0, paddingBottom: last ? 0 : 14 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: e.color, flex: 1, minWidth: 0 }}>{e.label}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-700)', flex: 'none' }}>{e.time}</span>
        </div>
        {e.note ? <div style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.4 }}>{e.note}</div> : null}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {e.by ? <span style={{ ...small, flex: 1 }}>{t.lotd.log.by} {e.by}</span> : <span style={{ flex: 1 }} />}
          {!e.editing && !e.confirming ? <span {...tap(e.edit)} style={linkBtn}>{t.lotd.edit}</span> : null}
          {!e.editing && !e.confirming && e.canDelete ? <span {...tap(e.askDelete)} style={{ ...linkBtn, color: 'var(--red-700)' }}>{t.lotd.del}</span> : null}
        </div>
        {e.confirming ? (
          <div style={{ ...col(8), padding: 12, borderRadius: 12, background: 'var(--red-100)', border: '1.5px solid var(--red-500)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--red-700)' }}>{t.lotd.delQ}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <Button variant="secondary" fullWidth onClick={e.cancelDel}>{t.lotd.cancel}</Button>
              <button type="button" onClick={e.del} style={{ height: 40, borderRadius: 8, border: 'none', background: 'var(--red-700)', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'inherit' }}>{t.lotd.del}</button>
            </div>
          </div>
        ) : null}
        {e.editing ? (
          <form style={{ ...col(10), ...box, padding: 12 }} onSubmit={ev => { ev.preventDefault(); if (!e.editing.disabled) e.editing.save(); }}>
            <div style={label}>{t.lotd.time}</div>
            <When value={e.editing.at} onChange={e.editing.onAt} bad={e.editing.bad} name={t.lotd.time} />
            {e.fixedNote ? <div style={small}>{e.fixedNote}</div> : null}
            {e.editing.statuses ? <><div style={label}>{t.lotd.status}</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{e.editing.statuses.map((o, i) => <Pill key={i} o={o} h={34} px={12} />)}</div></> : null}
            {e.editing.hasHours ? <><div style={label}>{t.lotd.hours}</div><Hours value={e.editing.hours} onChange={e.editing.onHours} t={t} /></> : null}
            {e.editing.reasons ? <><div style={label}>{t.lotd.reason}</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{e.editing.reasons.map((o, i) => <Pill key={i} o={o} h={34} px={12} />)}</div></> : null}
            <div style={label}>{t.lotd.note}</div>
            <textarea aria-label={t.lotd.note} value={e.editing.note} onChange={e.editing.onNote} placeholder={t.lotd.notePh} rows={2} style={{ ...areaStyle, fontSize: 14 }} />
            <SaveCancel f={e.editing} t={t} />
          </form>
        ) : null}
      </div>
    </div>
  );
}

export function LotSheet({ v }) {
  const t = v.t, x = v.lotView;
  if (!x) return null;
  const back = <div {...tap(x.back.go)} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: 'var(--blue-600)', alignSelf: 'flex-start' }}><Icon name="chevron-left" size={16} color="var(--blue-600)" />{x.back.label}</div>;
  if (x.missing) return <div style={col(14)}>{back}<div style={small}>{t.lotd.missing}</div></div>;
  return (
    <div style={col(18)}>
      <div style={{ ...col(6), paddingRight: 40 }}>
        {back}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h2 style={title}>{x.lot}</h2>
          <span style={{ fontSize: 12, fontWeight: 800, padding: '3px 10px', borderRadius: 999, background: x.running ? 'var(--green-100)' : 'var(--gray-100)', color: x.running ? 'var(--green-700)' : 'var(--gray-700)' }}>{x.running ? t.lotd.running : t.lot.ended}</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 600 }}>{x.product}</div>
      </div>

      {/* Facts */}
      <div style={{ ...box, display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))' }}>
        {x.facts.map((f, i) => (
          <div key={i} style={{ ...col(2), padding: '10px 14px', borderTop: i > 1 ? '1px solid var(--blue-100)' : 'none', borderLeft: i % 2 ? '1px solid var(--blue-100)' : 'none' }}>
            <span style={small}>{f.k}</span><span style={{ fontSize: 14, fontWeight: 700 }}>{f.v}</span>
          </div>
        ))}
      </div>
      {x.note ? <div style={{ fontSize: 13, color: 'var(--gray-700)', background: 'var(--blue-50)', borderRadius: 10, padding: '8px 10px', lineHeight: 1.4 }}>{x.note}</div> : null}
      {x.overNote || x.over ? (
        <div style={{ display: 'flex', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--red-700)', lineHeight: 1.4 }}><Icon name="triangle-alert" size={15} color="var(--red-700)" style={{ marginTop: 1 }} />{x.overNote || x.maxLabel}</div>
      ) : null}

      {/* Edit lot info */}
      {x.editing ? (
        <form style={{ ...col(10), ...box, padding: 14 }} onSubmit={e => { e.preventDefault(); if (!x.editing.disabled) x.editing.save(); }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{t.lotd.editLot}</div>
          <div style={label}>{t.lot.number}</div>
          <input aria-label={t.lot.number} value={x.editing.lot} onChange={x.editing.on('lot')} style={{ ...inputStyle, fontSize: 17, fontWeight: 800 }} />
          <div style={label}>{t.lot.product}</div>
          <input aria-label={t.lot.product} value={x.editing.product} onChange={x.editing.on('product')} style={inputStyle} />
          <div style={label}>{t.lot.output}</div>
          <input aria-label={t.lot.output} inputMode="numeric" value={x.editing.qty} onChange={x.editing.on('qty')} style={{ ...inputStyle, width: 120, textAlign: 'center', fontWeight: 800 }} />
          <div style={label}>{t.lot.plan}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {x.editing.plans.map((o, i) => <Pill key={i} o={o} h={36} px={12} />)}
            <input aria-label={t.lot.plan} inputMode="decimal" value={x.editing.plan} onChange={x.editing.on('plan')} style={{ ...inputStyle, width: 72, height: 36, padding: '0 10px', fontSize: 14, fontWeight: 700, textAlign: 'center', borderRadius: 999 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-500)' }}>{t.lot.hoursShort}</span>
          </div>
          {x.editing.special ? <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber-700)' }}>{x.editing.special}</div> : null}
          <div style={label}>{t.lotd.note}</div>
          <textarea aria-label={t.lotd.note} value={x.editing.note} onChange={x.editing.on('note')} rows={2} style={{ ...areaStyle, fontSize: 14 }} />
          {x.over || x.editing.overNote ? <>
            <div style={label}>{x.maxLabel}</div>
            <textarea aria-label={x.maxLabel} value={x.editing.overNote} onChange={x.editing.on('overNote')} rows={2} style={{ ...areaStyle, fontSize: 14 }} />
          </> : null}
          <SaveCancel f={x.editing} t={t} />
        </form>
      ) : <Button variant="secondary" icon="pencil-line" fullWidth onClick={x.openEdit}>{t.lotd.editLot}</Button>}

      {/* Events */}
      <div style={col(10)}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ ...label, flex: 1, fontSize: 15 }}>{t.lotd.events}</div>
          {!x.adding ? <span {...tap(x.openAdd)} style={linkBtn}>+ {t.lotd.addEvent}</span> : null}
        </div>
        {x.adding ? (
          <form style={{ ...col(10), ...box, padding: 14 }} onSubmit={e => { e.preventDefault(); if (!x.adding.disabled) x.adding.save(); }}>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{t.lotd.addEvent}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{x.adding.kinds.map((o, i) => <Pill key={i} o={o} h={34} px={12} />)}</div>
            <div style={label}>{t.lotd.time}</div>
            <When value={x.adding.at} onChange={x.adding.onAt} bad={x.adding.bad} name={t.lotd.time} />
            {x.adding.hasHours ? <><div style={label}>{t.lotd.hours}</div><Hours value={x.adding.hours} onChange={x.adding.onHours} t={t} /></> : null}
            <div style={label}>{t.lotd.note}</div>
            <textarea aria-label={t.lotd.note} value={x.adding.note} onChange={x.adding.onNote} placeholder={t.lotd.notePh} rows={2} style={{ ...areaStyle, fontSize: 14 }} />
            <SaveCancel f={x.adding} t={t} saveLabel={t.lotd.addEvent} />
          </form>
        ) : null}
        {x.loading && !x.events.length ? <div style={small}>{t.lotd.loading}</div> : null}
        {x.error ? <div style={{ fontSize: 12, color: 'var(--red-700)' }}>{x.error}</div> : null}
        {!x.loading && !x.events.length ? <div style={small}>{t.lotd.noEvents}</div> : null}
        {x.events.length ? <div style={{ ...box, padding: 14 }}>{x.events.map((e, i) => <EventRow key={e.id} e={e} t={t} last={i === x.events.length - 1} />)}</div> : null}
      </div>

      {/* Change log */}
      <div style={col(8)}>
        <div style={{ ...label, fontSize: 15 }}>{t.lotd.log.title}</div>
        <div style={small}>{t.lotd.log.sub}</div>
        {!x.log.length ? <div style={small}>{x.loading ? t.lotd.loading : t.lotd.log.empty}</div> : (
          <div style={{ ...box, overflow: 'hidden' }}>
            {x.log.map((g, i) => (
              <div key={g.id} style={{ ...col(3), padding: '10px 14px', borderTop: i ? '1px solid var(--blue-100)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: g.tone, flex: 1, minWidth: 0 }}>{g.title}</span>
                  <span style={{ ...small, flex: 'none' }}>{g.when}</span>
                </div>
                <div style={small}>{t.lotd.log.by} {g.who}</div>
                {g.lines.map((ln, j) => <div key={j} style={{ fontSize: 12, color: 'var(--gray-700)', lineHeight: 1.4 }}>{ln}</div>)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Plant managers can delete the lot (the log keeps it) */}
      {x.canDelete ? (x.confirmDelete ? (
        <div style={{ ...col(10), padding: 14, borderRadius: 14, background: 'var(--red-100)', border: '1.5px solid var(--red-500)' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--red-700)' }}>{t.lotd.delLotQ}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Button variant="secondary" fullWidth onClick={x.cancelDelete}>{t.lotd.cancel}</Button>
            <button type="button" onClick={x.del} style={{ height: 40, borderRadius: 8, border: 'none', background: 'var(--red-700)', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'inherit' }}>{t.lotd.delLot}</button>
          </div>
        </div>
      ) : (
        <div {...tap(x.askDelete)} style={{ height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: 'var(--red-700)', border: '2px solid var(--red-100)' }}>
          <Icon name="trash-2" size={16} color="var(--red-700)" />{t.lotd.delLot}
        </div>
      )) : null}
    </div>
  );
}
