import { getCategory } from '../data/experiments.js';
import { formatNumber } from '../lib/arabic.js';
import FlatIllustration from './FlatIllustration.jsx';
import Icon from './Icon.jsx';
import './ExperimentCard.css';

/** Highest challenge level an experiment can have. */
const MAX_STARS = 3;

/**
 * <ExperimentCard /> — one experiment in the catalog (Stitch Catalog card).
 *
 * Layout (top → bottom): category badge + challenge stars, flat SVG
 * illustration box, title, short description, full-width "ابدأ التجربة".
 *
 * @param {object}   props
 * @param {object}   props.experiment  item from src/data/experiments.js
 * @param {Function} props.onStart     called with the experiment id
 */
export default function ExperimentCard({ experiment, onStart }) {
  const category = getCategory(experiment.category);
  const titleId = `experiment-title-${experiment.id}`;

  return (
    <article className="card experiment-card" aria-labelledby={titleId}>
      <div className="experiment-card__meta">
        <span className={`badge badge--${category.tone}`}>
          <Icon name={experiment.badgeIcon} size={16} />
          {category.label}
        </span>

        <span
          className="experiment-card__stars"
          role="img"
          aria-label={`مستوى التحدي: ${formatNumber(experiment.stars)} من ${formatNumber(MAX_STARS)}`}
        >
          {Array.from({ length: MAX_STARS }, (_, index) => (
            <Icon
              key={index}
              name="star"
              filled
              size={18}
              className={index < experiment.stars ? 'is-earned' : 'is-empty'}
            />
          ))}
        </span>
      </div>

      <div className="experiment-card__art">
        <FlatIllustration
          viewBox={experiment.illustration.viewBox}
          shapes={experiment.illustration.shapes}
          label={experiment.illustration.label}
        />
      </div>

      <h2 id={titleId} className="experiment-card__title">
        {experiment.title}
      </h2>
      <p className="experiment-card__description">{experiment.description}</p>

      <button
        type="button"
        className="btn btn--primary btn--block experiment-card__cta"
        aria-describedby={titleId}
        onClick={() => onStart(experiment.id)}
      >
        <span>ابدأ التجربة</span>
        <Icon name="play_arrow" filled size={20} />
      </button>
    </article>
  );
}
