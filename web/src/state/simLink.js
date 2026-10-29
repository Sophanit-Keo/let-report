// Links that start a new report already filled in, sent by the UHT milk plant simulation for a fault:
//   #new?cat=temperature&sev=2&ptype=UHT+milk&loc=Packing&title=…&hold=1&desc=…
// cat is a CATS key, sev 0–3 (low to critical), ptype one of PTYPES, title the text of a 'custom' report,
// loc one of the places (else the first line of that product type), hold=1 to hold the product.
// Anything unknown is dropped. The person still signs and sends the report.
import { CATS, PTYPES } from '../data/constants.js';

export const NEW_DESC_MAX = 800;
const line = (v, n) => String(v || '').replace(/\s+/g, ' ').trim().slice(0, n);

export function parseNewLink(link) {
  const m = String(link || '').match(/#new[?=]?(.*)$/);
  if (!m) return null;
  const q = new URLSearchParams(m[1]);
  const cat = CATS.some(c => c[0] === q.get('cat')) ? q.get('cat') : null;
  const sev = /^[0-3]$/.test(q.get('sev') || '') ? Number(q.get('sev')) : null;
  return {
    cat, sev,
    title: cat === 'custom' ? line(q.get('title'), 80) : '',
    ptype: PTYPES.includes(q.get('ptype')) ? q.get('ptype') : '',
    loc: line(q.get('loc'), 60),
    hold: q.get('hold') === '1',
    desc: String(q.get('desc') || '').trim().slice(0, NEW_DESC_MAX),
  };
}
