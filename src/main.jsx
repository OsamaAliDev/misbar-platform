// Global design-system styles MUST be imported before any component so that
// component stylesheets come later in the cascade and can refine the base
// primitives (.btn, .card, :focus-visible …).
import './index.css';
import './App.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { I18nProvider, useI18n } from './i18n/index.jsx';
import { NavigationProvider } from './state/navigation.jsx';
import { ThemeProvider } from './state/theme.jsx';
import { StudentProvider } from './state/student.jsx';

/**
 * Re-mounts the app when the language changes, so every number, string and
 * mirrored layout is rebuilt for the new language in one pass. Student
 * progress and the current route live in the providers above and survive.
 */
function LocalizedApp() {
  const { lang } = useI18n();
  return <App key={lang} />;
}

/**
 * Entry point.
 *  - <I18nProvider>       language (ar | en), t() helper, <html lang dir>
 *  - <StudentProvider>    shared student profile (nickname, avatar, stars,
 *                         hero, missions, outfits) persisted in localStorage
 *  - <NavigationProvider> current view from the URL hash
 *  - <ErrorBoundary>      friendly fallback if any screen crashes
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <I18nProvider>
        <StudentProvider>
          <NavigationProvider>
            <ThemeProvider><LocalizedApp /></ThemeProvider>
          </NavigationProvider>
        </StudentProvider>
      </I18nProvider>
    </ErrorBoundary>
  </StrictMode>,
);
