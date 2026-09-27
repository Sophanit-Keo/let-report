// Account sheet: your profile and sign out. Plant managers also set each person's role
// and can load the sample reports into an empty database.
import { Avatar, Button, Icon, Pill } from '../components/index.js';
import { tap } from '../utils/tap.js';
import { title, col } from './sheetStyles.js';

export function RoleSheet({ v }) {
  const t = v.t, a = v.account;
  return (
    <div style={col(16)}>
      <h2 style={title}>{t.account}</h2>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12, borderRadius: 16, border: '1.5px solid var(--blue-200)', background: 'var(--blue-50)' }}>
        <Avatar src={a.avatar} size={44} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{a.name}</div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', overflowWrap: 'anywhere' }}>{a.roleLabel} · {a.email}</div>
        </div>
      </div>

      {a.isManager ? (
        <div style={col(10)}>
          <div style={col(2)}>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{t.teamRoles}</div>
            <div style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.4 }}>{t.teamSub}</div>
          </div>
          {v.teamList.map(p => (
            <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, borderRadius: 14, border: '1.5px solid var(--blue-200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar src={p.avatar} size={32} />
                <div style={{ fontSize: 14, fontWeight: 800, flex: 1 }}>{p.name}{p.isMe ? <span style={{ color: 'var(--gray-500)', fontWeight: 600 }}> · {t.you}</span> : null}</div>
              </div>
              <div role="radiogroup" aria-label={p.name} style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 6 }}>
                {p.roles.map((o, i) => <Pill key={i} o={o} h={34} px={4} />)}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {a.canLoadSample ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, borderRadius: 14, border: '1.5px dashed var(--blue-300)' }}>
          <div style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.4 }}>{t.sampleSub}</div>
          <Button variant="secondary" fullWidth disabled={a.busy} onClick={a.loadSample}>{a.busy ? '…' : t.loadSample}</Button>
        </div>
      ) : null}

      <div {...tap(a.signOut)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: 'var(--red-700)', padding: '8px 10px' }}>
        <Icon name="circle-x" size={16} color="var(--red-700)" />{t.signOut}
      </div>
    </div>
  );
}
