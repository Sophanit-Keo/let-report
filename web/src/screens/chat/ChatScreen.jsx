// ChatScreen: conversations on the left (team room + each person), the open conversation on the right.
// Phones show one at a time; tablets and computers show both side by side.
import { Avatar, Icon } from '../../components/index.js';
import { MessageList, Composer } from '../../components/Messages.jsx';
import { tap } from '../../utils/tap.js';

function Row({ r, t }) {
  return (
    <div {...tap(r.open, 'chat-row' + (r.on ? ' on' : ''))} aria-current={r.on ? 'true' : undefined}>
      <div className="chat-av">
        {r.team ? <div className="chat-team-ic"><Icon name="messages-square" size={22} color="#fff" /></div> : <Avatar src={r.avatar} size={44} />}
        {r.online ? <span className="online-dot" title={t.chat.online} /> : null}
      </div>
      <div className="chat-row-main">
        <div className="chat-row-top">
          <span className="chat-row-name">{r.name}</span>
          {r.role ? <span className="chat-role">{r.role}</span> : null}
          <span className="chat-row-time">{r.time}</span>
        </div>
        <div className="chat-row-bottom">
          <span className={'chat-row-sub' + (r.unread ? ' strong' : '')}>{r.sub}</span>
          {r.unread ? <span className="chat-unread">{r.unread > 99 ? '99+' : r.unread}</span> : null}
        </div>
      </div>
    </div>
  );
}

export function ChatScreen({ v }) {
  const t = v.t, c = v.chat, th = c.thread;
  return (
    <div className={'chat' + (c.hasRoom ? ' has-room' : '')}>
      <section className="chat-list" aria-label={t.chat.title}>
        <div className="chat-list-head">
          <h1>{t.chat.title}</h1>
          {c.live ? <span className="live-pill on" title={t.chat.live}>{t.chat.live}</span> : null}
        </div>
        <div className="chat-search">
          <Icon name="search" size={18} color="var(--gray-500)" />
          <input value={c.q} onChange={c.onQ} placeholder={t.chat.search} aria-label={t.chat.search} />
        </div>
        <div className="chat-rows">
          <Row r={c.teamRow} t={t} />
          <div className="chat-label">{t.chat.people}</div>
          {c.people.map(r => <Row key={r.room} r={r} t={t} />)}
        </div>
      </section>

      <section className="chat-thread">
        {th ? (
          <>
            <div className="chat-thread-head">
              <div {...tap(th.back, 'icon-btn chat-back')} aria-label="Back"><Icon name="chevron-left" size={24} color="var(--navy-900)" /></div>
              <div className="chat-av small">
                {th.team ? <div className="chat-team-ic small"><Icon name="messages-square" size={18} color="#fff" /></div> : <Avatar src={th.avatar} size={38} />}
                {th.online ? <span className="online-dot" /> : null}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="chat-thread-title">{th.title}</div>
                <div className="chat-thread-sub">{th.sub}</div>
              </div>
            </div>
            <MessageList items={th.items} delLabel={t.chat.del} empty={th.empty} emptyText={t.chat.empty} />
            <Composer c={th.composer} id="chat-input" />
          </>
        ) : (
          <div className="chat-none">
            <Icon name="message-circle" size={40} color="var(--blue-300)" />
            <div style={{ fontWeight: 800, fontSize: 18 }}>{t.chat.noChat}</div>
            <div style={{ color: 'var(--gray-500)', fontSize: 14 }}>{t.chat.noChatSub}</div>
          </div>
        )}
      </section>
    </div>
  );
}
