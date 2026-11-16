/**
 * Geometric cartoon avatars
 * ---------------------------------------------------------------------------
 * Students pick a symbol instead of uploading a photo (no personal data).
 * Each avatar is pure flat geometry described as data and rendered by
 * <FlatIllustration /> on a 48×48 grid. Paint values are names of the locked
 * CSS variables in src/index.css (without the leading "--").
 *
 * `tone` selects the avatar's circular frame colour (.avatar--<tone>).
 */

/** Build the points of a regular five-pointed star polygon. */
function starPoints(cx, cy, outer, inner) {
  return Array.from({ length: 10 }, (_, i) => {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    return `${(cx + radius * Math.cos(angle)).toFixed(1)},${(cy + radius * Math.sin(angle)).toFixed(1)}`;
  }).join(' ');
}

export const AVATARS = [
  {
    id: 'rocket',
    tone: 'primary',
    shapes: [
      // Body
      { el: 'path', d: 'M24 7c6 5 8 13 7 23H17c-1-10 1-18 7-23z', fill: 'surface-card', stroke: 'accent-primary-soft-text', strokeWidth: 2, strokeLinejoin: 'round' },
      // Porthole
      { el: 'circle', cx: 24, cy: 19, r: 4, fill: 'accent-primary', stroke: 'accent-primary-soft-text', strokeWidth: 2 },
      // Fins
      { el: 'path', d: 'M17 23l-5 9 5-1z', fill: 'accent-primary', stroke: 'accent-primary-soft-text', strokeWidth: 2, strokeLinejoin: 'round' },
      { el: 'path', d: 'M31 23l5 9-5-1z', fill: 'accent-primary', stroke: 'accent-primary-soft-text', strokeWidth: 2, strokeLinejoin: 'round' },
      // Flame
      { el: 'path', d: 'M20 31l4 9 4-9z', fill: 'accent-reward', stroke: 'accent-reward-text', strokeWidth: 1.5, strokeLinejoin: 'round' },
    ],
  },
  {
    id: 'planet',
    tone: 'info',
    shapes: [
      { el: 'circle', cx: 24, cy: 24, r: 10, fill: 'accent-info', stroke: 'accent-info-text', strokeWidth: 2 },
      { el: 'ellipse', cx: 24, cy: 24, rx: 17, ry: 5, stroke: 'accent-info-text', strokeWidth: 2, transform: 'rotate(-20 24 24)' },
      { el: 'circle', cx: 37, cy: 12, r: 2.5, fill: 'surface-card', stroke: 'accent-info-text', strokeWidth: 1.5 },
    ],
  },
  {
    id: 'atom',
    tone: 'tools',
    shapes: [
      { el: 'ellipse', cx: 24, cy: 24, rx: 16, ry: 6, stroke: 'accent-tools-text', strokeWidth: 2 },
      { el: 'ellipse', cx: 24, cy: 24, rx: 16, ry: 6, stroke: 'accent-tools-text', strokeWidth: 2, transform: 'rotate(60 24 24)' },
      { el: 'ellipse', cx: 24, cy: 24, rx: 16, ry: 6, stroke: 'accent-tools-text', strokeWidth: 2, transform: 'rotate(120 24 24)' },
      { el: 'circle', cx: 24, cy: 24, r: 4, fill: 'accent-tools', stroke: 'accent-tools-text', strokeWidth: 1.5 },
    ],
  },
  {
    id: 'star',
    tone: 'reward',
    shapes: [
      { el: 'polygon', points: starPoints(24, 25, 15, 6.5), fill: 'accent-reward', stroke: 'accent-reward-text', strokeWidth: 2, strokeLinejoin: 'round' },
      { el: 'circle', cx: 24, cy: 25, r: 2.5, fill: 'surface-card' },
    ],
  },
];

/** The avatar given to every new student. */
export const DEFAULT_AVATAR_ID = 'rocket';

/**
 * Look up an avatar, falling back to the default one.
 * @param {string} id
 */
export function getAvatar(id) {
  return AVATARS.find((avatar) => avatar.id === id) ?? AVATARS[0];
}
