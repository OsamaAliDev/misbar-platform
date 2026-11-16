import { useI18n } from '../i18n/index.jsx';
import { NOUR_SRC } from '../lib/assets.js';
import Icon from './Icon.jsx';
import './PlaceholderPanel.css';

/**
 * <PlaceholderPanel /> — a clean "coming soon" view used until the real
 * Playground (Batch 2) and Dashboard (Batch 3) are built.
 *
 * @param {object}    props
 * @param {string}    props.eyebrowIcon   Material Symbols icon for the badge
 * @param {string}    props.eyebrow       small badge text above the title
 * @param {string}    props.title         view heading (receives focus on entry)
 * @param {string}    props.message       short explanation for the student
 * @param {Function}  props.onBack        returns to the catalog
 * @param {import('react').ReactNode} [props.children]  optional preview content
 */
export default function PlaceholderPanel({ eyebrowIcon, eyebrow, title, message, onBack, children }) {
  const { t } = useI18n();
  return (
    <section className="card placeholder-panel" aria-labelledby="view-heading">
      <img className="placeholder-panel__mascot" src={NOUR_SRC} alt="" width="112" height="112" />

      <div className="placeholder-panel__badges">
        <span className="badge badge--primary">
          <Icon name={eyebrowIcon} size={16} />
          {eyebrow}
        </span>
        <span className="badge badge--reward">{t('app.soon')}</span>
      </div>

      <h1 id="view-heading" className="placeholder-panel__title" tabIndex={-1}>
        {title}
      </h1>
      <p className="placeholder-panel__message">{message}</p>

      {children}

      <button type="button" className="btn btn--primary placeholder-panel__back" onClick={onBack}>
        {/* In RTL "forward" (→) points back toward the start of the page. */}
        <Icon name="arrow_forward" size={20} className="icon--dir" />
        <span>{t('app.back')}</span>
      </button>
    </section>
  );
}
