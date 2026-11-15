import { normalizeArabic } from '../lib/arabic.js';

/**
 * Interactive Experiments Catalog — data
 * ---------------------------------------------------------------------------
 * Copy, categories and illustrations come from the Stitch "Catalog" screens,
 * re-painted with the locked palette (src/index.css).
 *
 * Illustrations are flat SVG described as data and rendered by
 * <FlatIllustration />:
 *   • `viewBox` — 280×88 banner grid shared by every card
 *   • `label`   — accessible description of the drawing (Arabic)
 *   • `shapes`  — ordered list of SVG elements; `fill` / `stroke` are names of
 *                 locked CSS variables without the leading "--"
 *                 (e.g. 'accent-tools-soft'), never raw hex values.
 */

/** Shared drawing grid for all card illustrations. */
const BANNER_VIEWBOX = '0 0 280 88';

/**
 * Subject categories, in filter-pill order.
 *  - `dot`:  colour of the dot inside the filter pill
 *  - `tone`: colour family of the category badge on cards (.badge--<tone>)
 */
export const CATEGORIES = [
  { id: 'all', label: 'الكل' },
  { id: 'physics', label: 'الفيزياء', dot: 'accent-tools', tone: 'tools' },
  { id: 'math', label: 'الرياضيات', dot: 'accent-info', tone: 'info' },
  { id: 'astronomy', label: 'الفلك', dot: 'accent-reward', tone: 'info' },
];

/** The id of the "show everything" filter. */
export const ALL_CATEGORY_ID = 'all';

/**
 * The six experiments of Batch 1.
 *  - `stars`:      difficulty level shown on the card (1–3 stars)
 *  - `badgeIcon`:  Material Symbols icon shown inside the category badge
 *  - `keywords`:   extra search terms (not displayed)
 */
