// TasksScreen: reports waiting on the current role.
import { Button, Icon } from '../../components/index.js';
import { chip } from '../../styles/inline.js';

const card = { background: '#fff', border: '1.5px solid var(--blue-200)', borderRadius: 20 };

export function TasksScreen({ v }) {
  const t = v.t;
  return (
    <div className="page">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h1 style={{ margin: 0, fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em' }}>{t.tasks}</h1>
        <div style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.45 }}>{t.tasksSub}</div>
      </div>
      <div className="list-grid">
        {v.taskItems.map((r, i) => (
          <div key={i} style={{ ...card, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600 }}>{r.id} · {r.catLabel}</span>
              <span style={chip(r.sevBg, r.sevFg)}>{r.sev}</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>{r.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: 'var(--blue-700)' }}>
              <Icon name={r.taskIcon} size={16} color="var(--blue-600)" />{r.taskLabel}
            </div>
            <Button variant="secondary" fullWidth iconRight="arrow" onClick={r.open}>{t.openReport}</Button>
          </div>
        ))}
      </div>
      {v.tasksEmpty ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '48px 0', color: 'var(--gray-500)', fontSize: 14 }}>
          <Icon name="circle-check" size={36} color="var(--green-600)" />{t.noTasks}
        </div>
      ) : null}
    </div>
  );
}
