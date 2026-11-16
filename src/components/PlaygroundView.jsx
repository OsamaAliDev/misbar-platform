import ThemeToggle from './ThemeToggle.jsx';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getCategory, getExperimentById } from '../data/experiments.js';
import { getGuide } from '../data/guides.js';
import { formatNumber, formatStarCount } from '../lib/arabic.js';
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
 *   ┌ header ─ back · title · category ─────────── stars · محتاج مساعدة؟ ┐
 *   ├ workspace ─ controls card │ simulation stage + live result strip ──┤
 *   └ Nour's challenge & tip bar ─────────────────────────────────────────┘
 *
 * One layout serves all six experiments; the experiment-specific parts come
 * from the simulation registry (src/simulations) and Nour's guides
 * (src/data/guides.js).
 *
 * @param {object}   props
 * @param {string}   props.experimentId
 * @param {Function} props.onBack  returns to the catalog
 */
export default function PlaygroundView({ experimentId, onBack }) {
  const experiment = getExperimentById(experimentId);
  const simulation = getSimulation(experimentId);
  const guide = getGuide(experimentId);

  if (!experiment || !simulation || !guide) {
    return (
      <PlaceholderPanel
        eyebrowIcon="science"
        eyebrow="ساحة التجارب"
        title="التجربة دي مش موجودة"
        message="يمكن الرابط اتغيّر. ارجع للمكتبة واختار تجربة تانية."
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

      <ChallengeBar experimentId={experiment.id} challenge={guide.challenge} met={challengeMet} />

      <SimulationContext.Provider value={simulationContext}>
        <Simulation key={resetKey} />
      </SimulationContext.Provider>


      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} experimentTitle={experiment.title} guide={guide} />
    </div>
  );
}

/**
 * Playground header.
 * Start (right): back button, experiment title, category pill.
 * End (left):    live star counter, coral "محتاج مساعدة؟" button.
 */
function PlaygroundHeader({ experiment, onBack, onOpenHelp }) {
  const { student } = useStudent();
  const category = getCategory(experiment.category);

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
        <button type="button" className="btn btn--neutral btn--icon playground-header__back" onClick={onBack} aria-label="العودة للمكتبة">
          <Icon name="arrow_forward" size={24} />
        </button>
        <div className="playground-header__titles">
          <h1 id="view-heading" className="playground-header__title" tabIndex={-1}>
            {experiment.title}
          </h1>
          <span className={`badge badge--${category.tone} playground-header__category`}>
            <Icon name={experiment.badgeIcon} size={16} />
            {category.label}
          </span>
        </div>
      </div>

      <div className="playground-header__end">
        <ThemeToggle />
        <div
          className={`star-counter ${bumping ? 'is-bumping' : ''}`.trim()}
          role="status"
          aria-label={`رصيدك: ${formatStarCount(student.stars)}`}
        >
          <Icon name="star" filled size={22} />
          <span aria-hidden="true">{`${formatNumber(student.stars)} نجمة`}</span>
        </div>
        <button type="button" className="btn btn--help playground-header__help" onClick={onOpenHelp} aria-haspopup="dialog">
          <Icon name="help" size={22} />
          <span>محتاج مساعدة؟</span>
        </button>
      </div>
    </header>
  );
}
