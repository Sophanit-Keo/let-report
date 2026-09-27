// Layout helpers shared by the sheets.

export const title = { margin: 0, fontWeight: 800, fontSize: 20, letterSpacing: '-0.01em' };

export const col = gap => ({ display: 'flex', flexDirection: 'column', gap });

export const grid = (n, gap = 6) => ({ display: 'grid', gridTemplateColumns: 'repeat(' + n + ',minmax(0,1fr))', gap });
