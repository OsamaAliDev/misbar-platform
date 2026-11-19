import { useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { STUDENT_STORAGE_KEY } from '../state/student.jsx';
import Icon from '../components/Icon.jsx';
import './InfoPage.css';

/**
 * <InfoPage /> — one layout for the three standard static pages.
 *
 * @param {object}   props
 * @param {string}   props.page   'about' | 'help' | 'privacy'
 * @param {Function} props.onBack returns to the catalog
 */

/* Sections rendered for each page, in order; `help.reset` adds a button. */
const PAGES = {
  about: ['mission', 'method', 'content'],
  help: ['steps', 'stars', 'settings', 'reset'],
  privacy: ['noCollect', 'storage', 'children', 'contact'],
};

export default function InfoPage({ page, onBack }) {
  const { t } = useI18n();
  const [resetState, setResetState] = useState('idle');
  const [confirming, setConfirming] = useState(false);

  const resetProgress = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    try {
      localStorage.removeItem(STUDENT_STORAGE_KEY);
    } catch {
      /* storage disabled: nothing to reset anyway */
    }
    setConfirming(false);
    setResetState('done');
    // The profile is gone: return to hero selection on a clean reload.
    setTimeout(() => window.location.reload(), 900);
  };

  return (
    <article className="info-page">
      <header className="info-page__header">
        <h1 id="view-heading" className="info-page__title" tabIndex={-1}>{t(`site.${page}.title`)}</h1>
        <p className="info-page__subtitle">{t(`site.${page}.subtitle`)}</p>
      </header>

      {PAGES[page].map((section) => (
        <section className="card info-page__section" key={section} aria-labelledby={`info-${page}-${section}`}>
          <h2 id={`info-${page}-${section}`} className="info-page__section-title">
            {t(`site.${page}.${section}.heading`)}
          </h2>
          <p className="info-page__body">{t(`site.${page}.${section}.body`)}</p>
          {page === 'help' && section === 'reset' && (
            <div className="info-page__action">
              {resetState === 'done' ? (
                <p className="info-page__done" role="status">
                  <Icon name="check_circle" size={18} />
                  {t('site.help.resetDone')}
                </p>
              ) : (
                <button
                  type="button"
                  className={`btn ${confirming ? 'btn--primary' : 'btn--neutral'}`}
                  onClick={resetProgress}
                  aria-describedby="reset-warning"
                >
                  <Icon name="restart_alt" size={18} />
                  {confirming ? t('site.help.resetConfirm') : t('site.help.resetButton')}
                </button>
              )}
              <span id="reset-warning" className="visually-hidden">{t('site.help.resetConfirm')}</span>
            </div>
          )}
        </section>
      ))}

      <div className="info-page__back">
        <button type="button" className="btn btn--primary" onClick={onBack}>
          <Icon name="arrow_forward" size={20} className="icon--dir" />
          <span>{t('app.back')}</span>
        </button>
      </div>
    </article>
  );
}
