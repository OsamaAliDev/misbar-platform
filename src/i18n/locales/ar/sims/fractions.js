/** Strings for one simulation (ar). */
export default {
  presets: {
    ariaLabel: ({ numerator, denominator }) => `${numerator} على ${denominator}`,
  },
  stage: {
    caption: {
      counting: ({ counted, denominator }) => `بنعدّ الأجزاء الملوّنة: ${counted} من ${denominator}`,
      empty: 'مفيش أجزاء ملوّنة نعدّها',
      idle: 'البسط = الأجزاء الملوّنة • المقام = كل الأجزاء',
    },
    ariaLabel: ({ denominator, numerator }) => `دائرة ومستطيل مقسومين ${denominator} أجزاء متساوية، ملوّن منهم ${numerator}`,
    circle: 'الدائرة',
    rectangle: 'المستطيل',
  },
  status: {
    zero: 'مفيش ولا جزء ملوّن، يعني الكسر = صفر',
    whole: 'الشكل كله ملوّن، يعني الكسر = واحد صحيح',
    reducible: ({ value }) => `الكسر ده ينفع يتبسّط: نقسم البسط والمقام على ${value}`,
    simplest: 'الكسر ده في أبسط صورة',
  },
  controls: {
    numerator: 'البسط (الأجزاء الملوّنة)',
    denominator: 'المقام (عدد الأجزاء)',
    presets: 'كسور مشهورة',
    simplify: 'إظهار أبسط صورة',
    simplifyDescription: 'خطوط سميكة بتجمع الأجزاء حسب الكسر المبسّط',
  },
  readings: {
    fraction: 'الكسر',
    fractionSpoken: ({ numerator, denominator }) => `${numerator} على ${denominator}`,
    simplest: 'أبسط صورة',
    simplestSpoken: ({ numerator, denominator }) => `${numerator} على ${denominator}`,
    decimal: 'الكسر العشري',
    percent: 'النسبة المئوية',
    percentUnit: '٪',
  },
};
