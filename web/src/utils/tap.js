

// Props that make any element behave as an accessible button (click, Enter, Space).

export const tap = (fn, extra) => ({
  role: 'button',
  tabIndex: 0,
  className: 'tap' + (extra ? ' ' + extra : ''),
  onClick: fn,
  onKeyDown: e => { if (fn && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); fn(e); } },
});
