// Production line control: the lot running now (start / finish it, CIP after it), status, output today,
// note for the next shift, open reports, and the history of lots that ended on this line.
// Everyone can edit the line's info (name, type, product, target); only managers can remove it.
import { Button, Icon, Pill } from '../components/index.js';
import { tap } from '../utils/tap.js';
import { areaStyle, inputStyle } from '../styles/inline.js';
import { title, col, grid } from './sheetStyles.js';

const box = { borderRadius: 14, padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'center' };
const small = { fontSize: 12, color: 'var(--gray-500)', lineHeight: 1.4 };
const dashed = { fontSize: 13, color: 'var(--gray-500)', padding: '12px 14px', border: '1.5px dashed var(--blue-200)', borderRadius: 14 };
const hourBtn = { height: 36, padding: '0 12px', borderRadius: 999, display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 700, background: '#fff', color: 'var(--blue-700)', border: '1.5px solid var(--blue-200)' };

// The lot running now, the CIP countdown, or "no lot", with the start / finish actions and forms.
function LotNow({ l, t, label }) {
  return (
    <div style={col(8)}>
      <div style={label}>{l.lot ? t.lot.running : l.cip ? t.lot.cip : t.lot.title}</div>
      {l.lot ? (
        <div style={{ ...box, background: 'var(--green-100)', border: '1.5px solid var(--green-500)' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="play" size={20} color="var(--green-700)" /></div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--green-700)' }}>{l.lot.lot}</div>
            <div style={{ fontSize: 12, color: 'var(--green-700)', lineHeight: 1.4 }}>{l.product}{l.lot.started ? ' · ' + t.lot.started + ' ' + l.lot.started : ''}{l.lot.dur ? ' · ' + t.lot.runFor + ' ' + l.lot.dur : ''}</div>
          </div>
        </div>
      ) : l.cip ? (
        <div style={{ ...col(8), borderRadius: 14, padding: '12px 14px', background: l.cip.done ? 'var(--green-100)' : 'var(--blue-50)', border: '1.5px solid ' + (l.cip.done ? 'var(--green-500)' : 'var(--blue-300)') }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name={l.cip.done ? 'circle-check' : 'hourglass'} size={18} color={l.cip.done ? 'var(--green-700)' : 'var(--blue-700)'} />
            <div style={{ flex: 1, fontSize: 14, fontWeight: 800, color: l.cip.done ? 'var(--green-700)' : 'var(--blue-700)' }}>{t.lot.cip}{l.cip.reason ? ' · ' + l.cip.reason : ''}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: l.cip.done ? 'var(--green-700)' : 'var(--navy-900)' }}>{l.cip.done ? l.cip.leftLabel + ' ' + t.lot.cipOver : l.cip.leftLabel + ' ' + t.lot.cipLeft}</div>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: '#fff', overflow: 'hidden' }}><div style={{ height: '100%', width: l.cip.pct, background: l.cip.done ? 'var(--green-500)' : 'var(--blue-500)', borderRadius: 3, transition: 'width 400ms' }} /></div>
          <div style={small}>{l.cip.done ? t.lot.cipDone : t.lot.cipSet + ' ' + l.cip.planned + ' · ' + t.lot.cipEnds + ' ' + l.cip.ends}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ ...small, flex: 1 }}>{t.lot.cipLonger}</span>
            {[1, 2, 4].map(h => <div key={h} {...tap(() => l.extend(h), 'pill-tap')} style={hourBtn}>+{h} {t.lot.hoursShort}</div>)}
          </div>
        </div>
      ) : l.idleLot ? (
        <div style={{ ...box, background: 'var(--gray-100)', border: '1.5px solid var(--gray-300)' }}>
          <Icon name="circle-pause" size={20} color="var(--gray-700)" />
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em' }}>{l.idleLot}</div>
            <div style={small}>{l.product}</div>
          </div>
        </div>
      ) : (
        <div style={dashed}>{t.lot.none}</div>
      )}

      {!l.startForm && !l.endForm ? (
        l.canFinish
          ? <Button variant="navy" icon="square" fullWidth onClick={l.openFinish}>{t.lot.finish}</Button>
          : <Button variant="success" icon="play" fullWidth onClick={l.openStart}>{l.startLabel}</Button>
      ) : null}

      {l.startForm ? (
        <form style={{ ...col(12), padding: 14, borderRadius: 14, border: '1.5px solid var(--blue-200)', background: '#fff' }} onSubmit={e => { e.preventDefault(); if (!l.startForm.disabled) l.startForm.save(); }}>
          <div style={label}>{t.lot.number}</div>
          <input id="lot-number" value={l.startForm.lot} onChange={l.startForm.onLot} placeholder={t.lot.numberPh} autoCapitalize="characters" autoFocus style={{ ...inputStyle, fontSize: 18, fontWeight: 800, letterSpacing: '0.02em' }} />
          <div style={label}>{t.lot.product}</div>
          {l.startForm.products.length ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{l.startForm.products.map((o, i) => <Pill key={i} o={o} h={34} px={12} />)}</div> : null}
          <input id="lot-product" value={l.startForm.product} onChange={l.startForm.onProduct} placeholder="ADCaMg 100ml" style={inputStyle} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Button variant="secondary" fullWidth onClick={l.startForm.cancel}>{t.lot.cancel}</Button>
            <Button type="submit" variant="success" icon="play" fullWidth disabled={l.startForm.disabled}>{t.lot.start}</Button>
          </div>
        </form>
      ) : null}

      {l.endForm ? (
        <form style={{ ...col(12), padding: 14, borderRadius: 14, border: '1.5px solid var(--navy-500)', background: '#fff' }} onSubmit={e => { e.preventDefault(); if (!l.endForm.disabled) l.endForm.save(); }}>
          <div style={col(2)}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{t.lot.finish} · {l.endForm.lot}</div>
            <div style={small}>{t.lot.finishSub}</div>
            <div style={small}>{l.endForm.product} · {t.lot.started} {l.endForm.started}{l.endForm.ran ? ' · ' + t.lot.ran + ' ' + l.endForm.ran : ''}</div>
          </div>
          <div style={label}>{t.lot.output}</div>
          <input aria-label={t.lot.output} inputMode="numeric" value={l.endForm.qty} onChange={l.endForm.onQty} style={{ ...inputStyle, width: 120, fontSize: 20, fontWeight: 800, textAlign: 'center' }} />
          <div style={label}>{t.lot.cipTime}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {l.endForm.hours.map((o, i) => <Pill key={i} o={o} h={36} px={12} />)}
            <input aria-label={t.lot.cipTime} inputMode="decimal" value={l.endForm.hoursText} onChange={l.endForm.onHours} placeholder={t.lot.hoursPh} style={{ ...inputStyle, width: 72, height: 36, padding: '0 10px', fontSize: 14, fontWeight: 700, textAlign: 'center', borderRadius: 999 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-500)' }}>{t.lot.hoursShort}</span>
          </div>
          <div style={label}>{t.lot.reason}</div>
          <div style={grid(2)}>{l.endForm.reasons.map((o, i) => <Pill key={i} o={o} h={36} px={8} />)}</div>
          <div style={small}>{t.lot.reasonSub}</div>
          <div style={label}>{t.lot.note}</div>
          <textarea value={l.endForm.note} onChange={l.endForm.onNote} placeholder={t.lot.notePh} rows={2} style={{ ...areaStyle, fontSize: 14 }} />
          <div style={col(8)}>
            <Button type="submit" variant="navy" icon="square" fullWidth disabled={l.endForm.disabled}>{t.lot.confirm}</Button>
            <Button variant="secondary" fullWidth onClick={l.endForm.cancel}>{t.lot.cancel}</Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

// Lots that ended on this line, newest first.
function LotHistory({ l, t, label }) {
  return (
    <div style={col(8)}>
      <div style={label}>{t.lot.history}</div>
      {l.history.length ? (
        <div style={{ border: '1.5px solid var(--blue-200)', borderRadius: 14, overflow: 'hidden' }}>
          {l.history.map((h, i) => (
            <div key={h.id} style={{ ...col(3), padding: '10px 14px', borderTop: i ? '1px solid var(--blue-100)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em' }}>{h.lot}</span>
                <span style={{ ...small, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.product}</span>
                <span style={{ fontSize: 13, fontWeight: 800, flex: 'none' }}>{h.qty}</span>
              </div>
              <div style={small}>{h.when}{h.ran ? ' · ' + t.lot.ran + ' ' + h.ran : ''} · {h.cip}{h.by ? ' · ' + t.lot.by + ' ' + h.by : ''}</div>
              {h.note ? <div style={{ fontSize: 12, color: 'var(--gray-700)', lineHeight: 1.4, background: 'var(--blue-50)', borderRadius: 8, padding: '6px 8px' }}>{h.note}</div> : null}
            </div>
          ))}
        </div>
      ) : <div style={dashed}>{t.lot.noHistory}</div>}
    </div>
  );
}

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

      <LotNow l={l} t={t} label={label} />

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

      <LotHistory l={l} t={t} label={label} />

      {l.confirm ? (
        <div style={{ ...col(10), padding: 14, borderRadius: 14, background: 'var(--red-100)', border: '1.5px solid var(--red-500)' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--red-700)' }}>{t.line.removeQ}</div>
          <div style={{ fontSize: 13, color: 'var(--red-700)', lineHeight: 1.4 }}>{t.line.removeSub}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Button variant="secondary" fullWidth onClick={l.cancelRemove}>{t.line.cancel}</Button>
            <button type="button" onClick={l.remove} style={{ height: 40, borderRadius: 8, border: 'none', background: 'var(--red-700)', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'inherit' }}>{t.line.remove}</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: l.canManage ? '1fr 1fr' : '1fr', gap: 8 }}>
          {/* Everyone can edit a line's name, type, product and target */}
          <Button variant="secondary" icon="pencil-line" fullWidth onClick={l.edit}>{l.canManage ? t.line.edit.split(' ')[0] : t.line.edit}</Button>
          {/* Only plant managers can remove a line */}
          {l.canManage ? (
            <div {...tap(l.askRemove)} style={{ height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: 'var(--red-700)', border: '2px solid var(--red-100)' }}>
              <Icon name="trash-2" size={16} color="var(--red-700)" />{t.line.remove}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
