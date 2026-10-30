// ReportsScreen: search, All/Open/Closed, active filters, results.
import { Icon, ReportCard } from '../../components/index.js';
import { tap } from '../../utils/tap.js';

// Which All/Open/Closed pill is chosen: `on` when the view model gives it, else read from its background (an idle pill is
// '#fff' before phase 11 and var(--c-field) after). A comparison only, not a colour that is drawn.
const isOn = f => (f.on !== undefined ? !!f.on : !['#fff', 'var(--c-field)'].includes(f.bg));

export function ReportsScreen({ v }) {
  const t = v.t;
  return (
    <div className="page">
      <h1 style={{ margin: 0, fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em' }}>{t.reports}</h1>
      <div style={{ display: 'flex', gap: 8, maxWidth: 720 }}>
        <label style={{ flex: 1, height: 46, borderRadius: 14, background: 'var(--c-field)', border: '1.5px solid var(--c-line)', display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', minWidth: 0 }}>
          <Icon name="search" size={18} color="var(--c-ink)" style={{ opacity: 0.75 }} />
          <input type="search" value={v.q} onChange={v.onQ} placeholder={t.searchPh} aria-label={t.searchPh} enterKeyHint="search"
            style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: 'var(--c-ink)', WebkitAppearance: 'none', appearance: 'none' }} />
          {v.hasQ ? (
            <div {...tap(v.clearQ)} aria-label={t.clear} style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--c-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="x" size={13} color="var(--c-ink-2)" /></div>
          ) : null}
        </label>
        <div {...tap(v.openFilters)} aria-label={t.filters} style={{ width: 46, height: 46, borderRadius: 14, background: v.fBtn.bg, border: '1.5px solid ' + v.fBtn.bd, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flex: 'none' }}>
          <Icon name="sliders-horizontal" size={20} color={v.fBtn.fg} />
          {v.fBtn.has ? <span style={{ position: 'absolute', top: -6, right: -6, minWidth: 20, height: 20, borderRadius: 10, background: 'var(--c-accent)', color: 'var(--c-accent-ink)', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--c-bg)' }}>{v.fBtn.n}</span> : null}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {v.filters.map((f, i) => (
          <div key={i} {...tap(f.onClick, 'pill-tap')} aria-pressed={isOn(f)} style={{ height: 34, padding: '0 14px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, background: f.bg, color: f.fg, border: '1.5px solid ' + f.bd }}>{f.label}<span style={{ opacity: 0.7 }}>{f.n}</span></div>
        ))}
      </div>
      {v.fBtn.has ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          {v.activeF.map((a, i) => (
            <div key={i} {...tap(a.remove)} style={{ height: 30, padding: '0 8px 0 12px', borderRadius: 999, background: 'var(--c-accent-soft)', color: 'var(--c-info-ink)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700 }}>{a.label}<Icon name="x" size={13} color="var(--c-info-ink)" /></div>
          ))}
          <div {...tap(v.resetF)} style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-muted)', padding: '0 6px' }}>{t.clearAll}</div>
        </div>
      ) : null}
      <div style={{ fontSize: 12, color: 'var(--c-muted)', fontWeight: 600, marginBottom: -6 }} aria-live="polite">{v.resultText}</div>
      <div className="list-grid" style={{ gap: 10 }}>
        {v.listItems.map(r => <ReportCard key={r.id} r={r} />)}
      </div>
      {v.listEmpty ? <div style={{ textAlign: 'center', color: 'var(--c-muted)', fontSize: 14, padding: '40px 0' }}>{t.empty}</div> : null}
    </div>
  );
}
