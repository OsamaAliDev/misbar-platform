/**
 * <Icon /> — a Material Symbols Outlined glyph.
 *
 * Icons are decorative (`aria-hidden`); the surrounding control must carry
 * the accessible text. Every icon name used in the app must also be listed in
 * the `icon_names` parameter of the font link in index.html (alphabetical).
 *
 * @param {object}  props
 * @param {string}  props.name       Material Symbols ligature, e.g. "star"
 * @param {boolean} [props.filled]   use the filled variant
 * @param {number}  [props.size=20]  glyph size in px
 * @param {string}  [props.className]
 */
export default function Icon({ name, filled = false, size = 20, className = '' }) {
  return (
    <span
      className={`icon ${filled ? 'icon--filled' : ''} ${className}`.trim()}
      style={{ '--icon-size': `${size}px` }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
