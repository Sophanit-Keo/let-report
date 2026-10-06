// HomeScreen: greeting, due hold checks, role-specific cards and sections, team, trend, production lines.
import { Avatar, Button, Icon, LangToggle, MeButton, PushCard, ReportCard } from '../../components/index.js';
import { tap } from '../../utils/tap.js';
import { chip } from '../../styles/inline.js';

const card = { background: '#fff', border: '1.5px solid var(--blue-200)', borderRadius: 20 };

const secHead = { fontWeight: 800, fontSize: 17, letterSpacing: '-0.01em', flex: 1 };

export function HomeScreen({ v }) {
  const t = v.t;
  return (
    <div className="page home">
      <div className="home-head-mobile" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="images/logo-badge.jpg" alt="" width="34" height="34" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
        <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em', flex: 1, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Let Report</div>
        <LangToggle v={v} />
        <MeButton v={v} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h1 style={{ margin: 0, fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{t.greet}, {v.me.name}</h1>
        <div style={{ fontSize: 14, color: 'var(--gray-500)', fontWeight: 500 }}>{v.me.roleLabel} · {t.site}</div>
      </div>

      <div className="home-grid">
        <div className="home-col">
          <PushCard p={v.push} t={t} />
          {v.dueChecks.map((d, i) => (
            <div key={i} {...tap(d.open, 'card-tap')} style={{ background: 'var(--amber-100)', border: '1.5px solid var(--amber-500)', borderRadius: 18, padding: 14, display: 'flex', gap: 12, alignItems: 'center', animation: 'lrFade 200ms' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="bell-ring" size={20} color="var(--amber-700)" /></div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--amber-700)' }}>{d.head}</div>
                <div style={{ fontSize: 13, color: 'var(--amber-700)', lineHeight: 1.4 }}>{d.sub}</div>
              </div>
              <Icon name="chevron-right" size={18} color="var(--amber-700)" />
            </div>
          ))}

          {v.home.cta ? (
            <div style={{ background: 'var(--navy-900)', borderRadius: 24, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: 'var(--shadow-floating)' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  <Icon name="triangle-alert" size={24} color="#fff" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: 19, letterSpacing: '-0.01em' }}>{t.spotted}</div>
                  <div style={{ color: 'var(--blue-200)', fontSize: 14, lineHeight: 1.45 }}>{t.spottedSub}</div>
                </div>
              </div>
              <Button variant="success" icon="camera" fullWidth onClick={v.nav.capture}>{t.reportIssue}</Button>
            </div>
          ) : null}

          {v.home.kpis ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 8 }}>
              {v.kpis.map((s, i) => (
                <div key={i} {...tap(s.onClick, 'card-tap')} style={{ background: '#fff', border: '1.5px solid var(--blue-200)', borderRadius: 16, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em', color: s.fg }}>{s.n}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', lineHeight: 1.25 }}>{s.label}</div>
                </div>
              ))}
            </div>
          ) : null}

          {v.home.checklist ? (
            <div style={{ ...card, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="list-checks" size={20} color="var(--green-600)" />
                <div style={{ flex: 1, fontWeight: 800, fontSize: 16 }}>{t.checklist}</div>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--green-700)' }}>{v.checklist.done}/{v.checklist.total}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--gray-100)', overflow: 'hidden' }}><div style={{ height: '100%', width: v.checklist.pct, background: 'var(--green-500)', borderRadius: 3, transition: 'width 200ms cubic-bezier(.2,.7,.2,1)' }} /></div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {v.checklist.items.map((ck, i) => (
                  <div key={i} {...tap(ck.toggle)} role="checkbox" aria-checked={ck.on} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: '1px solid ' + ck.bd }}>
                    <div style={{ width: 24, height: 24, borderRadius: 7, border: '2px solid ' + ck.boxBd, background: ck.boxBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', transition: 'all 120ms' }}>
                      {ck.on ? <Icon name="check" size={14} color="#fff" /> : null}
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: ck.fg, textDecoration: ck.deco }}>{ck.label}</span>
                      <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{ck.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {v.homeSections.map((sec, si) => (
            <section key={si} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ ...secHead, margin: 0 }}>{sec.title}</h2>
                <span style={{ minWidth: 24, height: 24, padding: '0 8px', borderRadius: 999, background: sec.cBg, color: sec.cFg, fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{sec.count}</span>
              </div>
              {sec.items.map(r => <ReportCard key={r.id} r={r} showLevel bd={r.cardBd} />)}
              {sec.empty ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--gray-500)', padding: '12px 14px', border: '1.5px dashed var(--blue-200)', borderRadius: 14 }}><Icon name="circle-check" size={16} color="var(--green-600)" />{t.nothing}</div>
              ) : null}
            </section>
          ))}
        </div>

        <div className="home-col">
          {v.home.team ? (
            <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h2 style={{ ...secHead, margin: 0 }}>{t.team}</h2>
              <div style={{ ...card, overflow: 'hidden' }}>
                {v.team.map((p, i) => (
                  <div key={i} {...tap(p.open)} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 14px', borderTop: '1px solid ' + p.bd }}>
                    <Avatar src={p.avatar} size={40} />
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div style={{ fontSize: 14, fontWeight: 800 }}>{p.name} <span style={{ fontWeight: 600, color: 'var(--gray-500)', fontSize: 12 }}>· {p.roleLabel}</span></div>
                      <div style={{ fontSize: 13, color: p.fg, lineHeight: 1.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.doing}</div>
                    </div>
                    <span style={chip(p.cBg, p.cFg, { fontWeight: 800, flex: 'none' })}>{p.count}</span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {v.home.trend ? (
            <div style={{ ...card, padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, fontWeight: 800, fontSize: 16 }}>{t.trend}</div>
                <div style={{ display: 'flex', background: 'var(--blue-50)', borderRadius: 999, padding: 3, gap: 2 }}>
                  {v.trendTabs.map((tt, i) => (
                    <div key={i} {...tap(tt.pick)} style={{ height: 26, padding: '0 10px', borderRadius: 999, display: 'flex', alignItems: 'center', fontSize: 12, fontWeight: 700, background: tt.bg, color: tt.fg }}>{tt.label}</div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {v.trendRows.map((tr, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 104, flex: 'none', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tr.label}</div>
                    <div style={{ flex: 1, height: 14, borderRadius: 7, background: 'var(--gray-100)', overflow: 'hidden' }}><div style={{ height: '100%', width: tr.pct, background: tr.bar, borderRadius: 7, transition: 'width 300ms cubic-bezier(.2,.7,.2,1)' }} /></div>
                    <div style={{ width: 22, textAlign: 'right', fontSize: 13, fontWeight: 800 }}>{tr.n}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }} data-tour="lines">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ ...secHead, margin: 0 }}>{t.linesNow}</h2>
              <div {...tap(v.linesHead.openPlan, 'pill-tap')} aria-label={t.plan.title} style={{ height: 30, padding: '0 12px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, background: '#fff', color: 'var(--blue-700)', border: '1.5px solid var(--blue-200)' }}>
                <Icon name="sliders-horizontal" size={14} color="var(--blue-700)" />{t.plan.button}
              </div>
              {v.linesHead.canAdd ? (
                <div {...tap(v.linesHead.add, 'pill-tap')} style={{ height: 30, padding: '0 12px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, background: '#fff', color: 'var(--blue-700)', border: '1.5px solid var(--blue-200)' }}>
                  + {t.line.add}
                </div>
              ) : null}
            </div>
            {v.linesHead.empty ? <div style={{ fontSize: 13, color: 'var(--gray-500)', padding: '12px 14px', border: '1.5px dashed var(--blue-200)', borderRadius: 14 }}>{t.line.noLines}</div> : null}
            <div className="card-grid two">
              {v.lines.map((ln, i) => (
                <div key={ln.id || i} {...tap(ln.open, 'card-tap')} style={{ background: '#fff', border: '1.5px solid ' + ln.bd, borderRadius: 18, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: 'var(--navy-900)', color: '#fff' }}>{ln.type}</span>
                      <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em' }}>{ln.name}</span>
                    </div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: ln.stFg, flex: 'none' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: ln.dot, animation: ln.anim }} />{ln.stLabel}</span>
                  </div>
                  {/* What the line is doing now: the lot it runs, or the CIP countdown after a lot */}
                  {ln.now ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: ln.now.bg, borderRadius: 10, padding: '7px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: ln.now.fg, minWidth: 0 }}>
                        <Icon name={ln.now.icon} size={14} color={ln.now.fg} />
                        <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ln.now.text}</span>
                      </div>
                      {ln.now.pct ? <div style={{ height: 4, borderRadius: 2, background: '#fff', overflow: 'hidden' }}><div style={{ height: '100%', width: ln.now.pct, background: ln.now.bar || ln.now.fg, borderRadius: 2, transition: 'width 400ms' }} /></div> : null}
                      {ln.now.warn ? <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12, fontWeight: 700, color: ln.now.fg, lineHeight: 1.35 }}><Icon name="triangle-alert" size={13} color={ln.now.fg} style={{ marginTop: 1 }} />{ln.now.warn}</div> : null}
                      {ln.now.sub ? <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-700)' }}>{ln.now.sub}</div> : null}
                    </div>
                  ) : null}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 600, flex: 1 }}>{ln.product}</span>
                    <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>{ln.qty}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)' }}>/ {ln.target} {t.pal}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'var(--gray-100)', overflow: 'hidden' }}><div style={{ height: '100%', width: ln.pct, background: ln.bar, borderRadius: 3, transition: 'width 400ms cubic-bezier(.2,.7,.2,1)' }} /></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: ln.isFg }}>
                    <Icon name={ln.isIcon} size={14} color={ln.isFg} />{ln.issues}
                  </div>
                  {ln.note ? <div style={{ fontSize: 12, color: 'var(--gray-700)', lineHeight: 1.4, background: 'var(--blue-50)', borderRadius: 8, padding: '6px 8px' }}>{ln.note}</div> : null}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
