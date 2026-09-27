// Shared inline style snippets (chips, inputs, text areas).

export const chip = (bg, fg, extra) => ({ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: bg, color: fg, ...extra });

export const inputStyle = { height: 48, borderRadius: 12, border: '1.5px solid var(--blue-200)', padding: '0 14px', fontSize: 15, color: 'var(--navy-900)', background: '#fff', outline: 'none', minWidth: 0, width: '100%' };

export const areaStyle = { borderRadius: 12, border: '1.5px solid var(--blue-200)', padding: '12px 14px', fontSize: 15, color: 'var(--navy-900)', background: '#fff', outline: 'none', resize: 'none', lineHeight: 1.45, width: '100%' };
