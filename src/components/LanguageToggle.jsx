import { useLayoutEffect } from 'react';
import { useI18n } from '../i18n/index.jsx';
import './Preferences.css';

// Retained outside the language-keyed App; consumed only by the next toggle.
let refocusAfterSwitch = false;

export default function LanguageToggle() {
  const { lang, toggleLang } = useI18n();
  const target = lang === 'ar' ? 'en' : 'ar';
  useLayoutEffect(() => {
    if (!refocusAfterSwitch) return undefined;
    // Run after heading-focus effects; keep the flag during StrictMode replay.
    const frame = requestAnimationFrame(() => {
      document.getElementById('lang-toggle')?.focus({ preventScroll: true });
      refocusAfterSwitch = false;
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <button id="lang-toggle" type="button" className="btn btn--neutral preference-toggle" lang={target} dir={target === 'ar' ? 'rtl' : 'ltr'} onClick={() => { refocusAfterSwitch = true; toggleLang(); }}>
      {target === 'ar' ? 'العربية' : 'English'}
    </button>
  );
}
