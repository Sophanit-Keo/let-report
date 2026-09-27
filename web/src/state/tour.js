// "How to use Let Report": a short guided tour that points at each part of the app.
// Shown once to each person (saved on their profile, so not again on another device);
// they can skip it at any step and open it again from their account.
// Mixed into AppController (see the bottom of AppController.js).
import { repo } from '../api/repo.js';

// Each step points at an element marked data-tour="…" (the visible one), or sits in the middle.
const STEPS = ['welcome', 'report', 'list', 'detail', 'tasks', 'chat', 'alerts', 'lines', 'me', 'done'];

export const tourState = { tour: null };   // { step: number } while the guide is open

export const tourMethods = {
  tourSteps() { return STEPS; },
  // After sign-in: new people get the guide once.
  maybeStartTour() {
    const p = this.profile();
    if (!p || p.guide_seen_at || p.active === false || this._tourOffered === p.id) return;
    this._tourOffered = p.id;
    this.startTour();
  },
  startTour() { this.setState({ tour: { step: 0 }, sheet: null, screen: 'home', prev: 'home' }); },
  tourGo(i) { if (i < 0) return; if (i >= STEPS.length) { this.endTour(); return; } this.setState({ tour: { step: i } }); },
  endTour() {
    this.setState({ tour: null });
    const p = this.profile();
    if (p && !p.guide_seen_at) {
      const at = new Date().toISOString();
      this.setState(s => ({ profiles: s.profiles.map(x => (x.id === p.id ? { ...x, guide_seen_at: at } : x)) }));
      repo.updateProfile(p.id, { guide_seen_at: at }).catch(() => { /* shown again next time; harmless */ });
    }
  },
};
