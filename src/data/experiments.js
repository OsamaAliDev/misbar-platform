import { normalizeArabic } from '../lib/arabic.js';

/**
 * Interactive Experiments Catalog — structure
 * ---------------------------------------------------------------------------
 * Categories and illustrations come from the Stitch "Catalog" screens,
 * re-painted with the locked palette (src/index.css). All words (titles,
 * descriptions, search keywords, category names, the drawing's accessible
 * label and any text drawn inside it) live in the translation files:
 *   src/i18n/locales/<lang>/catalog.js → experiments.<id>
 * Read them with `getExperimentCopy(t, id)` / `getCategoryLabel(t, id)`.
 *
 * Illustrations are flat SVG described as data and rendered by
 * <FlatIllustration />:
 *   • `viewBox` — 280×88 banner grid shared by every card
 *   • `shapes`  — ordered list of SVG elements; `fill` / `stroke` are names of
 *                 locked CSS variables without the leading "--"
 *                 (e.g. 'accent-tools-soft'), never raw hex values.
 *                 Text shapes use `textKey` (looked up in `art`) for words
 *                 and units, or `text` for language-neutral symbols ("m",
 *                 "F = m × a").
 */

/** Shared drawing grid for all card illustrations. */
const BANNER_VIEWBOX = '0 0 280 88';

/**
 * Subject categories, in filter-pill order.
 *  - `dot`:  colour of the dot inside the filter pill
 *  - `tone`: colour family of the category badge on cards (.badge--<tone>)
 */
export const CATEGORIES = [
  { id: 'all' },
  { id: 'physics', dot: 'accent-tools', tone: 'tools' },
  { id: 'math', dot: 'accent-info', tone: 'info' },
  { id: 'astronomy', dot: 'accent-reward', tone: 'info' },
];

/** The id of the "show everything" filter. */
export const ALL_CATEGORY_ID = 'all';

/**
 * The six experiments of Batch 1.
 *  - `stars`:      difficulty level shown on the card (1–3 stars)
 *  - `badgeIcon`:  Material Symbols icon shown inside the category badge
 */
