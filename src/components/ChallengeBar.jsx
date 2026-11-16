import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { useGuide, useHeroLine } from '../state/guide.js';
import { useStudent } from '../state/student.jsx';
import HeroAvatar from './HeroAvatar.jsx';
import Icon from './Icon.jsx';
import './ChallengeBar.css';

/**
 * <ChallengeBar /> — the guide hero's challenge & tip bar above the workspace.
 *
 * The student's chosen hero (src/state/guide.js) speaks in a speech bubble:
 *   idle        the experiment tip              ("نصيحة <hero>: …")
 *   wrong       a gentle "wrong" line + the retry hint
 *   met/success a "celebrate" line + what to do / the success message
 *   completed   an "encourage" line (challenge already done)
 *
 * States:
 *   not met    blue  "تحقق من التحدي"      → pressing it shows the retry hint
 *   met        gold  "أتممت التجربة (+١ نجمة)" → awards +1 star (once per experiment)
 *   completed  disabled "تم إنجاز التحدي"   (remembered in localStorage)
 *
 * @param {object}  props
 * @param {string}  props.experimentId
 * @param {{ prompt: string, tip: string, retry: string, success: string }} props.challenge
 * @param {boolean} props.met  live condition reported by the simulation
 */
export default function ChallengeBar({ experimentId, challenge, met }) {
  const { t } = useI18n();
  const { student, completeChallenge, canEarn, syncing } = useStudent();
  const { hero, name } = useGuide();
  const completed = student.completedChallenges.includes(experimentId);
  /** null | 'retry' | 'success' */
  const [feedback, setFeedback] = useState(null);
  /** Counts presses so every press can pick a fresh hero line. */
  const [attempt, setAttempt] = useState(0);

  // A retry hint is stale as soon as the condition becomes true.
  useEffect(() => {
    if (met) setFeedback((current) => (current === 'retry' ? null : current));
  }, [met]);

  const handleClick = async () => {
    if (completed || syncing) return;
    setAttempt((count) => count + 1);
    if (met) {
      if (!canEarn) return;
      const saved = await completeChallenge(experimentId);
      if (saved) setFeedback('success');
    } else {
      setFeedback('retry');
    }
  };

  // What the hero says: a situation line (celebrate / encourage / wrong)
  // followed by the experiment-specific sentence.
  let situation = 'hint';
  let detail = challenge.tip;
  let messageTone = 'tip';
  if (feedback === 'success') {
    situation = 'celebrate';
    detail = challenge.success;
    messageTone = 'success';
  } else if (completed) {
    situation = 'encourage';
    detail = t('lab.challenge.completedDetail');
    messageTone = 'success';
  } else if (feedback === 'retry') {
    situation = 'wrong';
    detail = challenge.retry;
    messageTone = 'retry';
  } else if (met) {
    situation = 'celebrate';
    detail = t('lab.challenge.metDetail');
    messageTone = 'success';
  }
  const heroLine = useHeroLine(hero.id, situation, attempt);
  const lead = situation === 'hint' ? t('lab.challenge.tipLead', { name }) : heroLine;

  let button;
  if (completed) {
    button = (
      <button type="button" className="btn challenge-bar__btn challenge-bar__btn--done" disabled>
        <Icon name="check_circle" filled size={22} />
        <span>{t('lab.challenge.done')}</span>
      </button>
    );
  } else if (met) {
    button = (
      <button type="button" className="btn challenge-bar__btn challenge-bar__btn--claim" onClick={handleClick} disabled={syncing || (met && !canEarn)}>
        <Icon name="star" filled size={22} />
        <span>{t('lab.challenge.claim')}</span>
      </button>
    );
  } else {
    button = (
      <button type="button" className="btn btn--primary challenge-bar__btn" onClick={handleClick} disabled={syncing || (met && !canEarn)}>
        <Icon name="task_alt" size={22} />
        <span>{t('lab.challenge.check')}</span>
      </button>
    );
  }

  return (
    <section
      className={`challenge-bar ${completed || met ? 'is-achieved' : ''}`.trim()}
      aria-labelledby="challenge-title"
    >
      <span className="challenge-bar__mascot">
        <HeroAvatar hero={hero} size={60} />
      </span>
      <div className="challenge-bar__text">
        <h2 id="challenge-title" className="challenge-bar__title">
          <span className="badge badge--reward challenge-bar__label">
            <Icon name="emoji_events" size={16} />
            {t('lab.challenge.label', { name })}
          </span>
          <span className="challenge-bar__prompt">{challenge.prompt}</span>
        </h2>
        <p
          className={`speech-bubble challenge-bar__message challenge-bar__message--${messageTone}`}
          aria-live="polite"
        >
          <strong className="challenge-bar__lead">{lead}</strong> {detail}
        </p>
      </div>
      {button}
    </section>
  );
}
