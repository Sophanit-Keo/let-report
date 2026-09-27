// Team (plant managers): everyone who can sign in — role, on/off, tap to edit. "Add person" creates an account.
import { Avatar, Button } from '../../components/index.js';
import { tap } from '../../utils/tap.js';
import { chip } from '../../styles/inline.js';

export function TeamScreen({ v }) {
  const t = v.t;
  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h1 style={{ margin: 0, fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em' }}>{t.people.title}</h1>
          <div style={{ fontSize: 14, color: 'var(--gray-500)' }}>{t.people.sub} · {v.teamHead.count}</div>
        </div>
        <Button variant="primary" icon="user-plus" onClick={v.teamHead.add}>{t.people.add}</Button>
      </div>
      <div className="list-grid" style={{ gap: 10 }}>
        {v.teamList.map(p => (
          <div key={p.id} {...tap(p.open, 'card-tap')} style={{ background: '#fff', border: '1.5px solid var(--blue-200)', borderRadius: 16, padding: 14, display: 'flex', gap: 12, alignItems: 'center', opacity: p.active ? 1 : 0.6 }}>
            <Avatar src={p.avatar} size={48} />
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: 15, fontWeight: 800 }}>{p.name}{p.isMe ? <span style={{ color: 'var(--gray-500)', fontWeight: 600 }}> · {t.you}</span> : null}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.email}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={chip(p.roleBg, p.roleFg)}>{p.roleLabel}</span>
                {!p.active ? <span style={chip('var(--red-100)', 'var(--red-700)')}>{t.people.off}</span> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
