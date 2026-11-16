import { formatNumber } from '../../../lib/arabic.js';

/** Arabic result-count phrase: "تجربة واحدة", "تجربتان", "٣ تجارب", "١١ تجربة". */
function experimentCount({ count = 0 }) {
  if (count === 0) return 'لا توجد تجارب مطابقة';
  if (count === 1) return 'تجربة واحدة';
  if (count === 2) return 'تجربتان';
  if (count <= 10) return `${formatNumber(count)} تجارب`;
  return `${formatNumber(count)} تجربة`;
}

/**
 * Catalog (experiment library) strings — Arabic (default).
 * `experiments.<id>` holds each experiment's card copy; the structure
 * (category, stars, drawing geometry) stays in src/data/experiments.js.
 * `art` = accessible description (`label`) + text drawn inside the card
 * illustration, referenced from the drawing by `textKey`.
 */
export default {
  title: 'مكتبة التجارب التفاعلية',
  search: {
    label: 'ابحث عن تجربة',
    placeholder: 'ابحث عن تجربة...',
    clear: 'مسح البحث',
  },
  filters: {
    label: 'تصفية حسب المادة',
    allWithCount: ({ count = 0 }) => `الكل (${formatNumber(count)})`,
  },
  categories: {
    all: 'الكل',
    physics: 'الفيزياء',
    math: 'الرياضيات',
    astronomy: 'الفلك',
  },
  results: ({ count = 0 }) => `النتائج: ${experimentCount({ count })}`,
  gridLabel: 'التجارب',
  empty: {
    title: 'مالقيناش تجربة بالاسم ده',
    text: 'جرّب كلمة تانية أو اختار مادة مختلفة.',
    showAll: 'عرض كل التجارب',
  },
  card: {
    start: 'ابدأ التجربة',
    level: ({ value = 0, max = 0 }) => `مستوى التحدي: ${formatNumber(value)} من ${formatNumber(max)}`,
  },
  experiments: {
    'motion-acceleration': {
      title: 'قانون الحركة والسرعة والتسارع',
      description: 'جرّب أثر قوة الدفع والاحتكاك على حركة الأجسام في بيئة تفاعلية.',
      keywords: ['قوة', 'سرعة', 'تسارع', 'احتكاك', 'نيوتن', 'عربة', 'دفع'],
      art: {
        label: 'عربة كتلتها m تدفعها قوة F = m × a على أرضية مدرّجة',
      },
    },
    'lever-balance': {
      title: 'توازن القوى والرافعة',
      description: 'اكتشف إزاي توازن أوزان مختلفة على ذراع الرافعة ونقطة الارتكاز.',
      keywords: ['رافعة', 'وزن', 'أوزان', 'ارتكاز', 'توازن', 'عزم', 'كتلة'],
      art: {
        label: 'رافعة متزنة: ثقل ٤ كجم قريب من نقطة الارتكاز وثقل ٢ كجم على ضعف المسافة',
        heavy: '٤ كجم',
        light: '٢ كجم',
      },
    },
    'planet-orbits': {
      title: 'مسار الكواكب والجاذبية',
      description: 'غيّر كتلة النجم وشوف مدار الكوكب بيتغيّر إزاي حسب الجاذبية.',
      keywords: ['كوكب', 'كواكب', 'نجم', 'شمس', 'مدار', 'جاذبية', 'فضاء'],
      art: {
        label: 'نجم في المركز وكوكبان يدوران في مدارين حوله',
      },
    },
    'fractions-area': {
      title: 'الكسور والنسب بالمساحة',
      description: 'قسّم الأشكال وقارن النسب المئوية والكسور بشكل بصري عملي.',
      keywords: ['كسر', 'كسور', 'نسبة', 'نسب', 'مئوية', 'مساحة', 'دائرة', 'تقسيم'],
      art: {
        label: 'دائرة ملوّن منها ثلاثة أرباع وبجانبها ٣/٤ = ٧٥٪',
        result: '٣/٤ = ٧٥٪',
      },
    },
    'light-refraction': {
      title: 'انعكاس وانكسار الضوء',
      description: 'وجّه شعاع الضوء عبر العدسات والمرايا المختلفة وشاهد زوايا الانكسار.',
      keywords: ['ضوء', 'شعاع', 'منشور', 'عدسة', 'عدسات', 'مرآة', 'مرايا', 'انكسار', 'انعكاس', 'ألوان'],
      art: {
        label: 'شعاع ضوء يدخل منشوراً ويتحلل إلى ثلاثة ألوان',
      },
    },
    'matter-states': {
      title: 'حالات المادة والحرارة',
      description: 'ارفع درجة الحرارة وراقب تحوّل الجزيئات بين الصلب والسائل والغاز.',
      keywords: ['مادة', 'حرارة', 'صلب', 'سائل', 'غاز', 'جزيئات', 'غليان', 'تبخر', 'انصهار'],
      art: {
        label: 'كأس فيه جزيئات ملوّنة بجوار لهب حرارته ١٠٠ درجة مئوية',
        temperature: '١٠٠° م',
      },
    },
  },
};
