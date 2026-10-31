// Production line control: the lot running now (start / finish it, CIP after it), status, output today,
// note for the next shift, open reports, and the history of lots that ended on this line.
// Everyone can edit the line's info (name, type, product, target); only managers can remove it.
import { Button, Icon, Pill } from '../components/index.js';
import { tap } from '../utils/tap.js';
import { areaStyle, inputStyle } from '../styles/inline.js';
import { title, col, grid, label, small, box as card, dangerPanel, dangerBtn, dangerAsk } from './sheetStyles.js';

const box = { borderRadius: 14, padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'center' };
const dashed = { fontSize: 13, color: 'var(--c-muted)', padding: '12px 14px', border: '1.5px dashed var(--c-line)', borderRadius: 14 };
const hourBtn = { height: 36, padding: '0 12px', borderRadius: 999, display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 700, background: 'var(--c-field)', color: 'var(--c-info-ink)', border: '1.5px solid var(--c-line)' };
const unit = { fontSize: 13, fontWeight: 700, color: 'var(--c-muted)' };
const link = { fontSize: 12, fontWeight: 700, color: 'var(--c-accent)' };
// A lot's facts in large figures (the run time, the lot number)
const big = { fontWeight: 800, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' };

// The lot running now (how long against its plan, CIP filling due), the CIP countdown, or "no lot",
// with the start / finish / CIP filling / continue actions and their forms.
function Bar({ pct, color, bg = 'var(--c-surface)', h = 6 }) {
  return <div style={{ height: h, borderRadius: h / 2, background: bg, overflow: 'hidden' }}><div style={{ height: '100%', width: pct, background: color, borderRadius: h / 2, transition: 'width 400ms' }} /></div>;
}
function Warn({ text, fg }) {
  return <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', fontSize: 12, fontWeight: 700, color: fg, lineHeight: 1.4 }}><Icon name="triangle-alert" size={14} color={fg} style={{ marginTop: 1 }} />{text}</div>;
}
// Date and time the lot started (or ended), with a "Now" shortcut and a message when it is not allowed.
function StartTime({ value, onChange, bad, t, now, name }) {
  return (
    <div style={col(6)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="datetime-local" aria-label={name || t.lot.startTime} value={value} onChange={onChange}
          style={{ ...inputStyle, flex: 1, fontSize: 15, fontWeight: 700, borderColor: bad ? 'var(--c-bad)' : 'var(--c-line)' }} />
        {now ? <div {...tap(now, 'pill-tap')} style={hourBtn}>{t.lot.startNow}</div> : null}
      </div>
      {bad ? <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-bad-ink)' }}>{bad}</div> : null}
    </div>
  );
}

function CipBox({ c, t, extend }) {
  return (
    <div style={{ ...col(8), borderRadius: 14, padding: '12px 14px', background: c.done ? 'var(--c-ok-bg)' : 'var(--c-bg)', border: '1.5px solid ' + (c.done ? 'var(--c-ok)' : 'var(--c-line)') }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name={c.done ? 'circle-check' : 'hourglass'} size={18} color={c.done ? 'var(--c-ok-ink)' : 'var(--c-info-ink)'} />
        <div style={{ flex: 1, fontSize: 14, fontWeight: 800, color: c.done ? 'var(--c-ok-ink)' : 'var(--c-info-ink)' }}>{c.title}</div>
        <div style={{ fontSize: 14, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: c.done ? 'var(--c-ok-ink)' : 'var(--c-ink)' }}>{c.done ? c.leftLabel + ' ' + t.lot.cipOver : c.leftLabel + ' ' + t.lot.cipLeft}</div>
      </div>
      <Bar pct={c.pct} color={c.done ? 'var(--c-ok)' : 'var(--c-info)'} />
      <div style={small}>{c.done ? (c.filling ? '' : t.lot.cipDone) : t.lot.cipSet + ' ' + c.planned + ' · ' + t.lot.cipEnds + ' ' + c.ends}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ ...small, flex: 1 }}>{t.lot.cipLonger}</span>
        {[1, 2, 4].map(h => <div key={h} {...tap(() => extend(h), 'pill-tap')} style={hourBtn}>+{h} {t.lot.hoursShort}</div>)}
      </div>
    </div>
  );
}

function LotNow({ l, t }) {
  if (!l.lotsReady) return <div style={{ ...dashed, color: 'var(--c-warn-ink)', borderColor: 'var(--c-warn)' }}>{t.lot.notReady}</div>;
  const r = l.run, busy = l.startForm || l.endForm || l.fillForm;
  return (
    <div style={col(8)}>
      <div style={label}>{l.lot ? t.lot.running : l.filling ? t.lot.fillCip : l.cip ? t.lot.cip : t.lot.title}</div>
      {l.lot ? (
        <div style={{ ...col(10), borderRadius: 14, padding: '12px 14px', background: r ? r.tc[1] : 'var(--c-ok-bg)', border: '1.5px solid ' + (r ? r.tc[2] : 'var(--c-ok)') }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--c-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="play" size={20} color={r ? r.tc[0] : 'var(--c-ok-ink)'} /></div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ ...big, fontSize: 20, color: r ? r.tc[0] : 'var(--c-ok-ink)' }}>{l.lot.lot}</div>
              <div style={{ fontSize: 12, color: r ? r.tc[0] : 'var(--c-ok-ink)', lineHeight: 1.4 }}>{l.product}{!r && l.lot.started ? ' · ' + t.lot.started + ' ' + l.lot.started : ''}</div>
            </div>
          </div>
          {r ? (
            <div style={col(6)}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ ...big, fontSize: 18, color: r.tc[0] }}>{r.ranLabel}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-ink-2)', flex: 1 }}>{t.lot.of} {r.plan} {t.lot.hoursShort}{r.special ? ' · ' + t.lot.reasons.other : ''}</span>
                <span style={{ fontSize: 12, color: 'var(--c-ink-2)' }}>{t.lot.finishBy} {r.ends}</span>
              </div>
              <Bar pct={r.pct} color={r.tc[2]} />
              {r.warn ? <Warn text={r.warn} fg={r.tc[0]} /> : null}
              {l.startEdit ? (
                <div style={{ ...col(8), padding: 10, borderRadius: 12, background: 'var(--c-surface)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{t.lot.startTime}</div>
                  <StartTime value={l.startEdit.value} onChange={l.startEdit.onChange} bad={l.startEdit.bad} t={t} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <Button variant="secondary" fullWidth onClick={l.startEdit.cancel}>{t.lot.cancel}</Button>
                    <Button variant="primary" fullWidth disabled={!!l.startEdit.bad} onClick={l.startEdit.save}>{t.lot.saveStart}</Button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ ...small, flex: 1, color: 'var(--c-ink-2)' }}>{t.lot.startedCap} {l.lot.started}</span>
                  {l.openDetails ? <span {...tap(l.openDetails)} style={link}>{t.lotd.details}</span> : null}
                  <span {...tap(l.openStartEdit)} style={link}>{t.lot.changeStart}</span>
                </div>
              )}
              {r.fill && !r.fill.due && !r.fill.soon ? <div style={small}>{t.lot.fillNext} {r.fill.at} · {t.lot.fillIn} {r.fill.label}</div> : null}
            </div>
          ) : <div style={{ fontSize: 12, color: 'var(--c-ok-ink)' }}>{l.lot.dur ? t.lot.runFor + ' ' + l.lot.dur : ''}</div>}
        </div>
      ) : l.filling ? (
        <div style={col(8)}>
          <div style={{ ...box, ...card }}>
            <Icon name="circle-pause" size={20} color="var(--c-info-ink)" />
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ ...big, fontSize: 18 }}>{l.filling.lot}</div>
              <div style={small}>{l.product}{r ? ' · ' + t.lot.ran + ' ' + r.ranLabel + ' ' + t.lot.of + ' ' + r.plan + ' ' + t.lot.hoursShort : ''} · {t.lot.fillCount}: {l.filling.count}</div>
            </div>
          </div>
          {l.cip ? <CipBox c={l.cip} t={t} extend={l.extend} /> : null}
          {r && r.warn ? <Warn text={r.warn} fg={r.tc[0]} /> : null}
        </div>
      ) : l.cip ? (
        <CipBox c={l.cip} t={t} extend={l.extend} />
      ) : l.idleLot ? (
        <div style={{ ...box, background: 'var(--c-raised)', border: '1.5px solid var(--c-line)' }}>
          <Icon name="circle-pause" size={20} color="var(--c-ink-2)" />
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ ...big, fontSize: 18 }}>{l.idleLot}</div>
            <div style={small}>{l.product}</div>
          </div>
        </div>
      ) : (
        <div style={dashed}>{t.lot.none}</div>
      )}

      {!busy ? (
        l.filling ? (
          <div style={col(8)}>
            <Button variant="success" icon="play" fullWidth onClick={l.filling.cont}>{t.lot.cont} {l.filling.lot}</Button>
            <Button variant="secondary" icon="square" fullWidth onClick={l.openFinish}>{t.lot.finish}</Button>
          </div>
        ) : l.canFinish ? (
          <div style={col(8)}>
            {l.canFill ? <Button variant={r && r.fill && (r.fill.due || r.fill.soon) ? 'primary' : 'secondary'} icon="refresh-ccw" fullWidth onClick={l.openFill}>{t.lot.fillStart}</Button> : null}
            <Button variant="navy" icon="square" fullWidth onClick={l.openFinish}>{t.lot.finish}</Button>
          </div>
        ) : <Button variant="success" icon="play" fullWidth onClick={l.openStart}>{l.startLabel}</Button>
      ) : null}

      {l.startForm ? (
        <form style={{ ...col(12), ...card, padding: 14 }} onSubmit={e => { e.preventDefault(); if (!l.startForm.disabled) l.startForm.save(); }}>
          <div style={label}>{t.lot.number}</div>
          <input id="lot-number" value={l.startForm.lot} onChange={l.startForm.onLot} placeholder={t.lot.numberPh} autoCapitalize="characters" autoFocus style={{ ...inputStyle, fontSize: 18, fontWeight: 800, letterSpacing: '0.02em' }} />
          <div style={label}>{t.lot.product}</div>
          {l.startForm.products.length ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{l.startForm.products.map((o, i) => <Pill key={i} o={o} h={34} px={12} />)}</div> : null}
          <input id="lot-product" value={l.startForm.product} onChange={l.startForm.onProduct} placeholder="ADCaMg 100ml" style={inputStyle} />
          <div style={label}>{t.lot.startTime}</div>
          <StartTime value={l.startForm.start} onChange={l.startForm.onStart} bad={l.startForm.startBad} t={t} now={l.startForm.startNow} />
          <div style={small}>{t.lot.startTimeSub}</div>
          <div style={label}>{t.lot.plan}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {l.startForm.plans.map((o, i) => <Pill key={i} o={o} h={36} px={12} />)}
            <input aria-label={t.lot.plan} inputMode="decimal" value={l.startForm.planText} onChange={l.startForm.onPlan} style={{ ...inputStyle, width: 72, height: 36, padding: '0 10px', fontSize: 14, fontWeight: 700, textAlign: 'center', borderRadius: 999 }} />
            <span style={unit}>{t.lot.hoursShort}</span>
          </div>
          {l.startForm.special ? <Warn text={l.startForm.planNote} fg="var(--c-warn-ink)" /> : <div style={small}>{l.startForm.planNote}</div>}
          {l.startForm.fillNote ? <div style={{ ...small, color: 'var(--c-info-ink)' }}>{l.startForm.fillNote}</div> : null}
          <div style={col(8)}>
            <Button type="submit" variant="success" icon="play" fullWidth disabled={l.startForm.disabled}>{t.lot.start}</Button>
            <Button variant="secondary" fullWidth onClick={l.startForm.cancel}>{t.lot.cancel}</Button>
          </div>
        </form>
      ) : null}

      {l.fillForm ? (
        <form style={{ ...col(12), ...card, padding: 14, borderColor: 'var(--c-info)' }} onSubmit={e => { e.preventDefault(); if (!l.fillForm.disabled) l.fillForm.save(); }}>
          <div style={col(2)}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--c-ink)' }}>{t.lot.fillTitle} · {l.fillForm.lot}</div>
            <div style={small}>{t.lot.fillSub.replace('{lot}', l.fillForm.lot)}</div>
          </div>
          <div style={label}>{t.lot.fillTime}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {l.fillForm.hours.map((o, i) => <Pill key={i} o={o} h={36} px={12} />)}
            <input aria-label={t.lot.fillTime} inputMode="decimal" value={l.fillForm.hoursText} onChange={l.fillForm.onHours} style={{ ...inputStyle, width: 72, height: 36, padding: '0 10px', fontSize: 14, fontWeight: 700, textAlign: 'center', borderRadius: 999 }} />
            <span style={unit}>{t.lot.hoursShort}</span>
          </div>
          <div style={col(8)}>
            <Button type="submit" variant="primary" icon="refresh-ccw" fullWidth disabled={l.fillForm.disabled}>{t.lot.fillGo}</Button>
            <Button variant="secondary" fullWidth onClick={l.fillForm.cancel}>{t.lot.cancel}</Button>
          </div>
        </form>
      ) : null}

      {l.endForm ? (
        <form style={{ ...col(12), ...card, padding: 14, borderColor: 'var(--c-muted)' }} onSubmit={e => { e.preventDefault(); if (!l.endForm.disabled) l.endForm.save(); }}>
          <div style={col(2)}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--c-ink)' }}>{t.lot.finish} · {l.endForm.lot}</div>
            <div style={small}>{t.lot.finishSub}</div>
            <div style={small}>{l.endForm.product} · {t.lot.started} {l.endForm.started}{l.endForm.ran ? ' · ' + t.lot.ran + ' ' + l.endForm.ran : ''}{l.endForm.plan ? ' · ' + l.endForm.plan : ''}{l.endForm.fills ? ' · ' + l.endForm.fills : ''}</div>
          </div>
          <div style={label}>{t.lot.endTime}</div>
          <StartTime value={l.endForm.end} onChange={l.endForm.onEnd} bad={l.endForm.endBad} t={t} now={l.endForm.endNow} name={t.lot.endTime} />
          <div style={small}>{t.lot.endTimeSub}</div>
          {l.endForm.needWhy ? (
            <div style={col(8)}>
              <Warn text={l.endForm.whyLabel} fg="var(--c-bad-ink)" />
              <textarea aria-label={l.endForm.whyLabel} value={l.endForm.overNote} onChange={l.endForm.onOverNote} placeholder={t.lot.overWhyPh} rows={2} style={{ ...areaStyle, fontSize: 14, borderColor: 'var(--c-bad)' }} />
            </div>
          ) : null}
          <div style={label}>{t.lot.output}</div>
          <input aria-label={t.lot.output} inputMode="numeric" value={l.endForm.qty} onChange={l.endForm.onQty} style={{ ...inputStyle, width: 120, fontSize: 20, fontWeight: 800, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }} />
          <div style={label}>{t.lot.cipTime}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {l.endForm.hours.map((o, i) => <Pill key={i} o={o} h={36} px={12} />)}
            <input aria-label={t.lot.cipTime} inputMode="decimal" value={l.endForm.hoursText} onChange={l.endForm.onHours} placeholder={t.lot.hoursPh} style={{ ...inputStyle, width: 72, height: 36, padding: '0 10px', fontSize: 14, fontWeight: 700, textAlign: 'center', borderRadius: 999 }} />
            <span style={unit}>{t.lot.hoursShort}</span>
          </div>
          <div style={label}>{t.lot.reason}</div>
          <div style={grid(2)}>{l.endForm.reasons.map((o, i) => <Pill key={i} o={o} h={36} px={8} />)}</div>
          <div style={small}>{t.lot.reasonSub}{l.endForm.cipEnds ? ' ' + t.lot.cipEndsAt + ' ' + l.endForm.cipEnds + '.' : ''}</div>
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
function LotHistory({ l, t }) {
  if (!l.lotsReady) return null;
  return (
    <div style={col(8)}>
      <div style={label}>{t.lot.history}</div>
      {l.history.length ? (
        <div style={{ ...card, overflow: 'hidden' }}>
          {l.history.map((h, i) => (
            <div key={h.id} {...(h.open ? tap(h.open, 'card-tap') : {})} style={{ ...col(3), padding: '10px 14px', borderTop: i ? '1px solid var(--c-line-soft)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--c-ink)' }}>{h.lot}</span>
                {h.running ? <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: 'var(--c-ok-bg)', color: 'var(--c-ok-ink)', flex: 'none' }}>{t.lotd.running}</span> : null}
                <span style={{ ...small, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.product}</span>
                <span style={{ fontSize: 13, fontWeight: 800, flex: 'none', color: 'var(--c-ink)', fontVariantNumeric: 'tabular-nums' }}>{h.qty}</span>
                {h.open ? <Icon name="chevron-right" size={16} color="var(--c-muted)" style={{ alignSelf: 'center' }} /> : null}
              </div>
              <div style={small}>{h.when}{h.ran ? ' · ' + t.lot.ran + ' ' + h.ran : ''}{h.plan ? ' (' + h.plan + ')' : ''}{h.fills ? ' · ' + h.fills : ''} · {h.cip}{h.by ? ' · ' + t.lot.by + ' ' + h.by : ''}</div>
              {h.over || h.overNote ? <Warn text={h.overNote || t.lot.overWhy.replace('{max}', l.maxRun)} fg="var(--c-bad-ink)" /> : null}
              {h.note ? <div style={{ fontSize: 12, color: 'var(--c-ink-2)', lineHeight: 1.4, background: 'var(--c-bg)', borderRadius: 8, padding: '6px 8px' }}>{h.note}</div> : null}
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
  return (
    <div style={col(18)}>
      <div style={{ ...col(4), paddingRight: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: 'var(--c-selected-bg)', color: 'var(--c-selected-ink)' }}>{l.type}</span>
          <h2 style={title}>{l.name}</h2>
        </div>
        {l.layout ? <div style={{ fontSize: 12, color: 'var(--c-muted)', fontWeight: 600 }}>{l.layout}</div> : null}
        <div style={{ fontSize: 13, color: 'var(--c-muted)', fontWeight: 600 }}>{l.product}</div>
        <div style={{ fontSize: 12, color: 'var(--c-muted)' }}>{l.updated}</div>
      </div>

      <LotNow l={l} t={t} />

      <div style={col(8)}>
        <div style={label}>{t.line.status}</div>
        <div role="radiogroup" aria-label={t.line.status} style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 8 }}>
          {l.states.map((o, i) => (
            <div key={i} {...tap(o.pick, 'pill-tap')} role="radio" aria-checked={o.on}
              style={{ minHeight: 44, padding: '6px 12px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, background: o.bg, color: o.fg, border: '1.5px solid ' + o.bd, transition: 'all 120ms' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: o.dot, boxShadow: o.glow, flex: 'none' }} />{o.label}
            </div>
          ))}
        </div>
      </div>

      <div style={col(8)}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={label}>{t.line.output}</div>
          <div {...tap(l.reset)} style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-accent)' }}>{t.line.reset}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <input aria-label={t.line.output} inputMode="numeric" value={String(l.qty)} onChange={l.onQty}
            style={{ ...inputStyle, width: 110, height: 52, fontSize: 26, fontWeight: 800, textAlign: 'center', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-muted)' }}>/ {l.target} {t.pal}</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'var(--c-raised)', overflow: 'hidden' }}><div style={{ height: '100%', width: l.pct, background: l.bar, borderRadius: 3, transition: 'width 200ms' }} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 8 }}>
          {l.steps.map((o, i) => (
            <div key={i} {...tap(o.pick, 'pill-tap')} style={{ height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, background: 'var(--c-field)', border: '1.5px solid var(--c-line)', color: 'var(--c-ink)' }}>{o.label}</div>
          ))}
        </div>
      </div>

      <div style={col(8)}>
        <div style={label}>{t.line.note}</div>
        <textarea value={l.note} onChange={l.onNote} placeholder={t.line.notePh} rows={2} style={{ ...areaStyle, fontSize: 14 }} />
        {l.noteDirty ? <Button variant="secondary" fullWidth onClick={l.saveNote}>{t.line.saveNote}</Button> : null}
      </div>

      <div {...tap(l.seeIssues, 'card-tap')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 14, border: '1.5px solid var(--c-line)', background: 'var(--c-bg)' }}>
        <Icon name={l.issues ? 'triangle-alert' : 'circle-check'} size={18} color={l.issues ? 'var(--c-bad-ink)' : 'var(--c-ok-ink)'} />
        <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--c-ink)' }}>{t.line.seeIssues}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: l.issues ? 'var(--c-bad-ink)' : 'var(--c-muted)' }}>{l.issues}</span>
        <Icon name="chevron-right" size={16} color="var(--c-muted)" />
      </div>

      <LotHistory l={l} t={t} />

      {l.confirm ? (
        <div style={dangerPanel}>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--c-bad-ink)' }}>{t.line.removeQ}</div>
          <div style={{ fontSize: 13, color: 'var(--c-bad-ink)', lineHeight: 1.4 }}>{t.line.removeSub}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Button variant="secondary" fullWidth onClick={l.cancelRemove}>{t.line.cancel}</Button>
            <button type="button" onClick={l.remove} style={dangerBtn}>{t.line.remove}</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: l.canManage ? '1fr 1fr' : '1fr', gap: 8 }}>
          {/* Everyone can edit a line's name, type, product and target */}
          <Button variant="secondary" icon="pencil-line" fullWidth onClick={l.edit}>{l.canManage ? t.line.edit.split(' ')[0] : t.line.edit}</Button>
          {/* Only plant managers can remove a line */}
          {l.canManage ? (
            <div {...tap(l.askRemove)} style={dangerAsk}>
              <Icon name="trash-2" size={16} color="var(--c-bad-ink)" />{t.line.remove}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
