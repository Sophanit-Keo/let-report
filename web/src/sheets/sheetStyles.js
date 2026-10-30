// Layout helpers shared by the sheets. Colours are the theme's --c-* tokens (styles/tokens/theme.css).

export const title = { margin: 0, fontWeight: 800, fontSize: 20, letterSpacing: '-0.01em' };

export const col = gap => ({ display: 'flex', flexDirection: 'column', gap });

export const grid = (n, gap = 6) => ({ display: 'grid', gridTemplateColumns: 'repeat(' + n + ',minmax(0,1fr))', gap });

// A section label inside a sheet ("Status", "Lot number"…). Without the --lr-label-* values it is today's bold 13 px label
// in the text colour, in both themes; the dark theme can set them to make it the control room's small, uppercase,
// letter-spaced, muted tag (e.g. 12px, uppercase, .06em, var(--c-muted)).
export const label = { fontSize: 'var(--lr-label-size, 13px)', fontWeight: 700, color: 'var(--lr-label-ink, var(--c-ink))',
  textTransform: 'var(--lr-label-case, none)', letterSpacing: 'var(--lr-label-track, normal)' };

// A hint or secondary line under a field.
export const small = { fontSize: 12, color: 'var(--c-muted)', lineHeight: 1.4 };

// A box inside a sheet (a form, a list): the card colour with a border.
export const box = { borderRadius: 14, border: '1.5px solid var(--c-line)', background: 'var(--c-surface)' };

// Destructive actions: the confirm panel, its solid button, and the outlined "Remove…" that opens it.
// The button's text is the card colour cut out of the red (white in light, near-black on the light red of dark).
export const dangerPanel = { display: 'flex', flexDirection: 'column', gap: 10, padding: 14, borderRadius: 14, background: 'var(--c-bad-bg)', border: '1.5px solid var(--c-bad)' };
export const dangerBtn = { height: 40, borderRadius: 8, border: 'none', background: 'var(--c-bad-ink)', color: 'var(--c-surface)', fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'inherit' };
export const dangerAsk = { height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: 'var(--c-bad-ink)', border: '2px solid var(--c-bad-bg)' };
