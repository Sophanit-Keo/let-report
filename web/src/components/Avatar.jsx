// Round portrait.

export function Avatar({ src, size = 36, style }) {
  return <img src={src} alt="" width={size} height={size} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: 'var(--blue-100)', display: 'block', flex: 'none', ...style }} />;
}
