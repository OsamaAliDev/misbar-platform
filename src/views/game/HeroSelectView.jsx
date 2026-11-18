import { useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { HERO_IMAGE_SIZE, HEROES } from '../../data/heroes.js';
import { useI18n } from '../../i18n/index.jsx';
import { useStudent } from '../../state/student.jsx';
import './game.css';
import './HeroSelectView.css';

/**
 * <HeroSelectView /> — "اختار بطلك" (#/heroes).
 *
 * Five hero cards built on native radio inputs, so arrow keys, focus and
 * screen-reader semantics come from the browser. Picking a hero saves it
 * immediately (localStorage via the student state); the chosen hero becomes
 * the student's guide everywhere. First-time students land here.
 *
 * Motion is plain CSS only: every hero "breathes" (staggered), and the hero
 * that was just picked does one gentle bounce.
 *
 * @param {object}   props
 * @param {Function} props.onContinue  opens the lobby
 */
export default function HeroSelectView({ onContinue }) {
  const { t } = useI18n();
  const { student, chooseHero } = useStudent();
  /** Hero id that should play the one-time bounce. */
  const [bouncingId, setBouncingId] = useState(null);

  const selectedId = student.heroId;
  // Preview the first hero before a choice, without selecting or saving it.
  const featuredId = selectedId ?? HEROES[0].id;
  const selectedName = selectedId ? t(`heroes.${selectedId}.name`) : '';

  const handleChoose = (heroId) => {
    chooseHero(heroId);
    setBouncingId(heroId);
  };

  return (
    <div className="game-page hero-select">
      <div className="game-page__head">
        <span className="badge badge--reward">
          <Icon name="groups" size={16} />
          {t('game.heroSelect.eyebrow')}
        </span>
        <h1 id="view-heading" className="game-page__title" tabIndex={-1}>
          {t('game.heroSelect.title')}
        </h1>
        <p className="game-page__subtitle">{t('game.heroSelect.subtitle')}</p>
      </div>

      <fieldset className="hero-select__group">
        <legend className="visually-hidden">{t('game.heroSelect.groupLabel')}</legend>
        <ul className="hero-select__grid">
          {HEROES.map((hero, index) => {
            const checked = hero.id === selectedId;
            const name = t(`heroes.${hero.id}.name`);
            const featured = hero.id === featuredId;
            return (
              <li
                key={hero.id}
                className={`hero-select__item ${featured ? 'is-featured' : ''}`.trim()}
              >
                <label className={`hero-card ${checked ? 'is-selected' : ''}`.trim()}>
                  <input
                    type="radio"
                    name="hero"
                    value={hero.id}
                    checked={checked}
                    onChange={() => handleChoose(hero.id)}
                    className="hero-card__input"
                    aria-labelledby={`hero-${hero.id}-name`}
                    aria-describedby={`hero-${hero.id}-title hero-${hero.id}-bio`}
                  />
                  <span className={`hero-stage hero-stage--${hero.tone} hero-card__stage`}>
                    <img
                      className={`hero-stage__img ${bouncingId === hero.id ? 'hero-bounce' : 'hero-idle'}`}
                      style={{ animationDelay: bouncingId === hero.id ? '0s' : `${index * -0.7}s` }}
                      onAnimationEnd={() => setBouncingId((id) => (id === hero.id ? null : id))}
                      src={hero.image}
                      width={HERO_IMAGE_SIZE.width}
                      height={HERO_IMAGE_SIZE.height}
                      loading="eager"
                      decoding="async"
                      alt=""
                    />
                  </span>
                  <span className="hero-card__body">
                    <span id={`hero-${hero.id}-name`} className="hero-card__name">{name}</span>
                    <span
                      id={`hero-${hero.id}-title`}
                      className={`badge badge--${hero.tone} hero-card__title${featured ? '' : ' visually-hidden'}`}
                    >
                      <Icon name={hero.icon} size={16} />
                      {t(`heroes.${hero.id}.title`)}
                    </span>
                    <span
                      id={`hero-${hero.id}-bio`}
                      className={`hero-card__bio${featured ? '' : ' visually-hidden'}`}
                    >{t(`heroes.${hero.id}.bio`)}</span>
                  </span>
                  <span className="hero-card__check" aria-hidden="true">
                    <Icon name={checked ? 'check_circle' : 'radio_button_unchecked'} filled={checked} size={22} />
                    {checked ? t('game.heroSelect.chosen') : null}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="card hero-select__footer">
        <p className="hero-select__status" aria-live="polite">
          {selectedId ? t('game.heroSelect.saved', { name: selectedName }) : t('game.heroSelect.pickFirst')}
        </p>
        <button
          type="button"
          className="btn btn--primary hero-select__continue"
          disabled={!selectedId}
          onClick={onContinue}
        >
          <span>{selectedId ? t('game.heroSelect.continue', { name: selectedName }) : t('game.nav.lobby')}</span>
          <Icon name="arrow_back" size={22} className="icon--dir" />
        </button>
      </div>
    </div>
  );
}
