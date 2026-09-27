// Form field: a bold label above its control(s).

export function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 700 }}>{label}</div>
      {children}
    </div>
  );
}
