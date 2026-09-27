// Full-screen report capture (a panel on tablets and computers). Picks the step to show.
import { CameraStep } from './CameraStep.jsx';
import { OverlayFlow } from './OverlayFlow.jsx';
import { StepCardsFlow } from './StepCardsFlow.jsx';
import { OneSheetFlow } from './OneSheetFlow.jsx';
import { SignStep } from './SignStep.jsx';

export function CaptureFlow({ v }) {
  const c = v.cap;
  const close = e => { if (e.target === e.currentTarget) v.nav.home(); };
  return (
    <div className="capture-wrap" onClick={close}>
      <div className="capture" role="dialog" aria-modal="true" aria-label={v.t.reportIssue}>
        {c.showCamera ? <CameraStep v={v} /> : null}
        {c.showOverlay ? <OverlayFlow v={v} /> : null}
        {c.showSteps ? <StepCardsFlow v={v} /> : null}
        {c.showSheet ? <OneSheetFlow v={v} /> : null}
        {c.showSign ? <SignStep v={v} /> : null}
      </div>
    </div>
  );
}
