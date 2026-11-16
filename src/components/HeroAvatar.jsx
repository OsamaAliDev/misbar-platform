import { HERO_FACE_SIZE } from '../data/heroes.js';
import './HeroAvatar.css';

/**
 * <HeroAvatar /> — a hero's face in a round frame (guide spots, pickers).
 * Uses the small 160×160 face crop, never the full-body image.
 *
 * @param {object} props
 * @param {object} props.hero          entry from src/data/heroes.js
 * @param {number} [props.size=48]     diameter in px
 * @param {string} [props.alt='']      empty = decorative (text nearby names the hero)
 * @param {string} [props.className]
 */
export default function HeroAvatar({ hero, size = 48, alt = '', className = '' }) {
  return (
    <span
      className={`hero-avatar hero-avatar--${hero.tone} ${className}`.trim()}
      style={{ '--hero-avatar-size': `${size}px` }}
    >
      <img
        src={hero.face}
        alt={alt}
        width={HERO_FACE_SIZE.width}
        height={HERO_FACE_SIZE.height}
        loading="lazy"
        decoding="async"
      />
    </span>
  );
}
