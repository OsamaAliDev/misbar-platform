/**
 * Flat SVG arrows for force, velocity and light-ray diagrams.
 * Colours are palette tokens (see token() in simulationUtils.js).
 */

/**
 * Points of a triangular arrow head whose tip is at (x, y).
 * @param {number} x
 * @param {number} y
 * @param {number} angle  direction the arrow points to, in radians
 * @param {number} size   head length in SVG units
 * @returns {string} SVG `points` attribute
 */
export function arrowHeadPoints(x, y, angle, size) {
  const spread = 0.5; // ≈ 28° each side
  const left = [x - size * Math.cos(angle - spread), y - size * Math.sin(angle - spread)];
  const right = [x - size * Math.cos(angle + spread), y - size * Math.sin(angle + spread)];
  return `${x},${y} ${left[0]},${left[1]} ${right[0]},${right[1]}`;
}

/**
 * <SvgArrow /> — a straight arrow from (x1, y1) to (x2, y2).
 * Renders nothing when the arrow is too short to read.
 */
export function SvgArrow({ x1, y1, x2, y2, color, width = 5, headSize, opacity = 1 }) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  if (length < 4) return null;

  const angle = Math.atan2(dy, dx);
  const head = Math.min(headSize ?? 10 + width * 1.4, length);
  // Stop the shaft at the base of the head so the tip stays sharp.
  const shaftEndX = x2 - (head * 0.8) * Math.cos(angle);
  const shaftEndY = y2 - (head * 0.8) * Math.sin(angle);

  return (
    <g style={{ opacity }}>
      <line
        x1={x1}
        y1={y1}
        x2={shaftEndX}
        y2={shaftEndY}
        style={{ stroke: color, strokeWidth: width, strokeLinecap: 'round' }}
      />
      <polygon points={arrowHeadPoints(x2, y2, angle, head)} style={{ fill: color }} />
    </g>
  );
}
