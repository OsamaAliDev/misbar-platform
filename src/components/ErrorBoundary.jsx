import { Component } from 'react';
import { translate, LANGUAGE_STORAGE_KEY } from '../i18n/index.jsx';
import { readJSON } from '../lib/storage.js';
import './ErrorBoundary.css';

/**
 * <ErrorBoundary /> — last-resort UI for rendering crashes.
 *
 * Progress lives in localStorage and survives a crash, which the message
 * says on purpose. The language of the fallback is read straight from
 * storage because the React tree may be too broken to use hooks.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Keep a console trace for developers; no external reporting exists.
    console.error('[misbar] render error', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    const lang = readJSON(LANGUAGE_STORAGE_KEY) === 'en' ? 'en' : 'ar';
    const t = (key) => translate(lang, key);
    return (
      <div className="error-boundary" role="alert" dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang}>
        <div className="card error-boundary__panel">
          <h1 className="error-boundary__title">{t('site.error.title')}</h1>
          <p className="error-boundary__message">{t('site.error.message')}</p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => window.location.reload()}
          >
            {t('site.error.retry')}
          </button>
        </div>
      </div>
    );
  }
}
