import { useI18n } from '../i18n/index.jsx';
import { formatNumber } from '../lib/arabic.js';
import './Fraction.css';

/**
 * <Fraction /> — a stacked fraction (numerator over denominator).
 *
 * Stacking avoids any right-to-left ambiguity of an inline "٣/٤" and matches
 * how fractions are written in Egyptian school books. Screen readers hear
 * "٣ على ٤".
 *
 * @param {object} props
 * @param {number} props.numerator
 * @param {number} props.denominator
 * @param {'sm' | 'md'} [props.size='md']
 */
export default function Fraction({ numerator, denominator, size = 'md' }) {
  const { t } = useI18n();

  return (
    <span
      className={`fraction fraction--${size}`}
      role="img"
      aria-label={t('lab.fraction.spoken', { numerator, denominator })}
    >
      <span className="fraction__numerator" aria-hidden="true">
        {formatNumber(numerator)}
      </span>
      <span className="fraction__denominator" aria-hidden="true">
        {formatNumber(denominator)}
      </span>
    </span>
  );
}
