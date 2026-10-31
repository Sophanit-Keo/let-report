// Shared inline style snippets (chips, inputs, text areas). Colours are the theme's --c-* tokens (tokens/theme.css),
// so they follow the light design and the dark control-room look.

export const chip = (bg, fg, extra) => ({ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: bg, color: fg, ...extra });

export const inputStyle = { height: 48, borderRadius: 12, border: '1.5px solid var(--c-line)', padding: '0 14px', fontSize: 15, color: 'var(--c-ink)', background: 'var(--c-field)', outline: 'none', minWidth: 0, width: '100%' };

export const areaStyle = { borderRadius: 12, border: '1.5px solid var(--c-line)', padding: '12px 14px', fontSize: 15, color: 'var(--c-ink)', background: 'var(--c-field)', outline: 'none', resize: 'none', lineHeight: 1.45, width: '100%' };
