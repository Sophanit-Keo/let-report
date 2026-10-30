// Edit one person (plant managers): photo, name, role, can sign in, new password, remove account.
import { Button, Field, Icon, PhotoPicker, Pill, Toggle } from '../components/index.js';
import { tap } from '../utils/tap.js';
import { inputStyle } from '../styles/inline.js';
import { title, col, grid, dangerPanel, dangerBtn, dangerAsk } from './sheetStyles.js';

export function PersonSheet({ v }) {
  const t = v.t, p = v.person;
  if (!p) return null;
  return (
    <div style={col(18)}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', paddingRight: 40 }}>
        <PhotoPicker src={p.avatar} size={64} onChange={p.onPhoto} label={t.people.changePhoto} busy={p.busy} />
        <div style={{ flex: 1, minWidth: 0, ...col(2) }}>
          <h2 style={title}>{p.name}{p.isMe ? <span style={{ color: 'var(--c-muted)', fontWeight: 600, fontSize: 15 }}> · {t.you}</span> : null}</h2>
          <div style={{ fontSize: 13, color: 'var(--c-muted)', overflowWrap: 'anywhere' }}>{p.email}</div>
        </div>
      </div>

      <Field label={t.people.name}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input id="person-name" value={p.nameDraft} onChange={p.onName} style={{ ...inputStyle, flex: 1 }} />
          {p.nameDirty ? <Button variant="primary" onClick={p.saveName}>{t.people.save}</Button> : null}
        </div>
      </Field>

      <Field label={t.people.role}>
        <div role="radiogroup" aria-label={t.people.role} style={grid(4)}>{p.roles.map((o, i) => <Pill key={i} o={o} h={38} px={4} />)}</div>
      </Field>

      {!p.isMe ? <Toggle o={p.activeT} icon="circle-check" title={t.people.active} sub={t.people.activeSub} /> : null}

      {!p.isMe ? (
        <Field label={t.people.setPw}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input id="person-password" value={p.pw} onChange={p.onPw} autoComplete="new-password" placeholder="••••••" style={{ ...inputStyle, flex: 1 }} />
            <Button variant="secondary" icon="key-round" disabled={p.pwDisabled} onClick={p.setPw}>{t.people.setPwBtn}</Button>
          </div>
        </Field>
      ) : null}

      {!p.isMe ? (
        p.confirm ? (
          <div style={dangerPanel}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--c-bad-ink)' }}>{t.people.removeQ}</div>
            <div style={{ fontSize: 13, color: 'var(--c-bad-ink)', lineHeight: 1.4 }}>{t.people.removeSub}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <Button variant="secondary" fullWidth onClick={p.cancelRemove}>{t.people.cancel}</Button>
              <button type="button" disabled={p.busy} onClick={p.remove} style={dangerBtn}>{t.people.remove}</button>
            </div>
          </div>
        ) : (
          <div {...tap(p.askRemove)} style={dangerAsk}>
            <Icon name="trash-2" size={16} color="var(--c-bad-ink)" />{t.people.remove}
          </div>
        )
      ) : null}
    </div>
  );
}
