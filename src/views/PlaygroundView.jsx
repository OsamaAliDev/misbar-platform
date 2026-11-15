import FlatIllustration from '../components/FlatIllustration.jsx';
import PlaceholderPanel from '../components/PlaceholderPanel.jsx';
import { getExperimentById } from '../data/experiments.js';
// Reuses the card's illustration-box style for the preview.
import '../components/ExperimentCard.css';

/**
 * <PlaygroundView /> — placeholder for the interactive lab.
 *
 * Batch 2 replaces the panel with the real simulation Playground. The route
 * (#/playground/<experimentId>) and the experiment lookup are already final.
 *
 * @param {object}   props
 * @param {string}   props.experimentId
 * @param {Function} props.onBack  returns to the catalog
 */
export default function PlaygroundView({ experimentId, onBack }) {
  const experiment = getExperimentById(experimentId);

  if (!experiment) {
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

  return (
    <PlaceholderPanel
      eyebrowIcon="science"
      eyebrow="ساحة التجارب"
      title={experiment.title}
      message="المعمل التفاعلي للتجربة دي بيتجهّز دلوقتي، وقريباً هتقدر تحرّك وتجرّب وتكتشف بنفسك!"
      onBack={onBack}
    >
      <div className="experiment-card__art placeholder-panel__preview">
        <FlatIllustration
          viewBox={experiment.illustration.viewBox}
          shapes={experiment.illustration.shapes}
          label={experiment.illustration.label}
        />
      </div>
    </PlaceholderPanel>
  );
}
