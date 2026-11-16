import { getMissionStatus } from '../config/game.js';
import { useI18n } from '../i18n/index.jsx';
import { useStudent } from '../state/student.jsx';
import Icon from './Icon.jsx';
import ProgressBar from './ProgressBar.jsx';
import './MissionCard.css';

/**
 * <MissionCard /> — one mission in the lobby.
 *   in progress → progress bar + "لسه شغّالين"
 *   complete    → mustard "خُد النجوم" button (adds the reward once)
 *   claimed     → "اتسلّمت" check
 *
 * @param {object} props
 * @param {object} props.mission  entry from MISSIONS (src/config/game.js)
 */
export default function MissionCard({ mission }) {
  const { student, claimMission, canEarn, syncing } = useStudent();
  const { t } = useI18n();
  const status = getMissionStatus(mission, student);
  const copy = t(`game.missions.items.${mission.id}`);
  const progressText = t('common.progressOf', { value: status.value, goal: status.goal });
  const stateClass = status.claimed ? 'is-claimed' : status.complete ? 'is-complete' : '';

  return (
    <li className={`mission-card ${stateClass}`.trim()}>
      <span className="mission-card__icon" aria-hidden="true">
        <Icon name={status.claimed ? 'check_circle' : mission.icon} filled={status.claimed} size={24} />
      </span>
      <div className="mission-card__body">
        <h3 className="mission-card__title">{copy.title}</h3>
        <p className="mission-card__text">{copy.description}</p>
        <ProgressBar
          className="mission-card__progress"
          value={status.value}
          max={status.goal}
          label={`${t('game.missions.progressLabel')}: ${copy.title}`}
          valueText={progressText}
        />
        <p className="mission-card__meta">
          <span>{progressText}</span>
          <span className="mission-card__reward">
            <Icon name="star" filled size={16} />
            {t('game.missions.reward', { stars: t('common.starCount', { count: mission.reward }) })}
          </span>
        </p>
      </div>
      <div className="mission-card__action">
        {status.claimed ? (
          <span className="mission-card__chip mission-card__chip--done">
            <Icon name="check" size={18} />
            {t('game.missions.claimed')}
          </span>
        ) : status.complete ? (
          <button type="button" className="btn mission-card__claim" disabled={!canEarn || syncing} onClick={() => claimMission(mission.id)}>
            <Icon name="redeem" size={20} />
            <span>{t('game.missions.claim')}</span>
          </button>
        ) : (
          <span className="mission-card__chip">{t('game.missions.inProgress')}</span>
        )}
      </div>
    </li>
  );
}
