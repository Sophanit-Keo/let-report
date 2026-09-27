// Discussion: comments on a trouble (text and photos), updated live.
import { Bubbles, Composer } from '../../components/Messages.jsx';

export function Discussion({ v, h2 }) {
  const d = v.sel.discussion, t = v.t;
  if (!d) return null;
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }} aria-label={d.title}>
      <h2 style={h2}>{d.title}{d.count ? <span className="count-chip">{d.count}</span> : null}</h2>
      <div className="discussion">
        {d.empty ? <div className="msg-empty">{d.emptyText}</div> : <div className="discussion-list"><Bubbles items={d.items} delLabel={t.chat.delComment} /></div>}
        <Composer c={d.composer} id="comment-input" />
      </div>
    </section>
  );
}
