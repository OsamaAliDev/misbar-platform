import './ProgressBar.css';

/**
 * <ProgressBar /> — flat progress track (rank and mission progress).
 * The fill grows from the inline-start edge, so it runs right→left in
 * Arabic and left→right in English without any extra code.
 *
 * @param {object} props
 * @param {number} props.value
 * @param {number} props.max
 * @param {string} props.label             accessible name
 * @param {string} [props.valueText]       spoken value, e.g. "٣ من ٥"
 * @param {'reward' | 'primary' | 'info'} [props.tone='reward']
 * @param {string} [props.className]
 */
export default function ProgressBar({ value, max, label, valueText, tone = 'reward', className = '' }) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <div
      className={`progress-bar progress-bar--${tone} ${className}`.trim()}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      aria-valuetext={valueText}
    >
      <span className="progress-bar__fill" style={{ inlineSize: `${ratio * 100}%` }} />
    </div>
  );
}