const EXPERIMENT_LIST = [
  {
    id: 'motion-acceleration',
    title: 'قانون الحركة والسرعة والتسارع',
    description: 'جرّب أثر قوة الدفع والاحتكاك على حركة الأجسام في بيئة تفاعلية.',
    category: 'physics',
    badgeIcon: 'bolt',
    stars: 3,
    keywords: ['قوة', 'سرعة', 'تسارع', 'احتكاك', 'نيوتن', 'عربة', 'دفع'],
    illustration: {
      viewBox: BANNER_VIEWBOX,
      label: 'عربة كتلتها m تدفعها قوة F = m × a على أرضية مدرّجة',
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
    title: 'توازن القوى والرافعة',
    description: 'اكتشف إزاي توازن أوزان مختلفة على ذراع الرافعة ونقطة الارتكاز.',
    category: 'physics',
    badgeIcon: 'balance',
    stars: 2,
    keywords: ['رافعة', 'وزن', 'أوزان', 'ارتكاز', 'توازن', 'عزم', 'كتلة'],
    illustration: {
      viewBox: BANNER_VIEWBOX,
      // 4 kg at distance 52 balances 2 kg at distance 104 (4 × 52 = 2 × 104).
      label: 'رافعة متزنة: ثقل ٤ كجم قريب من نقطة الارتكاز وثقل ٢ كجم على ضعف المسافة',
      shapes: [
        // Fulcrum
        { el: 'polygon', points: '140,48 124,72 156,72', fill: 'accent-help', stroke: 'accent-help-text', strokeWidth: 2, strokeLinejoin: 'round' },
        // Lever bar + pivot
        { el: 'rect', x: 20, y: 42, width: 240, height: 6, rx: 3, fill: 'text-secondary' },
        { el: 'circle', cx: 140, cy: 45, r: 2.5, fill: 'surface-card' },
        // 4 kg weight (closer to the pivot)
        { el: 'rect', x: 70, y: 20, width: 36, height: 22, rx: 4, fill: 'accent-tools-soft', stroke: 'accent-tools-text', strokeWidth: 2 },
        { el: 'text', x: 88, y: 35, text: '٤ كجم', fill: 'accent-tools-text', fontSize: 10, fontWeight: 700, textAnchor: 'middle' },
        // 2 kg weight (double the distance)
        { el: 'rect', x: 229, y: 26, width: 30, height: 16, rx: 4, fill: 'accent-reward-soft', stroke: 'accent-reward', strokeWidth: 2 },
        { el: 'text', x: 244, y: 37.5, text: '٢ كجم', fill: 'accent-reward-text', fontSize: 9, fontWeight: 700, textAnchor: 'middle' },
        // Level indicator above the pivot
        { el: 'line', x1: 128, y1: 18, x2: 152, y2: 18, stroke: 'accent-primary', strokeWidth: 2, strokeDasharray: '2 2' },
        { el: 'circle', cx: 140, cy: 18, r: 2.5, fill: 'accent-primary' },
      ],
    },
  },
  {
    id: 'planet-orbits',
    title: 'مسار الكواكب والجاذبية',
    description: 'غيّر كتلة النجم وشوف مدار الكوكب بيتغيّر إزاي حسب الجاذبية.',
    category: 'astronomy',
    badgeIcon: 'public',
    stars: 1,
    keywords: ['كوكب', 'كواكب', 'نجم', 'شمس', 'مدار', 'جاذبية', 'فضاء'],
    illustration: {
      viewBox: BANNER_VIEWBOX,
      label: 'نجم في المركز وكوكبان يدوران في مدارين حوله',
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
    title: 'الكسور والنسب بالمساحة',
    description: 'قسّم الأشكال وقارن النسب المئوية والكسور بشكل بصري عملي.',
    category: 'math',
    badgeIcon: 'calculate',
    stars: 1,
    keywords: ['كسر', 'كسور', 'نسبة', 'نسب', 'مئوية', 'مساحة', 'دائرة', 'تقسيم'],
    illustration: {
      viewBox: BANNER_VIEWBOX,
      label: 'دائرة ملوّن منها ثلاثة أرباع وبجانبها ٣/٤ = ٧٥٪',
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
        { el: 'text', x: 106, y: 49, text: '٣/٤ = ٧٥٪', fill: 'accent-info-text', fontSize: 13, fontWeight: 800, textAnchor: 'middle' },
      ],
    },
  },
  {
    id: 'light-refraction',
    title: 'انعكاس وانكسار الضوء',
    description: 'وجّه شعاع الضوء عبر العدسات والمرايا المختلفة وشاهد زوايا الانكسار.',
    category: 'physics',
    badgeIcon: 'flare',
    stars: 2,
    keywords: ['ضوء', 'شعاع', 'منشور', 'عدسة', 'عدسات', 'مرآة', 'مرايا', 'انكسار', 'انعكاس', 'ألوان'],
    illustration: {
      viewBox: BANNER_VIEWBOX,
      label: 'شعاع ضوء يدخل منشوراً ويتحلل إلى ثلاثة ألوان',
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
    title: 'حالات المادة والحرارة',
    description: 'ارفع درجة الحرارة وراقب تحوّل الجزيئات بين الصلب والسائل والغاز.',
    category: 'physics',
    badgeIcon: 'thermostat',
    stars: 3,
    keywords: ['مادة', 'حرارة', 'صلب', 'سائل', 'غاز', 'جزيئات', 'غليان', 'تبخر', 'انصهار'],
    illustration: {
      viewBox: BANNER_VIEWBOX,
      label: 'كأس فيه جزيئات ملوّنة بجوار لهب حرارته ١٠٠ درجة مئوية',
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
        { el: 'text', x: 110, y: 70, text: '١٠٠° م', fill: 'accent-help-text', fontSize: 11, fontWeight: 700, textAnchor: 'middle' },
      ],
    },
  },
];

/**
 * Pre-compute a normalised search index for every experiment so that search
 * runs on each keystroke without re-normalising the whole catalog.
 */
export const EXPERIMENTS = EXPERIMENT_LIST.map((experiment) => {
  const category = CATEGORIES.find((item) => item.id === experiment.category);
  return Object.freeze({
    ...experiment,
    searchIndex: normalizeArabic(
      [experiment.title, experiment.description, category?.label, ...experiment.keywords].join(' '),
    ),
  });
});

/** @param {string} id */
export function getExperimentById(id) {
  return EXPERIMENTS.find((experiment) => experiment.id === id) ?? null;
}

/** @param {string} id */
export function getCategory(id) {
  return CATEGORIES.find((category) => category.id === id) ?? CATEGORIES[0];
}

/**
 * Filter experiments by category and by a free-text Arabic query.
 * Every word of the query must appear (in any order) in the experiment's
 * normalised title / description / category / keywords.
 *
 * @param {ReadonlyArray<object>} experiments
 * @param {{ query?: string, category?: string }} filters
 */
export function filterExperiments(experiments, { query = '', category = ALL_CATEGORY_ID } = {}) {
  const terms = normalizeArabic(query).split(' ').filter(Boolean);

  return experiments.filter(
    (experiment) =>
      (category === ALL_CATEGORY_ID || experiment.category === category) &&
      terms.every((term) => experiment.searchIndex.includes(term)),
  );
}
