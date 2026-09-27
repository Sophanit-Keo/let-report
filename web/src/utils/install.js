// "Install / Add to Home Screen" support.
// Chrome, Edge and Samsung Internet fire `beforeinstallprompt`: we keep it and show our own Install button.
// iPhone/iPad Safari has no install button, so we show the Share → Add to Home Screen steps instead.
const KEY = 'let-report:install-later';
const LATER_DAYS = 7;
let deferred = null;
const listeners = new Set();
const emit = () => listeners.forEach(fn => fn());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; emit(); });
  window.addEventListener('appinstalled', () => { deferred = null; installedNow = true; emit(); });
}
let installedNow = false;

export const onInstallChange = fn => { listeners.add(fn); return () => listeners.delete(fn); };

export function isStandalone() {
  try { return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true; } catch (e) { return false; }
}
export function isIOS() {
  const ua = navigator.userAgent || '';
  return /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);   // iPadOS reports "Mac"
}
// Phones and tablets (touch screens), not computers.
export function isMobileOrTablet() {
  const ua = navigator.userAgent || '';
  if (isIOS() || /Android|Mobile|Tablet|Silk|Kindle/i.test(ua)) return true;
  try { return window.matchMedia('(pointer: coarse)').matches && Math.min(window.screen.width, window.screen.height) <= 1024; } catch (e) { return false; }
}
export function wasPostponed() {
  try { const t = +window.localStorage.getItem(KEY); return t && Date.now() - t < LATER_DAYS * 86400000; } catch (e) { return false; }
}
export function postpone() { try { window.localStorage.setItem(KEY, String(Date.now())); } catch (e) { /* storage blocked */ } }

// What the card should show: 'native' (real Install button), 'ios' (Share steps), 'menu' (browser menu steps) or null.
export function installMode() {
  if (installedNow || isStandalone() || !isMobileOrTablet()) return null;
  if (deferred) return 'native';
  if (isIOS()) return 'ios';
  return 'menu';
}
export async function promptInstall() {
  if (!deferred) return false;
  const e = deferred; deferred = null;
  e.prompt();
  const choice = await e.userChoice.catch(() => null);
  emit();
  return !!(choice && choice.outcome === 'accepted');
}

// Register the service worker (needed to install; also makes the app open faster).
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !window.isSecureContext || window.location.protocol === 'file:') return;
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}
