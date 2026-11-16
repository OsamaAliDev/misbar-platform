import { useState } from 'react';
import HeroAvatar from '../../components/HeroAvatar.jsx';
import Icon from '../../components/Icon.jsx';
import { OUTFIT_SLOTS, outfitKey } from '../../config/game.js';
import { getHero, HERO_IMAGE_SIZE, HEROES } from '../../data/heroes.js';
import { useI18n } from '../../i18n/index.jsx';
import { formatNumber } from '../../lib/arabic.js';
import { useGuide } from '../../state/guide.js';
import { useStudent } from '../../state/student.jsx';
import './game.css';
import './VaultView.css';

/**
 * <VaultView /> — "خزانة الأزياء" (#/vault).
 *
 * Outfit 1 is every hero's current outfit. Slots 2–4 are locked placeholders
 * with a star cost; once the star total reaches the cost the student can
 * unlock the slot (stored in localStorage). Unlocking never spends stars, and
 * no new outfit art exists yet — an unlocked slot says the design is coming.
 */
export default function VaultView() {
  const { t } = useI18n();
  const { hero: guideHero } = useGuide();
  const [heroId, setHeroId] = useState(guideHero.id);
  const hero = getHero(heroId) ?? guideHero;
  const name = t(`heroes.${hero.id}.name`);

  return (
    <div className="game-page vault">
      <div className="game-page__head">
        <h1 id="view-heading" className="game-page__title" tabIndex={-1}>
          {t('game.vault.title')}
        </h1>
        <p className="game-page__subtitle">{t('game.vault.subtitle')}</p>
        <span className="badge badge--reward">
          <Icon name="info" size={16} />
          {t('game.vault.note')}
        </span>
      </div>

      {/* Which hero's outfits to show (native radios: arrow keys work). */}
      <fieldset className="vault__picker">
        <legend className="visually-hidden">{t('game.vault.heroPickerLabel')}</legend>
        {HEROES.map((item) => {
          const checked = item.id === hero.id;
          return (
            <label key={item.id} className={`vault__pick ${checked ? 'is-selected' : ''}`.trim()}>
              <input
                type="radio"
                name="vault-hero"
                value={item.id}
                checked={checked}
                onChange={() => setHeroId(item.id)}
                className="visually-hidden vault__pick-input"
              />
              <HeroAvatar hero={item} size={52} />
              <span className="vault__pick-name">{t(`heroes.${item.id}.name`)}</span>
            </label>
          );
        })}
      </fieldset>

      <ul className="vault__slots" aria-label={t('game.vault.slotsLabel', { name })}>
        {OUTFIT_SLOTS.map((slot) => (
          <OutfitSlot key={slot.slot} hero={hero} slot={slot} heroName={name} />
        ))}
      </ul>
    </div>
  );
}

/** One outfit slot: the starter outfit, a locked placeholder, or unlocked. */
function OutfitSlot({ hero, slot, heroName }) {
  const { t } = useI18n();
  const { student, unlockOutfit, canEarn, syncing } = useStudent();

  const isStarter = slot.cost === 0;
  const unlocked = isStarter || student.unlockedOutfits.includes(outfitKey(hero.id, slot.slot));
  const reachable = student.stars >= slot.cost;
  const missing = Math.max(0, slot.cost - student.stars);
  const slotName = t('game.vault.slotName', { slot: formatNumber(slot.slot) });
  const costText = t('common.starCount', { count: slot.cost });

  let stateClass = 'is-locked';
  if (isStarter) stateClass = 'is-starter';
  else if (unlocked) stateClass = 'is-unlocked';
  else if (reachable) stateClass = 'is-ready';

  return (
    <li className={`card outfit-slot ${stateClass}`}>
      {isStarter ? (
        <div className={`hero-stage hero-stage--${hero.tone} outfit-slot__art`}>
          <img
            className="hero-stage__img hero-idle"
            src={hero.image}
            width={HERO_IMAGE_SIZE.width}
            height={HERO_IMAGE_SIZE.height}
            loading="lazy"
            decoding="async"
            alt={`${heroName} · ${slotName}`}
          />
        </div>
      ) : (
        <div className="outfit-slot__art outfit-slot__placeholder" aria-hidden="true">
          <Icon name="checkroom" size={56} className="outfit-slot__hanger" />
          <span className="outfit-slot__lock">
            <Icon name={unlocked ? 'lock_open' : 'lock'} size={22} filled={!unlocked} />
          </span>
        </div>
      )}

      <div className="outfit-slot__body">
        <h2 className="outfit-slot__name">{slotName}</h2>

        {isStarter ? (
          <div className="outfit-slot__badges">
            <span className={`badge badge--${hero.tone}`}>{t('game.vault.starter')}</span>
            {student.heroId === hero.id ? (
              <span className="badge badge--primary">
                <Icon name="check" size={16} />
                {t('game.vault.wearing')}
              </span>
            ) : null}
          </div>
        ) : unlocked ? (
          <p className="outfit-slot__status outfit-slot__status--unlocked">
            <Icon name="lock_open" size={18} />
            {t('game.vault.unlocked')}
          </p>
        ) : (
          <>
            <span className="badge badge--reward outfit-slot__cost">
              <Icon name="star" filled size={16} />
              {t('game.vault.unlocksAt', { stars: costText })}
            </span>
            {reachable ? null : (
              <p className="outfit-slot__status">
                {t('game.vault.moreNeeded', { stars: t('common.starCount', { count: missing }) })}
              </p>
            )}
            <button
              type="button"
              className="btn outfit-slot__unlock"
              disabled={!reachable || !canEarn || syncing}
              onClick={() => unlockOutfit(hero.id, slot.slot)}
            >
              <Icon name="lock_open" size={20} />
              <span>{t('game.vault.unlock')}</span>
            </button>
          </>
        )}
      </div>
    </li>
  );
}
