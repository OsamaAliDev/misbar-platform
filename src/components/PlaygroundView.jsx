import { AccountLink, SaasNotice } from './SaasChrome.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import LanguageToggle from './LanguageToggle.jsx';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getCategory, getCategoryLabel, getExperimentById, getExperimentCopy } from '../data/experiments.js';
import { useI18n } from '../i18n/index.jsx';
import { getSimulation } from '../simulations/index.js';
import { SimulationContext } from '../simulations/SimulationContext.js';
import { useStudent } from '../state/student.jsx';
import ChallengeBar from './ChallengeBar.jsx';
import HelpModal from './HelpModal.jsx';
import Icon from './Icon.jsx';
import PlaceholderPanel from './PlaceholderPanel.jsx';
import './PlaygroundView.css';

/**
 * <PlaygroundView /> — the unified interactive Playground (Stitch `_3` / `_2`).
 *
 *   ┌ header ─ back · title · category ─────────── stars · help ┐
 *   ├ guide hero's challenge & tip bar ────────────────────────┤
 *   └ workspace ─ controls │ simulation stage + live results ──┘
 *
 * One layout serves all six experiments; the experiment-specific parts come
 * from the simulation registry (src/simulations) and localized lab guides.
 *
 * @param {object}   props
 * @param {string}   props.experimentId
 * @param {Function} props.onBack  returns to the catalog
 */
export default function PlaygroundView({ experimentId, onBack }) {
  const { t } = useI18n();
  const experiment = getExperimentById(experimentId);
  const simulation = getSimulation(experimentId);
  const guide = experiment && simulation ? t(`lab.guides.${experimentId}`) : null;

  if (!experiment || !simulation || !guide || typeof guide !== 'object') {
    return (
      <PlaceholderPanel
        eyebrowIcon="science"
        eyebrow={t('lab.notFound.eyebrow')}
        title={t('lab.notFound.title')}
        message={t('lab.notFound.message')}
        onBack={onBack}
      />
    );
  }

  return <Playground experiment={experiment} simulation={simulation} guide={guide} onBack={onBack} />;
}

/** Respect the visitor's reduced-motion preference for auto-play. */
function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

function Playground({ experiment, simulation, guide, onBack }) {
  const { t } = useI18n();
  const copy = getExperimentCopy(t, experiment.id);
  const autoPlay = simulation.autoPlay && !prefersReducedMotion();
  const [running, setRunning] = useState(autoPlay);
  const [resetKey, setResetKey] = useState(0);
  const [challengeMet, setChallengeMet] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const toggleRunning = useCallback(() => setRunning((value) => !value), []);
  const reset = useCallback(() => {
    // Remounting the simulation restores its default parameters and state.
    setResetKey((key) => key + 1);
    setChallengeMet(false);
    setRunning(autoPlay);
  }, [autoPlay]);

  const simulationContext = useMemo(
    () => ({
      labTitle: guide.labTitle,
      running,
      setRunning,
      toggleRunning,
      reset,
      reportChallenge: setChallengeMet,
    }),
    [guide.labTitle, running, toggleRunning, reset],
  );

  const Simulation = simulation.Component;

  return (
    <div className="playground">
      <PlaygroundHeader experiment={experiment} onBack={onBack} onOpenHelp={() => setHelpOpen(true)} />

      <SaasNotice />
      <ChallengeBar experimentId={experiment.id} challenge={guide.challenge} met={challengeMet} />

      <SimulationContext.Provider value={simulationContext}>
        <Simulation key={resetKey} />
      </SimulationContext.Provider>

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} experimentTitle={copy.title} guide={guide} />
    </div>
  );
}

/**
 * Playground header.
 * Start: back button, experiment title, category pill.
 * End: preferences, live star counter, coral help button.
 */
function PlaygroundHeader({ experiment, onBack, onOpenHelp }) {
  const { t } = useI18n();
  const { student } = useStudent();
  const category = getCategory(experiment.category);
  const copy = getExperimentCopy(t, experiment.id);

  // Bump the star counter whenever a star is earned (not on first render).
  const [bumping, setBumping] = useState(false);
  const previousStars = useRef(student.stars);
  useEffect(() => {
    if (student.stars > previousStars.current) {
      setBumping(true);
      const timer = setTimeout(() => setBumping(false), 700);
      previousStars.current = student.stars;
      return () => clearTimeout(timer);
    }
    previousStars.current = student.stars;
    return undefined;
  }, [student.stars]);

  return (
    <header className="playground-header">
      <div className="playground-header__start">
        <button type="button" className="btn btn--neutral btn--icon playground-header__back" onClick={onBack} aria-label={t('lab.header.back')}>
          <Icon name="arrow_forward" size={24} className="icon--dir" />
        </button>
        <div className="playground-header__titles">
          <h1 id="view-heading" className="playground-header__title" tabIndex={-1}>
            {copy.title}
          </h1>
          <span className={`badge badge--${category.tone} playground-header__category`}>
            <Icon name={experiment.badgeIcon} size={16} />
            {getCategoryLabel(t, experiment.category)}
          </span>
        </div>
      </div>

      <div className="playground-header__end">
        <ThemeToggle />
        <AccountLink />
        <LanguageToggle />
        <div
          className={`star-counter ${bumping ? 'is-bumping' : ''}`.trim()}
          role="status"
          aria-label={t('common.starBalanceLabel', { count: student.stars })}
        >
          <Icon name="star" filled size={22} />
          <span aria-hidden="true">{t('common.starCount', { count: student.stars })}</span>
        </div>
        <button type="button" className="btn btn--help playground-header__help" onClick={onOpenHelp} aria-haspopup="dialog">
          <Icon name="help" size={22} />
          <span>{t('lab.header.help')}</span>
        </button>
      </div>
    </header>
  );
}
