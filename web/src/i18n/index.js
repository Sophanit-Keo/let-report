import { EN } from './en.js';
import { KM } from './km.js';

export const LANGS = { en: EN, km: KM };
export const strings = lang => (lang === 'km' ? KM : EN);
export { EN, KM };
