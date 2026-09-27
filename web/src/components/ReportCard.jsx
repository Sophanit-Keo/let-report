// One report row: icon, id/location/time, title, severity and status chips, hint.
import { tap } from '../utils/tap.js';
import { Icon } from './Icon.jsx';
import { chip } from '../styles/inline.js';

// One report row card (home sections + reports list)

export function ReportCard({ r, showLevel, bd }) {
  return (
    <div {...tap(r.open, 'card-tap')} style={{ background: '#fff', border: '1.5px solid ' + (bd || 'var(--blue-200)'), borderRadius: 16, padding: 14, display: 'flex', gap: 12, alignItems: 'center', boxShadow: showLevel ? 'var(--shadow-card)' : 'none' }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--blue-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
        <Icon name={r.icon} size={22} color="var(--blue-600)" />
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600 }}>{r.id} · {r.loc} · {r.time}</div>
        <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, overflowWrap: 'anywhere' }}>{r.title}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={chip(r.sevBg, r.sevFg)}>{r.sev}</span>
          <span style={chip(r.stBg, r.stFg)}>{r.stLabel}</span>
          {showLevel ? <span style={chip('#fff', 'var(--navy-900)', { border: '1.5px solid var(--blue-200)' })}>{r.levelLabel}</span> : null}
        </div>
        {r.hasHint ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: r.hintFg }}>
            <Icon name={r.hintIcon} size={14} color={r.hintFg} />{r.hint}
          </div>
        ) : null}
      </div>
      <Icon name="chevron-right" size={18} color="var(--navy-300)" />
    </div>
  );
}
