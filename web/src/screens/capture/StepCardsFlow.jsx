// Report flow B: one question per step, big cards.
import { Button, Icon } from '../../components/index.js';
import { tap } from '../../utils/tap.js';
import { customInput, Thumb } from './parts.jsx';

// Flow B — light step cards

export function StepCardsFlow({ v }) {
  const t = v.t, c = v.cap;
  return (
    <div className="capture-scroll" style={{ background: 'var(--blue-50)', display: 'flex', flexDirection: 'column', animation: 'lrFade 200ms cubic-bezier(.2,.7,.2,1)' }}>
      <div className="cap-top" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px' }}>
        <div {...tap(v.stepBack, 'icon-btn')} aria-label="Back"><Icon name="chevron-left" size={24} color="var(--navy-900)" /></div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, padding: '0 8px' }}>
          {c.bars.map((b, i) => <div key={i} style={{ height: 4, borderRadius: 4, background: b.bg, transition: 'background 200ms' }} />)}
        </div>
        <div style={{ width: 40 }} />
      </div>
      <div className="cap-bottom" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <Thumb c={c} size={64} />
          <div style={{ fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{c.stepTitle}</div>
        </div>
        {c.subCat ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10, animation: 'lrUp 200ms cubic-bezier(.2,.7,.2,1)' }}>
              {v.cats.map((k, i) => (
                <div key={i} {...tap(k.pick, 'card-tap')} style={{ height: 88, borderRadius: 18, padding: 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: k.bg, border: '1.5px solid ' + k.bd, boxShadow: 'var(--shadow-card)' }}>
                  <Icon name={k.icon} size={26} color={k.ic} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: k.fg }}>{k.label}</span>
                </div>
              ))}
            </div>
            {c.isCustom ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'lrUp 200ms cubic-bezier(.2,.7,.2,1)' }}>
                <input value={c.customText} onChange={v.onCustom} placeholder={t.customPh} autoFocus style={customInput} />
                <Button variant="primary" iconRight="arrow" fullWidth disabled={c.customEmpty} onClick={v.customNext}>{t.next}</Button>
              </div>
            ) : null}
          </>
        ) : null}
        {c.subSev ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'lrUp 200ms cubic-bezier(.2,.7,.2,1)' }}>
            {v.sevCards.map((s, i) => (
              <div key={i} {...tap(s.pick, 'card-tap')} style={{ borderRadius: 18, padding: 16, display: 'flex', gap: 14, alignItems: 'center', background: '#fff', border: '1.5px solid var(--blue-200)', boxShadow: 'var(--shadow-card)' }}>
                <div style={{ width: 14, height: 44, borderRadius: 7, background: s.bar, flex: 'none' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: s.fg }}>{s.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.4 }}>{s.hint}</div>
                </div>
                <Icon name="chevron-right" size={18} color="var(--navy-300)" />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
