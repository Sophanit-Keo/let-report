// Push notifications in the browser: can this device get them, ask permission, subscribe.
// iPhone/iPad: only when the app is added to the Home Screen (iOS 16.4 and later).
import { isIOS, isStandalone } from './install.js';

export function pushSupport() {
  const ok = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && window.isSecureContext;
  if (ok) return 'yes';
  if (typeof window !== 'undefined' && isIOS() && !isStandalone()) return 'ios-install';   // install first, then it works
  return 'no';
}
export const permission = () => (typeof window !== 'undefined' && 'Notification' in window ? window.Notification.permission : 'denied');

const keyBytes = b64 => { const s = window.atob(b64.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((b64.length + 3) % 4)); return Uint8Array.from(s, c => c.charCodeAt(0)); };
const toB64u = buf => window.btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function registration() {
  const reg = (await navigator.serviceWorker.getRegistration()) || (await navigator.serviceWorker.register('sw.js'));
  return navigator.serviceWorker.ready.then(() => reg);
}
export async function currentSubscription() {
  if (pushSupport() !== 'yes') return null;
  try { const reg = await navigator.serviceWorker.getRegistration(); return reg ? await reg.pushManager.getSubscription() : null; } catch (e) { return null; }
}
// Must be called from a tap (browsers only show the permission question after a user action).
export async function subscribe(vapidPublicKey) {
  const result = await window.Notification.requestPermission();
  if (result !== 'granted') return null;
  const reg = await registration();
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(vapidPublicKey) });
  return sub;
}
export function subscriptionRow(sub) {
  return { endpoint: sub.endpoint, p256dh: toB64u(sub.getKey('p256dh')), auth: toB64u(sub.getKey('auth')), user_agent: (navigator.userAgent || '').slice(0, 200) };
}
export async function unsubscribe() {
  const sub = await currentSubscription();
  if (sub) { const endpoint = sub.endpoint; await sub.unsubscribe().catch(() => {}); return endpoint; }
  return null;
}
