// Push notifications: turn on/off for this device, send a test, and open the right screen
// when a notification is tapped. Mixed into AppController (see the bottom of AppController.js).
import { repo } from '../api/repo.js';
import { pushSupport, permission, subscribe, subscriptionRow, currentSubscription, unsubscribe } from '../utils/push.js';
import { TEAM_ROOM } from './chat.js';

const LATER_KEY = 'let-report:push-later';

export const pushState = { push: { support: 'no', permission: 'default', on: false, busy: false, later: false } };

export const pushMethods = {
  // Called once after sign-in: see what this device can do, and keep an existing subscription linked to this person.
  async initPush() {
    const support = pushSupport();
    let later = false; try { later = Date.now() - (+window.localStorage.getItem(LATER_KEY) || 0) < 7 * 86400000; } catch (e) { /* storage blocked */ }
    const sub = support === 'yes' ? await currentSubscription() : null;
    const on = !!sub && permission() === 'granted';
    this.setState({ push: { support, permission: permission(), on, busy: false, later } });
    if (on) repo.savePushSubscription({ ...subscriptionRow(sub), user_id: this.myId() }).catch(() => {});
  },
  async enablePush() {
    if (this.state.push.busy) return;
    this.setState(s => ({ push: { ...s.push, busy: true } }));
    try {
      const key = await repo.pushKey();
      if (!key) throw new Error(this.T().push.notReady);
      const sub = await subscribe(key);
      if (!sub) { this.setState(s => ({ push: { ...s.push, busy: false, permission: permission() } })); this.toast(this.T().push.blocked); return; }
      await repo.savePushSubscription({ ...subscriptionRow(sub), user_id: this.myId() });
      this.setState(s => ({ push: { ...s.push, busy: false, on: true, permission: 'granted' } }));
      this.toast(this.T().push.onToast);
    } catch (e) { this.setState(s => ({ push: { ...s.push, busy: false } })); this.toast(e.message); }
  },
  async disablePush() {
    this.setState(s => ({ push: { ...s.push, busy: true } }));
    try { const endpoint = await unsubscribe(); if (endpoint) await repo.removePushSubscription(endpoint); }
    catch (e) { this.toast(e.message); }
    this.setState(s => ({ push: { ...s.push, busy: false, on: false } }));
  },
  // Before signing out: this device stops getting this person's notifications.
  async forgetPushDevice() {
    try { const sub = await currentSubscription(); if (sub) await repo.removePushSubscription(sub.endpoint); } catch (e) { /* signed out anyway */ }
  },
  async testPush() {
    try { const r = await repo.testPush(this.T().push.testText); this.toast(r && r.sent ? this.T().push.testSent : this.T().push.testNone); }
    catch (e) { this.toast(e.message); }
  },
  pushLater() {
    try { window.localStorage.setItem(LATER_KEY, String(Date.now())); } catch (e) { /* storage blocked */ }
    this.setState(s => ({ push: { ...s.push, later: true } }));
  },

  // ───── Links from notifications: #report=TR-1043, #chat=team, #alerts ─────
  openLink(link) {
    const m = String(link || '').match(/#(report|chat|alerts)=?(.*)$/);
    if (!m) return;
    if (m[1] === 'report' && m[2]) this.go('detail', { selId: decodeURIComponent(m[2]), sheet: null });
    else if (m[1] === 'chat') this.openRoom(decodeURIComponent(m[2]) || TEAM_ROOM);
    else if (m[1] === 'alerts') this.go('alerts', { sheet: null });
  },
  listenForLinks() {
    // opened from a notification: the link is in the address
    const h = window.location.hash;
    if (/^#(report|chat|alerts)/.test(h)) { this._link = h; try { window.history.replaceState(null, '', window.location.pathname + window.location.search); } catch (e) { /* old browsers */ } }
    // the address changed while the app is open
    this._onHash = () => { const x = window.location.hash; if (!/^#(report|chat|alerts)/.test(x)) return; try { window.history.replaceState(null, '', window.location.pathname + window.location.search); } catch (e) { /* old browsers */ } if (this.state.booting) this._link = x; else this.openLink(x); };
    window.addEventListener('hashchange', this._onHash);
    // app already open: the service worker tells us
    this._onSwMessage = e => { if (e.data && e.data.type === 'open') { if (this.state.booting) this._link = e.data.link; else this.openLink(e.data.link); } };
    if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', this._onSwMessage);
  },
  stopListeningForLinks() { window.removeEventListener('hashchange', this._onHash); if (this._onSwMessage && 'serviceWorker' in navigator) navigator.serviceWorker.removeEventListener('message', this._onSwMessage); },
};
