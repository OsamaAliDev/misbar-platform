import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setNumberLocale } from '../lib/arabic.js';
import { readJSON, writeJSON } from '../lib/storage.js';
import ar from './locales/ar/index.js';
import en from './locales/en/index.js';

/**
 * Tiny translation helper for مِسبار (no external library).
 * ---------------------------------------------------------------------------
 *   const { t, lang, dir, isRTL, setLang } = useI18n();
 *   t('game.lobby.title')                     → string
 *   t('game.lobby.greeting', { name: 'X' })   → "{name}" placeholders filled
 *   t('common.starCount', { count: 3 })       → dictionary entries may be
 *                                               functions (plural rules)
 *   t('heroes.lubna.lines.celebrate')         → arrays / objects returned as-is
 *
 * Arabic is the default and the fallback: a key missing in English falls
 * back to Arabic, and a key missing everywhere returns the key itself (and
 * warns in development) so it is easy to spot.
 */

/** Supported languages. `dir` is applied to <html>, `numberLocale` to numbers. */
export const LANGUAGES = Object.freeze({
  ar: Object.freeze({ code: 'ar', dir: 'rtl', numberLocale: 'ar-EG' }),
  en: Object.freeze({ code: 'en', dir: 'ltr', numberLocale: 'en-US' }),
});

export const DEFAULT_LANGUAGE = 'ar';
export const LANGUAGE_STORAGE_KEY = 'misbar:lang:v1';

const DICTIONARIES = { ar, en };

function isSupported(lang) {
  return Object.prototype.hasOwnProperty.call(LANGUAGES, lang);
}

function lookup(dictionary, key) {
  return key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), dictionary);
}

function interpolate(text, vars) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
}

/**
 * Translate `key` in `lang` (without React — also used outside components).
 * @param {string} lang
 * @param {string} key   dot path, e.g. "game.nav.lobby"
 * @param {Record<string, unknown>} [vars]
 */
export function translate(lang, key, vars) {
  let value = lookup(DICTIONARIES[lang], key);
  if (value === undefined && lang !== DEFAULT_LANGUAGE) value = lookup(DICTIONARIES[DEFAULT_LANGUAGE], key);
  if (value === undefined) {
    if (import.meta.env.DEV) console.warn(`[i18n] missing key "${key}"`);
    return key;
  }
  if (typeof value === 'function') return value(vars ?? {});
  if (typeof value === 'string') return interpolate(value, vars);
  return value;
}

/** Read the stored language (Arabic for first-time visitors). */
function loadLanguage() {
  const stored = readJSON(LANGUAGE_STORAGE_KEY);
  return isSupported(stored) ? stored : DEFAULT_LANGUAGE;
}

/** Apply a language to the document root and the number formatter. */
function applyLanguage(lang) {
  const { dir, numberLocale } = LANGUAGES[lang];
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
  setNumberLocale(numberLocale);
}

const I18nContext = createContext(null);

/**
 * Provides `{ lang, dir, isRTL, t, setLang, toggleLang }`.
 * The language is persisted in localStorage and mirrored on <html lang dir>.
 */
export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const initial = loadLanguage();
    applyLanguage(initial); // before the first render, so numbers/dir are right immediately
    return initial;
  });

  useEffect(() => {
    applyLanguage(lang);
    writeJSON(LANGUAGE_STORAGE_KEY, lang);
  }, [lang]);

  // Keep several open tabs in sync.
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === LANGUAGE_STORAGE_KEY) {
        const next = loadLanguage();
        applyLanguage(next);
        setLangState(next);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setLang = useCallback((next) => {
    if (!isSupported(next)) return;
    applyLanguage(next); // synchronously, before the remount triggered by the new key
    setLangState(next);
  }, []);

  const value = useMemo(() => {
    const { dir } = LANGUAGES[lang];
    return {
      lang,
      dir,
      isRTL: dir === 'rtl',
      t: (key, vars) => translate(lang, key, vars),
      setLang,
      toggleLang: () => setLang(lang === 'ar' ? 'en' : 'ar'),
    };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Access the current language and the `t()` helper. */
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside <I18nProvider>.');
  return context;
}
