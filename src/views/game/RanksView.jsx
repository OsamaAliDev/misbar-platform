import Icon from '../../components/Icon.jsx';
import ProgressBar from '../../components/ProgressBar.jsx';
import { getRankProgress, RANKS } from '../../config/game.js';
import { useI18n } from '../../i18n/index.jsx';
import { formatNumber } from '../../lib/arabic.js';
import { useStudent } from '../../state/student.jsx';
import './game.css';
import './RanksView.css';

/**
 * <RanksView /> — "سلّم الرتب" (#/ranks).
 *
 * The five discovery ranks from src/config/game.js, driven by the total
 * star count. The list is in ascending order for screen readers and drawn
 * as a ladder (highest rank on top) with CSS.
 */
export default function RanksView() {
  const { t } = useI18n();
  const { student } = useStudent();
  const { rank: current, nextRank, remaining } = getRankProgress(student.stars);

  return (
    <div className="game-page ranks">
      <div className="game-page__head">
        <h1 id="view-heading" className="game-page__title" tabIndex={-1}>
          {t('game.ranks.title')}
        </h1>
        <p className="game-page__subtitle">{t('game.ranks.subtitle')}</p>
      </div>

      <ol className="ranks__ladder" aria-label={t('game.ranks.ladderLabel')}>
        {RANKS.map((rank, index) => {
          const reached = student.stars >= rank.minStars;
          const isCurrent = rank.id === current.id;
          const copy = t(`game.ranks.items.${rank.id}`);
          const next = RANKS[index + 1];
          const stateClass = isCurrent ? 'is-current' : reached ? 'is-reached' : 'is-locked';

          return (
            <li key={rank.id} className={`card rank-step ${stateClass}`} aria-current={isCurrent ? 'step' : undefined}>
              <span className={`rank-step__icon rank-step__icon--${reached ? rank.tone : 'locked'}`} aria-hidden="true">
                <Icon name={reached ? rank.icon : 'lock'} size={26} filled={!reached} />
              </span>

              <div className="rank-step__body">
                <div className="rank-step__head">
                  <h2 className="rank-step__name">{copy.name}</h2>
                  <span className="rank-step__from">
                    <Icon name="star" filled size={16} />
                    {t('game.ranks.from', { stars: formatNumber(rank.minStars) })}
                  </span>
                </div>
                <p className="rank-step__text">{copy.description}</p>

                {isCurrent && next ? (
                  <div className="rank-step__progress">
                    <ProgressBar
                      value={student.stars - rank.minStars}
                      max={next.minStars - rank.minStars}
                      label={t('game.lobby.rankProgressLabel')}
                      valueText={t('game.lobby.toNextRank', {
                        stars: t('common.starCount', { count: remaining }),
                        rank: t(`game.ranks.items.${nextRank.id}.name`),
                      })}
                    />
                    <p className="rank-step__hint">
                      {t('game.lobby.toNextRank', {
                        stars: t('common.starCount', { count: remaining }),
                        rank: t(`game.ranks.items.${nextRank.id}.name`),
                      })}
                    </p>
                  </div>
                ) : null}
                {isCurrent && !next ? <p className="rank-step__hint">{t('game.lobby.topRank')}</p> : null}
              </div>

              <span className="rank-step__status">
                {isCurrent ? (
                  <span className="badge badge--primary">{t('game.ranks.current')}</span>
                ) : reached ? (
                  <span className="badge badge--reward">
                    <Icon name="check" size={16} />
                    {t('game.ranks.reached')}
                  </span>
                ) : (
                  <span className="badge rank-step__needs">
                    {t('game.ranks.needs', { stars: t('common.starCount', { count: rank.minStars }) })}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
