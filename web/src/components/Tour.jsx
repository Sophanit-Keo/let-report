// Guided tour: dims the app, highlights one part (an element marked data-tour="…") and explains it.
// Steps without a target (welcome, inside a trouble, done) show as a card in the middle.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button } from './Button.jsx';
import { Icon } from './Icon.jsx';
import { tap } from '../utils/tap.js';

const PAD = 6, GAP = 12, EDGE = 12;

// The visible element for this step (phones show the tab bar, computers the sidebar).
function findTarget(key) {
  if (!key) return null;
  const all = [...document.querySelectorAll('[data-tour="' + key + '"]')];
  return all.find(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && el.offsetParent !== null; }) || null;
}

export function Tour({ tour }) {
  const [rect, setRect] = useState(null);
  const [cardH, setCardH] = useState(0);
  const cardRef = useRef(null);

  useLayoutEffect(() => {
    const el = findTarget(tour.target);
    const tall = r => r.height > window.innerHeight * 0.45;
    if (el) {
      const r0 = el.getBoundingClientRect();
      if (tall(r0)) el.scrollIntoView({ block: 'start' });
      else if (r0.top < 0 || r0.bottom > window.innerHeight) el.scrollIntoView({ block: 'center' });
    }
    // a tall part (e.g. the list of lines): highlight its top, leave room for the card below
    const measure = () => {
      const t = findTarget(tour.target); if (!t) { setRect(null); return; }
      const r = t.getBoundingClientRect();
      setRect(tall(r) ? { top: r.top, left: r.left, width: r.width, height: Math.round(window.innerHeight * 0.3), bottom: r.top + Math.round(window.innerHeight * 0.3) } : r);
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => { window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure, true); };
  }, [tour.target, tour.key]);

  useLayoutEffect(() => { if (cardRef.current) setCardH(cardRef.current.offsetHeight); });
  useEffect(() => { if (cardRef.current) cardRef.current.focus({ preventScroll: true }); }, [tour.key]);

  const vw = window.innerWidth, vh = window.innerHeight;
  const cardW = Math.min(380, vw - EDGE * 2);
  let style;
  if (rect) {
    const below = vh - rect.bottom - PAD - GAP, above = rect.top - PAD - GAP;
    const top = below >= cardH || below >= above ? Math.min(rect.bottom + PAD + GAP, vh - cardH - EDGE) : Math.max(EDGE, rect.top - PAD - GAP - cardH);
    const left = Math.max(EDGE, Math.min(rect.left + rect.width / 2 - cardW / 2, vw - cardW - EDGE));
    style = { top, left, width: cardW };
  } else {
    style = { top: Math.max(EDGE, (vh - cardH) / 2), left: (vw - cardW) / 2, width: cardW };
  }

  return (
    <div className="tour" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      <div className="tour-block" />
      {rect ? <div className="tour-hole" style={{ top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2 }} />
        : <div className="tour-dim" />}
      <div className="tour-card" ref={cardRef} style={style} tabIndex={-1}>
        <div className="tour-card-top">
          <div className="tour-ic"><Icon name={tour.icon} size={20} color="#fff" /></div>
          <span className="tour-count">{tour.n} {tour.labels.of} {tour.total}</span>
          {!tour.last ? <span {...tap(tour.skip, 'tour-skip')}>{tour.labels.skip}</span> : null}
        </div>
        <h2 id="tour-title" className="tour-title">{tour.title}</h2>
        <p className="tour-body">{tour.body}</p>
        <div className="tour-dots" aria-hidden="true">{tour.dots.map((on, i) => <span key={i} className={on ? 'on' : ''} />)}</div>
        <div className="tour-actions">
          {!tour.first ? <Button variant="secondary" onClick={tour.back}>{tour.labels.back}</Button> : <span />}
          <Button variant={tour.last ? 'success' : 'primary'} iconRight={tour.last ? null : 'arrow-right'} onClick={tour.next}>{tour.labels.next}</Button>
        </div>
      </div>
    </div>
  );
}
