// Account sheet: your photo and name, sign out. Plant managers also open "Manage team"
// and can load the sample reports into an empty database.
import { Button, Icon, PhotoPicker, Toggle } from '../components/index.js';
import { tap } from '../utils/tap.js';
import { inputStyle } from '../styles/inline.js';
import { title, col } from './sheetStyles.js';

export function RoleSheet({ v }) {
  const t = v.t, a = v.account;
  return (
    <div style={col(16)}>
      <h2 style={title}>{t.account}</h2>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: 14, borderRadius: 16, border: '1.5px solid var(--blue-200)', background: 'var(--blue-50)' }}>
        <PhotoPicker src={a.avatar} size={64} onChange={a.onPhoto} label={t.people.changePhoto} busy={a.busy} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{a.name}</div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', overflowWrap: 'anywhere' }}>{a.roleLabel} · {a.email}</div>
          <div style={{ fontSize: 12, color: 'var(--blue-600)', fontWeight: 700 }}>{t.people.changePhoto}</div>
        </div>
      </div>

      <div style={col(8)}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{t.people.yourName}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input id="my-name" value={a.nameDraft} onChange={a.onName} autoComplete="name" style={{ ...inputStyle, flex: 1 }} />
          {a.nameDirty ? <Button variant="primary" onClick={a.saveName}>{t.people.save}</Button> : null}
        </div>
      </div>

      {v.push.support !== 'no' ? (
        <div style={col(8)}>
          {v.push.support === 'yes' ? <Toggle o={v.push.toggle} icon="bell-ring" title={t.push.title} sub={v.push.status} /> : (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 14, borderRadius: 14, border: '1.5px solid var(--blue-200)' }}>
              <Icon name="bell-ring" size={22} color="var(--navy-500)" />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 14, fontWeight: 700 }}>{t.push.title}</span><span style={{ fontSize: 12, color: 'var(--gray-500)', lineHeight: 1.35 }}>{v.push.status}</span></div>
            </div>
          )}
          {v.push.on ? <div {...tap(v.push.test)} style={{ alignSelf: 'flex-start', fontSize: 13, fontWeight: 700, color: 'var(--blue-600)', padding: '2px 4px' }}>{t.push.test}</div> : null}
        </div>
      ) : null}

      {a.isManager ? (
        <div {...tap(a.manageTeam, 'card-tap')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, border: '1.5px solid var(--blue-200)' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--navy-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="users" size={18} color="#fff" /></div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 15, fontWeight: 800 }}>{t.people.manage}</span>
            <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{t.teamSub}</span>
          </div>
          <Icon name="chevron-right" size={18} color="var(--navy-300)" />
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
