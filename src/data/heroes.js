/**
 * Heroes — the five guides a student can choose from.
 * ---------------------------------------------------------------------------
 * Only non-text facts live here (ids, accent tone, image files). Names,
 * titles, bios and every guide line are in the translation files
 * (src/i18n/locales/<lang>/heroes.js), keyed by hero id.
 *
 * Images (see /assets-src/heroes for the 1536×2304 originals):
 *   /public/heroes/<id>-outfit1.webp   full body, 600×900, transparent
 *   /public/heroes/<id>-face.webp      round-avatar crop, 160×160
 */

/**
 * Nour's title is not decided yet. This is the ONE place to change it;
 * both translation files read it from here.
 */
export const NOUR_TITLE = Object.freeze({
  ar: 'بطل مِسبار',
  en: 'Misbar Hero',
});

/** Hero used as the guide until a student has chosen one (e.g. lab deep links). */
export const DEFAULT_GUIDE_HERO_ID = 'nour';

const BASE = import.meta.env.BASE_URL;

/** Intrinsic sizes, used for explicit width/height on every <img>. */
export const HERO_IMAGE_SIZE = Object.freeze({ width: 600, height: 900 });
export const HERO_FACE_SIZE = Object.freeze({ width: 160, height: 160 });

/**
 * Display order follows the source artwork (left to right).
 * `tone` is the hero's identity colour family (one of the five accents);
 * it is used only for the hero's own badge/frame, never for actions.
 */
export const HEROES = Object.freeze(
  [
    { id: 'lubna', tone: 'tools', icon: 'code' },
    { id: 'shihab', tone: 'primary', icon: 'speed' },
    { id: 'nour', tone: 'reward', icon: 'star' },
    { id: 'suhail', tone: 'info', icon: 'public' },
    { id: 'sharara', tone: 'help', icon: 'bolt' },
  ].map((hero) =>
    Object.freeze({
      ...hero,
      image: `${BASE}heroes/${hero.id}-outfit1.webp`,
      face: `${BASE}heroes/${hero.id}-face.webp`,
    }),
  ),
);

export const HERO_IDS = Object.freeze(HEROES.map((hero) => hero.id));

/** @returns {object | null} */
export function getHero(heroId) {
  return HEROES.find((hero) => hero.id === heroId) ?? null;
}
