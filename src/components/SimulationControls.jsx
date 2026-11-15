import { useId } from 'react';
import { formatNumber } from '../lib/arabic.js';
import { roundToStep } from '../simulations/simulationUtils.js';
import Icon from './Icon.jsx';
import './SimulationControls.css';

/**
 * Simulation controls — the purple "tools" family (--accent-tools).
 * ---------------------------------------------------------------------------
 * Every simulation composes its own controls card from these primitives:
 *   <ControlSlider>        labelled range input with a live value pill
 *   <ControlToggle>        full-row switch (role="switch")
 *   <ControlChoice>        segmented choices / presets (aria-pressed)
 *   <ControlQuickActions>  quick action buttons (e.g. سخّن / برّد)
 */

/**
 * <ControlSlider /> — a native range input styled flat and purple.
 *
 * The filled part of the track is a separate pseudo-element sized with
 * `--fill` (0…1), so no CSS gradient is needed. In RTL the minimum sits on the
 * right, exactly like the native input.
 *
 * @param {object}   props
 * @param {string}   props.label
 * @param {number}   props.value
 * @param {number}   props.min
 * @param {number}   props.max
 * @param {number}   [props.step=1]
 * @param {string}   [props.unit]        appended to the value pill, e.g. "نيوتن"
 * @param {Function} [props.format]      number → string (Arabic digits by default)
 * @param {string}   [props.minLabel]    caption under the start of the track
 * @param {string}   [props.maxLabel]    caption under the end of the track
 * @param {string}   [props.swatch]      palette token of a colour dot that links
 *                                       the slider to an object on the stage
 * @param {Function} props.onChange      receives the new number
 */
export function ControlSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  format = formatNumber,
  minLabel,
  maxLabel,
  swatch,
  onChange,
}) {
  const id = useId();
  const ratio = max > min ? (value - min) / (max - min) : 0;
  const valueText = unit ? `${format(value)} ${unit}` : format(value);

  return (
    <div className="control control-slider">
      <div className="control__head">
        <label className="control__label" htmlFor={id}>
          {swatch ? (
            <span className="control__swatch" style={{ backgroundColor: `var(--${swatch})` }} aria-hidden="true" />
          ) : null}
          {label}
        </label>
        <output className="control-slider__value" htmlFor={id}>
          {valueText}
        </output>
      </div>
      <div className="control-slider__track" style={{ '--fill': ratio }}>
        <input
          id={id}
          className="control-slider__input"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-valuetext={valueText}
          onChange={(event) => onChange(roundToStep(Number(event.target.value), step))}
        />
      </div>
      <div className="control-slider__range" aria-hidden="true">
        <span>{minLabel ?? format(min)}</span>
        <span>{maxLabel ?? format(max)}</span>
      </div>
    </div>
  );
}

/**
 * <ControlToggle /> — a full-width switch row (matches the Stitch toggle pills).
 * The whole row is the button, so the touch target is large.
 *
 * @param {object}   props
 * @param {string}   props.label
 * @param {string}   [props.description]
 * @param {boolean}  props.checked
 * @param {Function} props.onChange  receives the new boolean
 */
export function ControlToggle({ label, description, checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`control-toggle ${checked ? 'is-on' : ''}`.trim()}
      onClick={() => onChange(!checked)}
    >
      <span className="control-toggle__text">
        <span className="control__label">{label}</span>
        {description ? <span className="control__hint">{description}</span> : null}
      </span>
      <span className="control-toggle__switch" aria-hidden="true">
        <span className="control-toggle__thumb" />
      </span>
    </button>
  );
}

/**
 * <ControlChoice /> — one-of-many buttons (media, presets …).
 *
 * @param {object}   props
 * @param {string}   props.label
 * @param {{ value: string, label: import('react').ReactNode, ariaLabel?: string, icon?: string }[]} props.options
 * @param {string}   [props.value]        currently selected value
 * @param {Function} [props.isSelected]   custom selection test (option → boolean)
 * @param {Function} props.onChange       receives (value, option)
 */
export function ControlChoice({ label, options, value, isSelected, onChange }) {
  const labelId = useId();

  return (
    <div className="control control-choice" role="group" aria-labelledby={labelId}>
      <span id={labelId} className="control__label">
        {label}
      </span>
      <div className="control-choice__options">
        {options.map((option) => {
          const selected = isSelected ? isSelected(option) : option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              className={`control-choice__btn ${selected ? 'is-selected' : ''}`.trim()}
              aria-pressed={selected}
              aria-label={option.ariaLabel}
              onClick={() => onChange(option.value, option)}
            >
              {option.icon ? <Icon name={option.icon} size={18} /> : null}
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * <ControlQuickActions /> — a row of purple quick-action buttons.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {{ id: string, label: string, icon?: string, disabled?: boolean, onClick: Function }[]} props.actions
 */
export function ControlQuickActions({ label, actions }) {
  const labelId = useId();

  return (
    <div className="control control-quick" role="group" aria-labelledby={labelId}>
      <span id={labelId} className="control__label">
        {label}
      </span>
      <div className="control-quick__row">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            className="btn btn--tools control-quick__btn"
            disabled={action.disabled}
            onClick={action.onClick}
          >
            {action.icon ? <Icon name={action.icon} size={20} /> : null}
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
