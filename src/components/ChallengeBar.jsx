import { useEffect, useState } from 'react';
import { NOUR_SRC } from '../lib/assets.js';
import { useStudent } from '../state/student.jsx';
import Icon from './Icon.jsx';
import './ChallengeBar.css';

/**
 * <ChallengeBar /> — Nour's challenge & tip bar under the workspace.
 *
 * States:
 *   not met    blue  "تحقق من التحدي"      → pressing it shows Nour's retry hint
 *   met        gold  "أتممت التجربة (+١ نجمة)" → awards +1 star (once per experiment)
 *   completed  disabled "تم إنجاز التحدي"   (remembered in localStorage)
 *
 * @param {object}  props
 * @param {string}  props.experimentId
 * @param {{ prompt: string, tip: string, retry: string, success: string }} props.challenge
 * @param {boolean} props.met  live condition reported by the simulation
 */
export default function ChallengeBar({ experimentId, challenge, met }) {
  const { student, completeChallenge } = useStudent();
  const completed = student.completedChallenges.includes(experimentId);
  /** null | 'retry' | 'success' */
  const [feedback, setFeedback] = useState(null);

  // A retry hint is stale as soon as the condition becomes true.
  useEffect(() => {
    if (met) setFeedback((current) => (current === 'retry' ? null : current));
  }, [met]);

  const handleClick = () => {
    if (completed) return;
    if (met) {
      completeChallenge(experimentId);
      setFeedback('success');
    } else {
      setFeedback('retry');
    }
  };

  let message;
  let messageTone = 'tip';
  if (feedback === 'success') {
    message = challenge.success;
    messageTone = 'success';
  } else if (completed) {
    message = 'خلّصت التحدي ده وخدت نجمتك! كمّل جرّب براحتك واكتشف أكتر.';
    messageTone = 'success';
  } else if (feedback === 'retry') {
    message = challenge.retry;
    messageTone = 'retry';
  } else if (met) {
    message = 'ممتاز! وصلت للهدف، اضغط الزرار عشان تاخد نجمتك.';
    messageTone = 'success';
  } else {
    message = `نصيحة نُور: ${challenge.tip}`;
  }

  let button;
  if (completed) {
    button = (
      <button type="button" className="btn challenge-bar__btn challenge-bar__btn--done" disabled>
        <Icon name="check_circle" filled size={22} />
        <span>تم إنجاز التحدي</span>
      </button>
    );
  } else if (met) {
    button = (
      <button type="button" className="btn challenge-bar__btn challenge-bar__btn--claim" onClick={handleClick}>
        <Icon name="star" filled size={22} />
        <span>أتممت التجربة (+١ نجمة)</span>
      </button>
    );
  } else {
    button = (
      <button type="button" className="btn btn--primary challenge-bar__btn" onClick={handleClick}>
        <Icon name="task_alt" size={22} />
        <span>تحقق من التحدي</span>
      </button>
    );
  }

  return (
    <section
      className={`challenge-bar ${completed || met ? 'is-achieved' : ''}`.trim()}
      aria-labelledby="challenge-title"
    >
      <span className="challenge-bar__mascot">
        <img src={NOUR_SRC} alt="" width="56" height="56" />
      </span>
      <div className="challenge-bar__text">
        <h2 id="challenge-title" className="challenge-bar__title">
          <span className="badge badge--reward challenge-bar__label">
            <Icon name="emoji_events" size={16} />
            تحدي نُور
          </span>
          <span className="challenge-bar__prompt">{challenge.prompt}</span>
        </h2>
        <p className={`challenge-bar__message challenge-bar__message--${messageTone}`} aria-live="polite">
          {message}
        </p>
      </div>
      {button}
    </section>
  );
}