const EXPERIMENT_LIST = [
  {
    id: 'motion-acceleration',
    category: 'physics',
    badgeIcon: 'bolt',
    stars: 3,
    illustration: {
      viewBox: BANNER_VIEWBOX,
      shapes: [
        // Floor line with measurement ticks
        { el: 'line', x1: 20, y1: 62, x2: 260, y2: 62, stroke: 'outline', strokeWidth: 3, strokeLinecap: 'round' },
        { el: 'line', x1: 60, y1: 62, x2: 60, y2: 68, stroke: 'outline', strokeWidth: 2 },
        { el: 'line', x1: 120, y1: 62, x2: 120, y2: 68, stroke: 'outline', strokeWidth: 2 },
        { el: 'line', x1: 180, y1: 62, x2: 180, y2: 68, stroke: 'outline', strokeWidth: 2 },
        { el: 'line', x1: 240, y1: 62, x2: 240, y2: 68, stroke: 'outline', strokeWidth: 2 },
        // Mass block "m"
        { el: 'rect', x: 150, y: 32, width: 46, height: 30, rx: 6, fill: 'accent-tools-soft', stroke: 'accent-tools-text', strokeWidth: 2 },
        { el: 'text', x: 173, y: 52, text: 'm', fill: 'accent-tools-text', fontSize: 12, fontWeight: 700, textAnchor: 'middle' },
        // Force arrow (points left — the direction of motion in RTL)
        { el: 'path', d: 'M135 47L95 47M95 47L105 40M95 47L105 54', stroke: 'accent-primary', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' },
        // Formula tag
        { el: 'rect', x: 70, y: 22, width: 58, height: 18, rx: 6, fill: 'accent-info-soft', stroke: 'accent-info-text', strokeWidth: 1.5 },
        { el: 'text', x: 99, y: 35, text: 'F = m × a', fill: 'accent-info-text', fontSize: 10, fontWeight: 700, textAnchor: 'middle', direction: 'ltr' },
        // Wheels
        { el: 'circle', cx: 160, cy: 62, r: 5, fill: 'text-primary' },
        { el: 'circle', cx: 186, cy: 62, r: 5, fill: 'text-primary' },
      ],
    },
  },
  {
    id: 'lever-balance',
    category: 'physics',
    badgeIcon: 'balance',
    stars: 2,
    illustration: {
      viewBox: BANNER_VIEWBOX,
      // 4 kg at distance 52 balances 2 kg at distance 104 (4 × 52 = 2 × 104).
      shapes: [
        // Fulcrum
        { el: 'polygon', points: '140,48 124,72 156,72', fill: 'accent-help', stroke: 'accent-help-text', strokeWidth: 2, strokeLinejoin: 'round' },
        // Lever bar + pivot
        { el: 'rect', x: 20, y: 42, width: 240, height: 6, rx: 3, fill: 'text-secondary' },
        { el: 'circle', cx: 140, cy: 45, r: 2.5, fill: 'surface-card' },
        // 4 kg weight (closer to the pivot)
        { el: 'rect', x: 70, y: 20, width: 36, height: 22, rx: 4, fill: 'accent-tools-soft', stroke: 'accent-tools-text', strokeWidth: 2 },
        { el: 'text', x: 88, y: 35, textKey: 'heavy', fill: 'accent-tools-text', fontSize: 10, fontWeight: 700, textAnchor: 'middle' },
        // 2 kg weight (double the distance)
        { el: 'rect', x: 229, y: 26, width: 30, height: 16, rx: 4, fill: 'accent-reward-soft', stroke: 'accent-reward', strokeWidth: 2 },
        { el: 'text', x: 244, y: 37.5, textKey: 'light', fill: 'accent-reward-text', fontSize: 9, fontWeight: 700, textAnchor: 'middle' },
        // Level indicator above the pivot
        { el: 'line', x1: 128, y1: 18, x2: 152, y2: 18, stroke: 'accent-primary', strokeWidth: 2, strokeDasharray: '2 2' },
        { el: 'circle', cx: 140, cy: 18, r: 2.5, fill: 'accent-primary' },
      ],
    },
  },
  {
    id: 'planet-orbits',
    category: 'astronomy',
    badgeIcon: 'public',
    stars: 1,
    illustration: {
      viewBox: BANNER_VIEWBOX,
      shapes: [
        // Orbits
        { el: 'ellipse', cx: 140, cy: 44, rx: 100, ry: 26, stroke: 'accent-info', strokeWidth: 2, strokeDasharray: '4 4' },
        { el: 'ellipse', cx: 140, cy: 44, rx: 60, ry: 16, stroke: 'outline', strokeWidth: 1.5, strokeDasharray: '3 3' },
        // Central star
        { el: 'circle', cx: 140, cy: 44, r: 16, fill: 'accent-reward', stroke: 'accent-reward-text', strokeWidth: 2 },
        { el: 'circle', cx: 140, cy: 44, r: 11, fill: 'accent-reward-soft' },
        // Star rays
        { el: 'circle', cx: 140, cy: 22, r: 1.5, fill: 'accent-reward' },
        { el: 'circle', cx: 140, cy: 66, r: 1.5, fill: 'accent-reward' },
        { el: 'circle', cx: 118, cy: 44, r: 1.5, fill: 'accent-reward' },
        { el: 'circle', cx: 162, cy: 44, r: 1.5, fill: 'accent-reward' },
        // Outer ringed planet (sits exactly on the outer orbit)
        { el: 'circle', cx: 225, cy: 30, r: 8, fill: 'accent-primary', stroke: 'text-primary', strokeWidth: 2 },
        { el: 'ellipse', cx: 225, cy: 30, rx: 12, ry: 3.5, stroke: 'accent-primary-soft', strokeWidth: 1.5 },
        // Inner small planet (sits exactly on the inner orbit)
        { el: 'circle', cx: 95, cy: 55, r: 5, fill: 'accent-info', stroke: 'accent-info-text', strokeWidth: 1.5 },
      ],
    },
  },
  {
    id: 'fractions-area',
    category: 'math',
    badgeIcon: 'calculate',
    stars: 1,
    illustration: {
      viewBox: BANNER_VIEWBOX,
      shapes: [
        // Whole circle (the unshaded quarter stays white)
        { el: 'circle', cx: 186, cy: 44, r: 28, fill: 'surface-card' },
        // Top half (2/4)
        { el: 'path', d: 'M158 44A28 28 0 0 1 214 44Z', fill: 'accent-info' },
        // Bottom-right quarter (1/4)
        { el: 'path', d: 'M186 44L214 44A28 28 0 0 1 186 72Z', fill: 'accent-reward' },
        // Dividers + outline
        { el: 'path', d: 'M158 44H214M186 44V72', stroke: 'text-primary', strokeWidth: 2 },
        { el: 'circle', cx: 186, cy: 44, r: 28, stroke: 'text-primary', strokeWidth: 2.5 },
        // Result tag
        { el: 'rect', x: 62, y: 30, width: 88, height: 28, rx: 8, fill: 'surface-card', stroke: 'outline', strokeWidth: 2 },
        { el: 'text', x: 106, y: 49, textKey: 'result', fill: 'accent-info-text', fontSize: 13, fontWeight: 800, textAnchor: 'middle' },
      ],
    },
  },
  {
    id: 'light-refraction',
    category: 'physics',
    badgeIcon: 'flare',
    stars: 2,
    illustration: {
      viewBox: BANNER_VIEWBOX,
      shapes: [
        // Incoming light ray
        { el: 'line', x1: 252, y1: 26, x2: 156, y2: 46, stroke: 'accent-reward', strokeWidth: 3, strokeLinecap: 'round' },
        // Prism
        { el: 'polygon', points: '140,18 112,66 168,66', fill: 'accent-tools-soft', stroke: 'accent-tools', strokeWidth: 2, strokeLinejoin: 'round' },
        // Light travelling inside the prism
        { el: 'line', x1: 156, y1: 46, x2: 123, y2: 48, stroke: 'surface-card', strokeWidth: 2, strokeLinecap: 'round' },
        // Dispersed rays
        { el: 'line', x1: 122, y1: 47, x2: 36, y2: 24, stroke: 'accent-help', strokeWidth: 2.5, strokeLinecap: 'round' },
        { el: 'line', x1: 122, y1: 48, x2: 36, y2: 46, stroke: 'accent-info', strokeWidth: 2.5, strokeLinecap: 'round' },
        { el: 'line', x1: 122, y1: 49, x2: 36, y2: 68, stroke: 'accent-tools', strokeWidth: 2.5, strokeLinecap: 'round' },
      ],
    },
  },
  {
    id: 'matter-states',
    category: 'physics',
    badgeIcon: 'thermostat',
    stars: 3,
    illustration: {
      viewBox: BANNER_VIEWBOX,
      shapes: [
        // Beaker
        { el: 'path', d: 'M160 16H200V60Q200 72 188 72H172Q160 72 160 60Z', fill: 'surface-card', stroke: 'text-primary', strokeWidth: 2, strokeLinejoin: 'round' },
        { el: 'line', x1: 156, y1: 16, x2: 204, y2: 16, stroke: 'text-primary', strokeWidth: 2, strokeLinecap: 'round' },
        // Molecules
        { el: 'circle', cx: 169, cy: 50, r: 4, fill: 'accent-help' },
        { el: 'circle', cx: 180, cy: 50, r: 4, fill: 'accent-primary' },
        { el: 'circle', cx: 191, cy: 50, r: 4, fill: 'accent-info' },
        { el: 'circle', cx: 174.5, cy: 61, r: 4, fill: 'accent-info' },
        { el: 'circle', cx: 185.5, cy: 61, r: 4, fill: 'accent-tools' },
        // Flame
        { el: 'path', d: 'M110 20C117 28 121 33 121 41C121 48 116 53 110 53C104 53 99 48 99 41C99 36 102 32 105 28C105 33 107 36 110 36C110 30 108 25 110 20Z', fill: 'accent-help', stroke: 'accent-help-text', strokeWidth: 1.5, strokeLinejoin: 'round' },
        { el: 'path', d: 'M110 38C113 41 115 43 115 46C115 49 113 51 110 51C107 51 105 49 105 46C105 43 108 41 110 38Z', fill: 'accent-help-soft' },
        // Temperature label
        { el: 'text', x: 110, y: 70, textKey: 'temperature', fill: 'accent-help-text', fontSize: 11, fontWeight: 700, textAnchor: 'middle' },
      ],
    },
  },
];

export const EXPERIMENTS = Object.freeze(EXPERIMENT_LIST.map((experiment) => Object.freeze(experiment)));

/** @param {string} id */
export function getExperimentById(id) {
  return EXPERIMENTS.find((experiment) => experiment.id === id) ?? null;
}

/** @param {string} id */
export function getCategory(id) {
  return CATEGORIES.find((category) => category.id === id) ?? CATEGORIES[0];
}

/**
 * Localised copy of one experiment in the current language.
 * @param {Function} t   translation helper from useI18n()
 * @param {string} id
 * @returns {{ title: string, description: string, keywords: string[], art: Record<string, string> }}
 */
export function getExperimentCopy(t, id) {
  return t(`catalog.experiments.${id}`);
}

/** Localised category name ("الفيزياء" / "Physics"). */
export function getCategoryLabel(t, id) {
  return t(`catalog.categories.${id}`);
}

/**
 * Build a normalised search index (experiment id → searchable text) in the
 * current language, so search runs on each keystroke without re-normalising
 * the whole catalog. Rebuild it when the language changes.
 * @param {Function} t   translation helper from useI18n()
 * @returns {Map<string, string>}
 */
export function buildSearchIndex(t) {
  return new Map(
    EXPERIMENTS.map((experiment) => {
      const copy = getExperimentCopy(t, experiment.id);
      const words = [copy.title, copy.description, getCategoryLabel(t, experiment.category), ...copy.keywords];
      return [experiment.id, normalizeArabic(words.join(' '))];
    }),
  );
}

/**
 * Filter experiments by category and by a free-text query in the current
 * language. Every word of the query must appear (in any order) in the
 * experiment's normalised title / description / category / keywords.
 * (`normalizeArabic` also lower-cases Latin text, so English works too.)
 *
 * @param {ReadonlyArray<object>} experiments
 * @param {{ query?: string, category?: string }} filters
 * @param {Map<string, string>} searchIndex   from buildSearchIndex(t)
 */
export function filterExperiments(experiments, { query = '', category = ALL_CATEGORY_ID } = {}, searchIndex) {
  const terms = normalizeArabic(query).split(' ').filter(Boolean);

  return experiments.filter(
    (experiment) =>
      (category === ALL_CATEGORY_ID || experiment.category === category) &&
      terms.every((term) => (searchIndex.get(experiment.id) ?? '').includes(term)),
  );
}
