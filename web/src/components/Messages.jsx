// Chat bubbles (used by the Chat screen and a trouble's Discussion) and the message composer.
import { useEffect, useRef, useState } from 'react';
import { Avatar } from './Avatar.jsx';
import { Icon } from './Icon.jsx';
import { tap } from '../utils/tap.js';

export function Bubbles({ items, delLabel }) {
  return items.map(b => {
    if (b.divider) return <div key={b.key} className="msg-day"><span>{b.label}</span></div>;
    return (
      <div key={b.key} className={'msg' + (b.mine ? ' mine' : '') + (b.first ? ' first' : '')}>
        {!b.mine ? <div className="msg-av">{b.first ? <Avatar src={b.avatar} size={30} /> : null}</div> : null}
        <div className="msg-col">
          {b.first && !b.mine ? <div className="msg-name">{b.name}</div> : null}
          <div className={'msg-bubble' + (b.sending ? ' sending' : '')}>
            {b.hasPhoto ? (
              b.photo ? <a href={b.photo} target="_blank" rel="noreferrer" className="msg-photo"><img src={b.photo} alt="" loading="lazy" /></a>
                : <div className="msg-photo placeholder"><Icon name="image" size={22} color="var(--gray-400)" /></div>
            ) : null}
            {b.body ? <div className="msg-text">{b.body}</div> : null}
          </div>
          <div className="msg-meta">
            <span>{b.time}</span>
            {b.del ? <DeleteButton onDelete={b.del} label={delLabel} /> : null}
          </div>
        </div>
      </div>
    );
  });
}

// Two taps to delete: the first asks, the second deletes (it resets after a few seconds).
function DeleteButton({ onDelete, label }) {
  const [ask, setAsk] = useState(false);
  useEffect(() => { if (!ask) return undefined; const t = setTimeout(() => setAsk(false), 3000); return () => clearTimeout(t); }, [ask]);
  return (
    <span {...tap(() => (ask ? onDelete() : setAsk(true)), 'msg-del' + (ask ? ' ask' : ''))} aria-label={label} title={label}>
      <Icon name="trash-2" size={13} />{ask ? <span>{label}?</span> : null}
    </span>
  );
}

// Scrolling list that stays pinned to the newest message.
export function MessageList({ items, delLabel, empty, emptyText }) {
  const ref = useRef(null);
  const last = items.length ? items[items.length - 1].key : null;
  useEffect(() => { const el = ref.current; if (el) el.scrollTop = el.scrollHeight; }, [last]);
  // photos finish loading after the text: stay at the bottom if the reader was there
  useEffect(() => {
    const el = ref.current; if (!el) return undefined;
    const onLoad = () => { if (el.scrollHeight - el.scrollTop - el.clientHeight < 400) el.scrollTop = el.scrollHeight; };
    el.addEventListener('load', onLoad, true);
    return () => el.removeEventListener('load', onLoad, true);
  }, []);
  return (
    <div className="msg-list" ref={ref}>
      {empty ? <div className="msg-empty">{emptyText}</div> : <Bubbles items={items} delLabel={delLabel} />}
    </div>
  );
}

const touch = () => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

export function Composer({ c, id }) {
  const ref = useRef(null);
  // grow with the text, up to about five lines
  useEffect(() => { const el = ref.current; if (!el) return; el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 132) + 'px'; }, [c.text]);
  const onKey = e => { if (e.key === 'Enter' && !e.shiftKey && !touch()) { e.preventDefault(); if (c.canSend) c.send(); } };
  return (
    <div className="composer">
      {c.photo ? (
        <div className="composer-photo">
          <img src={c.photo} alt="" />
          <span {...tap(c.clear, 'composer-photo-x')} aria-label={c.labels.remove}><Icon name="x" size={14} color="#fff" /></span>
        </div>
      ) : null}
      <div className="composer-row">
        <label className="composer-btn" aria-label={c.labels.add} title={c.labels.add}>
          <Icon name="image-plus" size={22} color="var(--blue-600)" />
          <input type="file" accept="image/*" onChange={c.onPick} style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden' }} />
        </label>
        <textarea id={id} ref={ref} rows={1} value={c.text} onChange={c.onText} onKeyDown={onKey} placeholder={c.placeholder} maxLength={4000} />
        <button type="button" className="composer-send" disabled={!c.canSend} onClick={c.send} aria-label={c.labels.send} title={c.labels.send}>
          <Icon name="send-horizontal" size={20} color="#fff" />
        </button>
      </div>
    </div>
  );
}
