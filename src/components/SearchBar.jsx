import { useId, useRef } from 'react';
import Icon from './Icon.jsx';
import './SearchBar.css';

/**
 * <SearchBar /> — real-time Arabic experiment search (controlled input).
 *
 * Filtering happens on every keystroke in the parent; this component only
 * reports the text. A clear button appears while there is text, and Escape
 * clears the field.
 *
 * @param {object}   props
 * @param {string}   props.value
 * @param {Function} props.onChange   receives the new text
 * @param {string}  [props.className]
 */
export default function SearchBar({ value, onChange, className = '' }) {
  const inputId = useId();
  const inputRef = useRef(null);

  const clear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && value) {
      event.preventDefault();
      clear();
    }
  };

  return (
    <div className={`search-bar ${className}`.trim()} role="search">
      <label htmlFor={inputId} className="visually-hidden">
        ابحث عن تجربة
      </label>
      <Icon name="search" size={22} className="search-bar__icon" />
      <input
        ref={inputRef}
        id={inputId}
        className="search-bar__input"
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        spellCheck="false"
        placeholder="ابحث عن تجربة..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      {value && (
        <button type="button" className="search-bar__clear" onClick={clear} aria-label="مسح البحث">
          <Icon name="close" size={20} />
        </button>
      )}
    </div>
  );
}
