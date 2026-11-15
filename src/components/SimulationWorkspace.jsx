import { useSimulation } from '../simulations/SimulationContext.js';
import Icon from './Icon.jsx';
import ResultStrip from './ResultStrip.jsx';
import './SimulationWorkspace.css';

/**
 * <SimulationWorkspace /> — the Playground's two-column workspace, shared by
 * all six simulations (Stitch Playground screens `_3` desktop / `_2` mobile).
 *
 *   ┌───────────────── stage column ─────────────────┐┌── controls card ──┐
 *   │ dot + lab title                  status chip   ││ أدوات التحكم …    │
 *   │ animated SVG stage (white, 2px outline, 20px)  ││ purple controls   │
 *   └────────────────────────────────────────────────┘│                   │
 *   ┌ النتيجة المباشرة (cyan live readings) ─────────┐│ تشغيل | إعادة ضبط │
 *   └────────────────────────────────────────────────┘└───────────────────┘
 *
 * RTL: the controls card is the first grid column, so it sits on the right.
 * Below 768px the columns stack: stage → readings → controls.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.controls  the experiment's controls
 * @param {import('react').ReactNode} props.stage     the experiment's <svg>
 * @param {{ tone: string, icon: string, text: string } | null} [props.status]
 * @param {object[]} props.readings  see <ResultStrip />
 *
 * The stage label (e.g. "معمل مِسبار الفيزيائي") comes from the Playground
 * through the simulation context.
 */
export default function SimulationWorkspace({ controls, stage, status, readings }) {
  const { labTitle, running, toggleRunning, reset } = useSimulation();

  return (
    <div className="sim-workspace">
      <section className="card sim-controls" aria-labelledby="sim-controls-title">
        <div className="sim-controls__head">
          <span className="sim-controls__icon" aria-hidden="true">
            <Icon name="tune" size={20} />
          </span>
          <h2 id="sim-controls-title" className="sim-controls__title">
            أدوات التحكم في التجربة
          </h2>
        </div>

        <div className="sim-controls__body">{controls}</div>

        <div className="sim-controls__actions">
          <button type="button" className="btn btn--primary sim-controls__play" onClick={toggleRunning}>
            <Icon name={running ? 'pause' : 'play_arrow'} filled size={22} />
            <span>{running ? 'إيقاف مؤقت' : 'تشغيل'}</span>
          </button>
          <button type="button" className="btn btn--neutral sim-controls__reset" onClick={reset}>
            <Icon name="restart_alt" size={20} />
            <span>إعادة ضبط</span>
          </button>
        </div>
      </section>

      <section className="sim-stage-column" aria-label="منطقة التجربة">
        <div className="sim-stage">
          <div className="sim-stage__bar">
            <span className="sim-stage__lab">
              <span className="sim-stage__dot" aria-hidden="true" />
              {labTitle}
            </span>
            {status ? (
              <span className={`badge badge--${status.tone} sim-stage__status`} role="status">
                <Icon name={status.icon} size={16} />
                <span>{status.text}</span>
              </span>
            ) : null}
          </div>
          <div className="sim-stage__canvas">{stage}</div>
        </div>
        <ResultStrip readings={readings} />
      </section>
    </div>
  );
}
