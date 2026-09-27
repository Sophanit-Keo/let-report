// VerifySheet a corrective action and close, or send it back.
import { Button } from '../components/index.js';
import { title, col } from './sheetStyles.js';

export function VerifySheet({ v }) {
  const t = v.t;
  return (
    <div style={col(14)}>
      <h2 style={{ ...title, paddingRight: 40 }}>{t.verifyQ}</h2>
      <div style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--gray-700)' }}>{t.verifySub}</div>
      <Button variant="success" icon="circle-check" fullWidth onClick={v.verifyYes}>{t.verifyYes}</Button>
      <Button variant="secondary" icon="rotate-ccw" fullWidth onClick={v.verifyNo}>{t.verifyNo}</Button>
    </div>
  );
}
