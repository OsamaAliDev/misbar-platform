/**
 * <FlatIllustration />
 * ---------------------------------------------------------------------------
 * Renders a flat SVG drawing described as data (see src/data/experiments.js
 * and src/data/avatars.js).
 *
 * `fill` / `stroke` values are names of locked CSS variables (without "--")
 * and are applied through `style` as `var(--name)`, so every drawing always
 * follows the design-system palette. Shapes with no `fill` are left unfilled.
 */

/** SVG elements a drawing is allowed to use. */
const ALLOWED_ELEMENTS = new Set([
  'circle',
  'ellipse',
  'line',
  'path',
  'polygon',
  'polyline',
  'rect',
  'text',
]);

/** Convert a palette token to a CSS value. */
function paint(token) {
  if (!token) return undefined;
  return token === 'none' ? 'none' : `var(--${token})`;
}

function renderShape(shape, index, texts) {
  const { el, fill, stroke, text, textKey, ...attributes } = shape;
  if (!ALLOWED_ELEMENTS.has(el)) return null;

  const Element = el;
  const style = { fill: paint(fill) ?? 'none', stroke: paint(stroke) };

  return (
    <Element key={index} style={style} {...attributes}>
      {el === 'text' ? (textKey ? texts[textKey] : text) : null}
    </Element>
  );
}

/**
 * @param {object}   props
 * @param {string}   props.viewBox   SVG viewBox, e.g. "0 0 280 88"
 * @param {object[]} props.shapes    ordered shape descriptions
 * @param {string}  [props.label]    accessible description; omit for decorative use
 * @param {object}  [props.texts]    localized text map for shapes with textKey
 * @param {string}  [props.className]
 */
export default function FlatIllustration({ viewBox, shapes, label, texts = {}, className = '' }) {
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true };

  return (
    <svg
      className={`flat-illustration ${className}`.trim()}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      {...a11y}
    >
      {shapes.map((shape, index) => renderShape(shape, index, texts))}
    </svg>
  );
}
