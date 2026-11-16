import Avatar from '../../components/Avatar.jsx';
import HeroAvatar from '../../components/HeroAvatar.jsx';
import Icon from '../../components/Icon.jsx';
import MissionCard from '../../components/MissionCard.jsx';
import ProgressBar from '../../components/ProgressBar.jsx';
import { getRankProgress, MISSIONS } from '../../config/game.js';
import { HERO_IMAGE_SIZE } from '../../data/heroes.js';
import { useI18n } from '../../i18n/index.jsx';
import { formatNumber } from '../../lib/arabic.js';
import { useGuide, useHeroLine } from '../../state/guide.js';
import { buildHash, VIEWS } from '../../state/navigation.jsx';
import { useStudent } from '../../state/student.jsx';
import './game.css';
import './LobbyView.css';

/**
 * <LobbyView /> — "ساحة الأبطال" (#/lobby).
 *
 *   ┌ hero stage (chosen hero, large) ┐ ┌ greeting + hero's speech bubble ┐
 *   │ name · title · change hero      │ │ stars │ rank + progress         │
 *   └─────────────────────────────────┘ │ missions (3)                     │
 *                                       │ [ادخل مكتبة التجارب]  [الأزياء] │
 *                                       └──────────────────────────────────┘
 *
 * @param {object}   props
 * @param {Function} props.onEnterLibrary  opens the experiment catalog
 */
export default function LobbyView({ onEnterLibrary }) {
  const { t } = useI18n();
  const { student } = useStudent();
  const { hero, name, title } = useGuide();
  const encourage = useHeroLine(hero.id, 'encourage');

  const { rank, nextRank, remaining } = getRankProgress(student.stars);
  const rankName = t(`game.ranks.items.${rank.id}.name`);
  const span = nextRank ? nextRank.minStars - rank.minStars : 1;
  const progressValue = nextRank ? student.stars - rank.minStars : 1;

  return (
    <div className="game-page lobby">
      <h1 id="view-heading" className="visually-hidden" tabIndex={-1}>
        {t('game.lobby.title')}
      </h1>

      <div className="lobby__grid">
        {/* -- The chosen hero -------------------------------------------- */}
        <section className="card lobby__hero" aria-labelledby="lobby-hero-name">
          <div className={`hero-stage hero-stage--${hero.tone} lobby__stage`}>
            <img
              className="hero-stage__img hero-idle"
              src={hero.image}
              width={HERO_IMAGE_SIZE.width}
              height={HERO_IMAGE_SIZE.height}
              loading="lazy"
              decoding="async"
              alt={`${name} · ${title}`}
            />
          </div>
          <div className="lobby__hero-info">
            <span className={`badge badge--${hero.tone}`}>
              <Icon name={hero.icon} size={16} />
              {t('game.lobby.guideLabel')}
            </span>
            <h2 id="lobby-hero-name" className="lobby__hero-name">
              {name}
            </h2>
            <p className="lobby__hero-title">{title}</p>
            <a className="btn btn--neutral lobby__change" href={buildHash(VIEWS.HEROES)}>
              <Icon name="groups" size={20} />
              <span>{t('game.lobby.changeHero')}</span>
            </a>
          </div>
        </section>

        <div className="lobby__side">
          {/* -- Greeting ------------------------------------------------- */}
          <section className="card lobby__welcome" aria-labelledby="lobby-greeting">
            <div className="lobby__student">
              <Avatar avatarId={student.avatarId} size={48} />
              <h2 id="lobby-greeting" className="lobby__greeting">
                {t('game.lobby.greeting', { nickname: student.nickname })}
              </h2>
            </div>
            <div className="lobby__guide">
              <HeroAvatar hero={hero} size={52} />
              <p className="speech-bubble lobby__bubble">{encourage}</p>
            </div>
          </section>

          {/* -- Stars & rank --------------------------------------------- */}
          <div className="lobby__stats">
            <section className="card lobby__stat lobby__stat--stars" aria-labelledby="lobby-stars-label">
              <span className="lobby__stat-icon lobby__stat-icon--reward" aria-hidden="true">
                <Icon name="star" filled size={28} />
              </span>
              <div className="lobby__stat-text">
                <h2 id="lobby-stars-label" className="lobby__stat-label">
                  {t('game.lobby.starsLabel')}
                </h2>
                <p className="lobby__stat-value">{formatNumber(student.stars)}</p>
              </div>
            </section>

            <section className="card lobby__stat lobby__stat--rank" aria-labelledby="lobby-rank-label">
              <div className="lobby__rank-head">
                <span className={`lobby__stat-icon lobby__stat-icon--${rank.tone}`} aria-hidden="true">
                  <Icon name={rank.icon} size={26} />
                </span>
                <div className="lobby__stat-text">
                  <h2 id="lobby-rank-label" className="lobby__stat-label">
                    {t('game.lobby.rankLabel')}
                  </h2>
                  <p className="lobby__rank-name">{rankName}</p>
                </div>
              </div>
              <ProgressBar
                value={progressValue}
                max={span}
                label={t('game.lobby.rankProgressLabel')}
                valueText={
                  nextRank
                    ? t('game.lobby.toNextRank', {
                        stars: t('common.starCount', { count: remaining }),
                        rank: t(`game.ranks.items.${nextRank.id}.name`),
                      })
                    : t('game.lobby.topRank')
                }
              />
              <p className="lobby__rank-next">
                {nextRank
                  ? t('game.lobby.toNextRank', {
                      stars: t('common.starCount', { count: remaining }),
                      rank: t(`game.ranks.items.${nextRank.id}.name`),
                    })
                  : t('game.lobby.topRank')}
              </p>
              <a className="lobby__link" href={buildHash(VIEWS.RANKS)}>
                <span>{t('game.lobby.allRanks')}</span>
                <Icon name="chevron_left" size={20} className="icon--dir" />
              </a>
            </section>
          </div>

          {/* -- Missions -------------------------------------------------- */}
          <section className="lobby__missions" aria-labelledby="lobby-missions-title">
            <div className="lobby__missions-head">
              <h2 id="lobby-missions-title" className="game-section-title">
                {t('game.lobby.missionsTitle')}
              </h2>
              <p className="lobby__missions-hint">{t('game.lobby.missionsHint')}</p>
            </div>
            <ul className="lobby__mission-list">
              {MISSIONS.map((mission) => (
                <MissionCard key={mission.id} mission={mission} />
              ))}
            </ul>
          </section>

          {/* -- Actions --------------------------------------------------- */}
          <div className="lobby__actions">
            <button type="button" className="btn btn--primary lobby__enter" onClick={onEnterLibrary}>
              <Icon name="science" size={22} />
              <span>{t('game.lobby.enterLibrary')}</span>
            </button>
            <a className="btn btn--neutral lobby__vault" href={buildHash(VIEWS.VAULT)}>
              <Icon name="checkroom" size={20} className="lobby__vault-icon" />
              <span>{t('game.lobby.vaultLink')}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
