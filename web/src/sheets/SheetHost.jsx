// Shows the open sheet: bottom sheet on phones, centered dialog on tablets and computers.
import { Icon } from '../components/index.js';
import { tap } from '../utils/tap.js';
import { RoleSheet } from './RoleSheet.jsx';
import { AssignSheet } from './AssignSheet.jsx';
import { EscalateSheet } from './EscalateSheet.jsx';
import { FiltersSheet } from './FiltersSheet.jsx';
import { DecisionSheet } from './DecisionSheet.jsx';
import { VerifySheet } from './VerifySheet.jsx';
import { LineSheet } from './LineSheet.jsx';
import { LineFormSheet } from './LineFormSheet.jsx';
import { PersonSheet } from './PersonSheet.jsx';
import { AddPersonSheet } from './AddPersonSheet.jsx';

export function SheetHost({ v }) {
  const s = v.sheet;
  if (!s.show) return null;
  return (
    <div className="sheet-wrap">
      <div className="sheet-backdrop" onClick={v.closeSheet} />
      <div className="sheet" role="dialog" aria-modal="true">
        <div className="sheet-handle" />
        <div {...tap(v.closeSheet, 'icon-btn sheet-close')} aria-label="Close"><Icon name="x" size={20} color="var(--navy-500)" /></div>
        {s.person ? <PersonSheet v={v} /> : null}
        {s.addPerson ? <AddPersonSheet v={v} /> : null}
        {s.line ? <LineSheet v={v} /> : null}
        {s.lineForm ? <LineFormSheet v={v} /> : null}
        {s.roles ? <RoleSheet v={v} /> : null}
        {s.assign ? <AssignSheet v={v} /> : null}
        {s.escalate ? <EscalateSheet v={v} /> : null}
        {s.filters ? <FiltersSheet v={v} /> : null}
        {s.decide ? <DecisionSheet v={v} /> : null}
        {s.verify ? <VerifySheet v={v} /> : null}
      </div>
    </div>
  );
}
