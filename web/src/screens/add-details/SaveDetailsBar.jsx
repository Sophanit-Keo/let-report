// Bottom "Save details" bar.
import { Button } from '../../components/index.js';

export function SaveDetailsBar({ v }) {
  return (
    <div className="bottombar">
      <div className="bottombar-inner"><Button variant="primary" fullWidth onClick={v.saveDetails}>{v.t.save}</Button></div>
    </div>
  );
}
