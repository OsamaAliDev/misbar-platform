import { useEffect, useRef } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { formatNumber } from '../lib/arabic.js';
import { useGuide, useHeroLine } from '../state/guide.js';
import HeroAvatar from './HeroAvatar.jsx';
import Icon from './Icon.jsx';
import './HelpModal.css';

/**
 * <HelpModal /> — "مساعدة <hero>" (Stitch Help Modal screen `_7`).
 *
 * The student's guide hero opens the modal with one of their "hint" lines
 * in a speech bubble (a new line each time the modal opens).
 *
 * Built on the native <dialog> element opened with showModal(): the browser
 * provides the focus trap, Escape to close, inert background and focus
 * return to the "محتاج مساعدة؟" button.
 *
 * @param {object}   props
 * @param {boolean}  props.open
 * @param {Function} props.onClose
 * @param {string}   props.experimentTitle
 * @param {{ intro: string, hints: string[], fact: string }} props.guide
 */
export default function HelpModal({ open, onClose, experimentTitle, guide }) {
  const { t } = useI18n();
  const dialogRef = useRef(null);
  const { hero, name } = useGuide();
  const hintLine = useHeroLine(hero.id, 'hint', open);
  const hintTitles = t('lab.help.hintTitles');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Clicks on the backdrop land on the <dialog> itself (the card fills it).
  const handleClick = (event) => {
    if (event.target === dialogRef.current) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="help-modal"
      aria-labelledby="help-modal-title"
      aria-describedby="help-modal-intro"
      onClose={onClose}
      onClick={handleClick}
    >
      <div className="help-modal__card">
        <header className="help-modal__header">
          <span className="help-modal__avatar">
            <HeroAvatar hero={hero} size={52} />
          </span>
          <div className="help-modal__heading">
            <h2 id="help-modal-title" className="help-modal__title">
              {t('lab.help.title', { name })}
            </h2>
            <p className="help-modal__subtitle">{experimentTitle}</p>
          </div>
          <button type="button" className="btn btn--neutral btn--icon help-modal__close" onClick={onClose} aria-label={t('lab.help.close')}>
            <Icon name="close" size={22} />
          </button>
        </header>

        <div className="help-modal__body">
          <div className="help-modal__guide">
            <HeroAvatar hero={hero} size={44} className="help-modal__guide-avatar" />
            <p className="speech-bubble help-modal__bubble">{hintLine}</p>
          </div>
          <p id="help-modal-intro" className="help-modal__intro">
            {guide.intro}
          </p>

          <ol className="help-steps">
            {guide.hints.map((hint, index) => (
              <li key={index} className="help-step">
                <span className="help-step__number" aria-hidden="true">
                  {formatNumber(index + 1)}
                </span>
                <div className="help-step__content">
                  <h3 className="help-step__title">{hintTitles[index]}</h3>
                  <p className="help-step__text">{hint}</p>
                </div>
              </li>
            ))}
          </ol>

          <aside className="help-fact" aria-label={t('lab.help.fact')}>
            <span className="help-fact__icon" aria-hidden="true">
              <Icon name="lightbulb" filled size={22} />
            </span>
            <div>
              <h3 className="help-fact__title">{t('lab.help.fact')}</h3>
              <p className="help-fact__text">{guide.fact}</p>
            </div>
          </aside>
        </div>

        <footer className="help-modal__footer">
          <button type="button" className="btn btn--primary btn--block" onClick={onClose}>
            <span>{t('lab.help.gotIt')}</span>
            <Icon name="science" size={22} />
          </button>
        </footer>
      </div>
    </dialog>
  );
}
