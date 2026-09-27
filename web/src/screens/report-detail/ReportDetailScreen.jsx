// Report detail: status steps, escalation ladder, photo, details, hold check, corrective action, activity.
import { Avatar, Button, Icon, TopBar } from '../../components/index.js';
import { tap } from '../../utils/tap.js';
import { chip } from '../../styles/inline.js';

const card = { background: '#fff', border: '1.5px solid var(--blue-200)', borderRadius: 20 };

const h2 = { margin: 0, fontWeight: 800, fontSize: 17 };

export function ReportDetailScreen({ v }) {
  const t = v.t, sel = v.sel;
  if (!sel || !sel.id) return null;
  const hc = sel.hc || {};

  const head = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span style={chip(sel.sevBg, sel.sevFg, { fontSize: 12, padding: '4px 10px' })}>{sel.sev}</span>
        <span style={chip('#fff', 'var(--navy-900)', { fontSize: 12, padding: '4px 10px', border: '1.5px solid var(--blue-200)' })}>{sel.catLabel}</span>
        {sel.urgent ? <span style={chip('var(--red-700)', '#fff', { fontSize: 12, padding: '4px 10px' })}>{t.urgentB}</span> : null}
        {sel.hold ? <span style={chip('var(--navy-900)', '#fff', { fontSize: 12, padding: '4px 10px' })}>{t.holdB}</span> : null}
      </div>
      <h1 style={{ margin: 0, fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em', lineHeight: 1.2, overflowWrap: 'anywhere' }}>{sel.title}</h1>
      <div style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 500 }}>{t.reportedBy} {sel.by} · {sel.loc} · {sel.time}</div>
    </div>
  );

  const steps = (
    <div style={{ ...card, padding: '16px 8px 14px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))' }}>
        {sel.steps.map((st, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 11, left: '-50%', right: '50%', height: 3, background: st.lineBg, opacity: st.lineOp }} />
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: st.dotBg, border: '2px solid ' + st.dotBd, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: st.ring }}>
              {st.done ? <Icon name="check" size={13} color="#fff" strokeWidth={3} /> : null}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: st.fg, textAlign: 'center', lineHeight: 1.25 }}>{st.label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const ladder = (
    <div style={{ ...card, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}><span style={{ fontSize: 13, fontWeight: 800 }}>{t.handledBy}</span><span style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600 }}>{sel.levelNote}</span></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {sel.ladder.map((lv, i) => [
          lv.arrow ? <Icon key={'a' + i} name="chevron-right" size={14} color="var(--navy-300)" /> : null,
          <div key={i} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 2px', borderRadius: 12, background: lv.bg, border: '1.5px solid ' + lv.bd }}>
            <Avatar src={lv.avatar} size={28} style={{ opacity: lv.op }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: lv.fg, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lv.short}</span>
          </div>,
        ])}
      </div>
    </div>
  );

  const photo = sel.photoUrl ? (
    <div style={{ height: 220, borderRadius: 20, overflow: 'hidden', border: '1.5px solid var(--blue-200)', position: 'relative', background: 'var(--blue-100)' }}>
      <img src={sel.photoUrl} alt={sel.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <span style={{ position: 'absolute', left: 12, bottom: 12, font: '600 11px ui-monospace,Menlo,monospace', color: 'var(--navy-500)', background: 'rgba(255,255,255,.9)', padding: '4px 8px', borderRadius: 6 }}>{sel.photo}</span>
    </div>
  ) : (
    <div style={{ height: 170, borderRadius: 20, background: 'repeating-linear-gradient(135deg,var(--blue-100) 0 10px,var(--blue-50) 10px 20px)', border: '1.5px solid var(--blue-200)', display: 'flex', alignItems: 'flex-end', padding: 12 }}>
      <span style={{ font: '600 11px ui-monospace,Menlo,monospace', color: 'var(--navy-500)', background: 'rgba(255,255,255,.9)', padding: '4px 8px', borderRadius: 6 }}>{sel.photo}</span>
    </div>
  );

  const addDetails = sel.needsDetails ? (
    <div {...tap(v.nav.details, 'card-tap')} style={{ background: 'var(--amber-100)', border: '1.5px solid var(--amber-500)', borderRadius: 16, padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
      <Icon name="pencil-line" size={22} color="var(--amber-700)" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--amber-700)' }}>{t.addDetails}</div>
        <div style={{ fontSize: 13, color: 'var(--amber-700)', lineHeight: 1.4 }}>{t.addDetailsSub}</div>
      </div>
      <Icon name="chevron-right" size={18} color="var(--amber-700)" />
    </div>
  ) : null;

  const rows = (
    <div style={{ ...card, overflow: 'hidden' }}>
      {sel.rows.map((row, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderTop: '1px solid ' + row.bd, fontSize: 14, lineHeight: 1.45 }}>
          <div style={{ width: 100, flex: 'none', color: 'var(--gray-500)', fontWeight: 600 }}>{row.k}</div>
          <div style={{ flex: 1, minWidth: 0, fontWeight: 600, color: row.fg, overflowWrap: 'anywhere' }}>{row.v}</div>
        </div>
      ))}
    </div>
  );

  const holdCheck = sel.hasHc ? (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h2 style={h2}>{t.hcTitle}</h2>
      <div style={{ background: '#fff', border: '1.5px solid ' + hc.bd, borderRadius: 20, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: hc.icBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <Icon name={hc.icon} size={20} color={hc.icFg} />
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{hc.typeLabel}</div>
            <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{hc.sub}</div>
          </div>
          <span style={chip(hc.stBg, hc.stFg, { flex: 'none' })}>{hc.stLabel}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingTop: 12, borderTop: '1px solid var(--gray-100)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600 }}>{t.hcDue}</span><span style={{ fontSize: 14, fontWeight: 700 }}>{hc.due}</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600 }}>{t.hcWho}</span><span style={{ fontSize: 14, fontWeight: 700 }}>{hc.owner}</span></div>
        </div>
        {hc.canCheck ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Button variant="success" icon="circle-check" fullWidth onClick={hc.pass}>{hc.passLabel}</Button>
            <Button variant="secondary" icon="circle-x" fullWidth onClick={hc.fail}>{hc.failLabel}</Button>
          </div>
        ) : null}
        {hc.waiting ? <div style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 600 }}>{t.hcWaitOther} {hc.owner}.</div> : null}
        {hc.needDecision ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 13, lineHeight: 1.45, color: 'var(--red-700)', fontWeight: 700 }}>{t.hcFoundMsg}</div>
            <Button variant="navy" icon="gavel" fullWidth onClick={hc.decide}>{t.decBtn}</Button>
          </div>
        ) : null}
        {hc.waitDecision ? <div style={{ fontSize: 13, lineHeight: 1.45, color: 'var(--red-700)', fontWeight: 700 }}>{t.hcFoundWait}</div> : null}
        {hc.hasNote ? <div style={{ background: 'var(--blue-50)', borderRadius: 12, padding: '10px 12px', fontSize: 13, lineHeight: 1.45 }}><span style={{ fontWeight: 800 }}>{t.decNote}:</span> {hc.note}</div> : null}
        {hc.hasHistory ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 12, borderTop: '1px solid var(--gray-100)' }}>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 700 }}>{t.hcHistory}</div>
            {hc.history.map((hh, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--gray-100)', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{hh.n}</span>
                <span style={{ flex: 1, fontWeight: 600, color: hh.fg }}>{hh.res}</span>
                <span style={{ color: 'var(--gray-500)', fontSize: 12 }}>{hh.t}</span>
              </div>
            ))}
          </div>
        ) : null}
        {hc.scheduled ? (
          <div {...tap(hc.skip)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--blue-600)', border: '1.5px dashed var(--blue-300)', borderRadius: 10, padding: '8px 10px', alignSelf: 'flex-start' }}><Icon name="fast-forward" size={14} color="var(--blue-600)" />{t.hcDemo}</div>
        ) : null}
      </div>
    </section>
  ) : null;

  const capa = sel.hasCapa ? (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h2 style={h2}>{t.capa}</h2>
      <div style={{ ...card, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={chip('var(--blue-100)', 'var(--blue-700)')}>{t.rootCause}: {sel.capa.root}</span>
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.5 }}>{sel.capa.text}</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--gray-100)' }}>
          <Avatar src={sel.capa.avatar} size={28} />
          <span style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{sel.capa.owner}</span>
          <Icon name="clock" size={15} color="var(--amber-700)" />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber-700)' }}>{sel.capa.due}</span>
        </div>
      </div>
    </section>
  ) : null;

  const activity = (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2 style={h2}>{t.activity}</h2>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {sel.tl.map((e, i) => (
          <div key={i} style={{ display: 'flex', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 12, flex: 'none' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: e.dot, marginTop: 5, flex: 'none' }} />
              <div style={{ flex: 1, width: 2, background: 'var(--blue-200)', opacity: e.lineOp }} />
            </div>
            <div style={{ paddingBottom: 16, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ fontSize: 14, lineHeight: 1.45, fontWeight: 600 }}>{e.text}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{e.who} · {e.t}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="page bare">
      <TopBar onBack={v.back} title={sel.id} />
      <div className="detail-grid">
        <div className="detail-col detail-pad">
          {head}{steps}{ladder}{photo}{addDetails}{rows}
        </div>
        <div className="detail-col detail-pad">
          {holdCheck}{capa}{activity}
        </div>
      </div>
    </div>
  );
}
