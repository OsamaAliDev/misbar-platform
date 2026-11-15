import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import './ResultStrip.css';

/** Readings must stay unchanged this long before they are announced. */
const ANNOUNCE_DELAY_MS = 1500;

/**
 * <ResultStrip /> — "النتيجة المباشرة", the cyan live readings strip that sits
 * directly under the simulation stage (--accent-info family).
 *
 * Accessibility: the visible values update every animation frame, so they are
 * not a live region themselves (that would flood screen readers). Instead a
 * visually hidden polite live region announces a one-line summary once the
 * readings have stayed unchanged for ANNOUNCE_DELAY_MS — i.e. after the
 * student changes a control, or when a moving simulation comes to rest.
 *
 * @param {object} props
 * @param {{
 *   id: string,
 *   label: string,
 *   value: import('react').ReactNode,
 *   unit?: string,
 *   isText?: boolean,
 *   spoken?: string,
 * }[]} props.readings
 *   `isText` renders a word value (e.g. "سائل") slightly smaller than numbers.
 *   `spoken` is the text announced for a non-text value (e.g. a <Fraction />).
 */
export default function ResultStrip({ readings }) {
  const summary = readings.map(readingSentence).join('، ');
  const announcement = useDebouncedAnnouncement(summary);

  return (
    <section className="result-strip" aria-labelledby="result-strip-title">
      <div className="result-strip__head">
        <span className="result-strip__icon" aria-hidden="true">
          <Icon name="bolt" size={20} />
        </span>
        <h2 id="result-strip-title" className="result-strip__title">
          النتيجة المباشرة
        </h2>
      </div>
      <dl className="result-strip__list">
        {readings.map((reading) => (
          <div key={reading.id} className="reading">
            <dt className="reading__label">{reading.label}</dt>
            <dd className={`reading__value ${reading.isText ? 'reading__value--text' : ''}`.trim()}>
              <span className="reading__number">{reading.value}</span>
              {reading.unit ? <span className="reading__unit">{reading.unit}</span> : null}
            </dd>
          </div>
        ))}
      </dl>
      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </section>
  );
}

/** "التسارع: ٤ م/ث²" — one reading as plain text. */
function readingSentence(reading) {
  const isPlain = typeof reading.value === 'string' || typeof reading.value === 'number';
  const value = isPlain ? String(reading.value) : (reading.spoken ?? '');
  return `${reading.label}: ${value}${reading.unit ? ` ${reading.unit}` : ''}`;
}

/**
 * Returns `text` once it has stayed the same for ANNOUNCE_DELAY_MS.
 * Nothing is announced for the initial readings shown when the lab opens.
 */
function useDebouncedAnnouncement(text) {
  const [announcement, setAnnouncement] = useState('');
  const initialText = useRef(text);

  useEffect(() => {
    if (text === initialText.current) return undefined;
    initialText.current = null; // from now on, every settled value is announced
    const timer = setTimeout(() => setAnnouncement(text), ANNOUNCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [text]);

  return announcement;
}
