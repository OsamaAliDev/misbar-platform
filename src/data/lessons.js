/**
 * Primary 4 (Egyptian) Term 1 lesson catalog — مِسبار
 * ---------------------------------------------------------------------------
 * Every lesson below is transcribed from the verified visual audit of the
 * three supplied Primary 4 Term 1 student books (Science, Math, ICT),
 * November 2026. "printed" = the page number in the book footer, "pdf" = the
 * 1-based page in the PDF file (Science pdf = printed + 1, Math pdf = printed
 * + 8, ICT pdf = printed). Lesson titles are short bilingual reference
 * labels for the audited lessons, not reproduced textbook passages.
 *
 * Statuses (deliberately conservative):
 *   • soon — no lesson game is built yet. The books for the next batch
 *            (Primary 4 Math, Science, Computer) are awaited from the
 *            product owner, exactly as instructed.
 *   • link — opens an EXISTING simulation that the audit matched to the
 *            lesson. `verified: true` only for the audit-confirmed
 *            reflection match; every other link is a candidate that
 *            keeps the "needs teacher review" label.
 * No invented content: nothing here claims a textbook activity beyond the
 * audited lesson/page evidence.
 */

/** Compact lesson factory. */
const L = (num, ar, en, printed, pdf, link = null) => ({ num, title: { ar, en }, printed, pdf, link });

/**
 * Existing-experiment links used across the catalog:
 *   { experimentId, verified } — verified means the textbook audit itself
 *   confirmed the lesson concept (light reflection). Candidates are reviewed.
 */
const SCI_LINKS = {
  '4-1': { experimentId: 'light-refraction', verified: true },
  '6-1': { experimentId: 'motion-acceleration', verified: false },
  '6-2': { experimentId: 'motion-acceleration', verified: false },
  '7-1': { experimentId: 'motion-acceleration', verified: false },
  '7-2': { experimentId: 'motion-acceleration', verified: false },
};

/** Science — eight chapters, 26 numbered lessons (Chapter-lesson numbering). */
export const P4_SCIENCE_CHAPTERS = [
  {
    num: 1, title: { ar: 'الطبيعة من حولنا', en: 'Nature around us' },
    lessons: [
      L('1-1', 'نبحث عن الكائنات الحية', 'Looking for living things', '6–7', '7–8'),
      L('1-2', 'كيف نلاحظ؟', 'How do we observe?', '8–11', '9–12'),
      L('1-3', 'ألوان وأشكال الكائنات الحية', 'Colours and shapes of living things', '12–15', '13–16'),
      L('1-4', 'أماكن مختلفة، كائنات مختلفة', 'Different places, different living things', '16–19', '17–20'),
      L('1-5', 'كائنات الصحراء', 'Desert living things', '20–23', '21–24'),
    ],
  },
  {
    num: 2, title: { ar: 'كيف تنمو الحشرات؟', en: 'How do insects grow?' },
    lessons: [
      L('2-1', 'البيوض واليرقات', 'Eggs and larvae', '26–27', '27–28'),
      L('2-2', 'العذراء والحشرة البالغة', 'Pupa and adult insects', '28–31', '29–32'),
      L('2-3', 'بنية جسم الحشرة البالغة', 'Adult insect body structure', '32–34', '33–35'),
    ],
  },
  {
    num: 3, title: { ar: 'كيف تنمو النباتات؟', en: 'How do plants grow?' },
    lessons: [
      L('3-1', 'زرع البذور', 'Planting seeds', '36–37', '37–38'),
      L('3-2', 'بعد الإنبات', 'After germination', '38–41', '39–42'),
      L('3-3', 'الأزهار والثمار', 'Flowers and fruits', '42–45', '43–46'),
      L('3-4', 'أجزاء النبات', 'Plant parts', '46–49', '47–50'),
    ],
  },
  {
    num: 4, title: { ar: 'خصائص الضوء', en: 'Properties of light' },
    lessons: [
      L('4-1', 'كيف يسير ضوء الشمس؟ (يشمل الانعكاس)', 'How does sunlight travel? (incl. reflection)', '50–51', '51–52', SCI_LINKS['4-1']),
      L('4-2', 'تركيز الضوء', 'Concentrating light', '52–55', '53–56'),
      L('4-3', 'الظلال والشمس — جزء ١', 'Shadows and the Sun, part 1', '56–57', '57–58'),
      L('4-4', 'الظلال والشمس — جزء ٢', 'Shadows and the Sun, part 2', '58–61', '59–62'),
      L('4-5', 'الشمس والظل', 'Sun and shade', '62–64', '63–65'),
    ],
  },
  {
    num: 5, title: { ar: 'خصائص الصوت', en: 'Properties of sound' },
    lessons: [
      L('5-1', 'كيف ينشأ الصوت؟', 'How is sound produced?', '68–69', '69–70'),
      L('5-2', 'شدة الصوت والاهتزاز', 'Sound intensity and vibration', '70–73', '71–74'),
      L('5-3', 'كيف ينتقل الصوت؟', 'How does sound travel?', '74–77', '75–78'),
    ],
  },
  {
    num: 6, title: { ar: 'قوة الرياح', en: 'Wind force' },
    lessons: [
      L('6-1', 'سيارات تدفعها الرياح', 'Wind-powered cars', '78–79', '79–80', SCI_LINKS['6-1']),
      L('6-2', 'حجم الشراع', 'Sail size', '80–83', '81–84', SCI_LINKS['6-2']),
    ],
  },
  {
    num: 7, title: { ar: 'قوة المطاط', en: 'Rubber force' },
    lessons: [
      L('7-1', 'سيارات تدفعها المطاطة', 'Rubber-powered cars', '84–85', '85–86', SCI_LINKS['7-1']),
      L('7-2', 'قوة أربطة المطاط', 'Force of rubber bands', '86–89', '87–90', SCI_LINKS['7-2']),
    ],
  },
  {
    num: 8, title: { ar: 'التربة والماء والحياة في مصر', en: 'Soil, water and life in Egypt' },
    lessons: [
      L('8-1', 'العلاقة بين الأرض والماء', 'Relationship between land and water', '92–95', '93–96'),
      L('8-2', 'تحريك التماثيل الحجرية الضخمة', 'Moving huge stone statues', '96–99', '97–100'),
    ],
  },
];

/** Math — eight units, 50 numbered lessons (Unit-lesson numbering). */
export const P4_MATH_UNITS = [
  {
    num: 1, title: { ar: 'القيمة المنزلية', en: 'Place value' },
    lessons: [
      L('1-1', 'الأعداد الكبيرة', 'Large numbers', '3–4', '11–12'),
      L('1-2', 'تغيير القيم المنزلية', 'Changing place values', '5–6', '13–14'),
      L('1-3', 'طرق مختلفة لكتابة الأعداد', 'Different ways to write numbers', '7–8', '15–16'),
      L('1-4', 'تكوين الأعداد وتفكيكها', 'Composing and decomposing numbers', '9–11', '17–19'),
      L('1-5', 'مقارنة الأعداد الكبيرة', 'Comparing large numbers', '12–13', '20–21'),
      L('1-6', 'مقارنة أعداد بصيغ مختلفة', 'Comparing numbers in different forms', '14–16', '22–24'),
      L('1-7', 'ترتيب الأعداد تنازليًا وتصاعديًا', 'Ordering numbers', '17–19', '25–27'),
      L('1-8', 'قواعد التقريب', 'Rounding rules', '20–22', '28–30'),
    ],
  },
  {
    num: 2, title: { ar: 'استراتيجيات الجمع والطرح', en: 'Addition and subtraction strategies' },
    lessons: [
      L('2-1', 'خصائص الجمع', 'Properties of addition', '24–26', '32–34'),
      L('2-2', 'الجمع مع إعادة الترتيب', 'Addition with regrouping', '27–28', '35–36'),
      L('2-3', 'الطرح مع إعادة الترتيب', 'Subtraction with regrouping', '29–31', '37–39'),
      L('2-4', 'النماذج الشريطية والمجهول والمسائل اللفظية', 'Bar models, variables and word problems', '32–34', '40–42'),
      L('2-5', 'مسائل جمع وطرح متعددة الخطوات', 'Multistep word problems', '35–38', '43–46'),
    ],
  },
  {
    num: 3, title: { ar: 'مفاهيم القياس', en: 'Measurement concepts' },
    lessons: [
      L('3-1', 'قياس الطول', 'Measuring length', '40–42', '48–50'),
      L('3-2', 'قياس الكتلة', 'Measuring mass', '43–44', '51–52'),
      L('3-3', 'وحدات السعة', 'Capacity units', '45–47', '53–55'),
      L('3-4', 'وحدات الزمن', 'Time units', '48–49', '56–57'),
      L('3-5', 'الزمن المنقضي', 'Elapsed time', '50–52', '58–60'),
      L('3-6', 'تطبيقات على القياس ١', 'Measurement applications 1', '53–55', '61–63'),
      L('3-7', 'تطبيقات على القياس ٢', 'Measurement applications 2', '56–57', '64–65'),
    ],
  },
  {
    num: 4, title: { ar: 'المساحة والمحيط', en: 'Area and perimeter' },
    lessons: [
      L('4-1', 'إيجاد المحيط', 'Finding perimeter', '59–61', '67–69'),
      L('4-2', 'إيجاد المساحة', 'Finding area', '62–63', '70–71'),
      L('4-3', 'الأطوال المجهولة', 'Unknown dimensions', '64–65', '72–73'),
      L('4-4', 'الأشكال المركبة', 'Composite shapes', '66–69', '74–77'),
    ],
  },
  {
    num: 5, title: { ar: 'الضرب كمقارنة', en: 'Multiplication as a relationship' },
    lessons: [
      L('5-1', 'مقارنة الأعداد باستخدام الضرب', 'Comparing numbers using multiplication', '71–72', '79–80'),
      L('5-2', 'تكوين معادلات المقارنة الضربية', 'Forming multiplicative-comparison equations', '73–74', '81–82'),
      L('5-3', 'حل معادلات المقارنة الضربية', 'Solving multiplicative-comparison equations', '75–76', '83–84'),
      L('5-4', 'خاصية الإبدال في الضرب', 'Commutative property of multiplication', '77–78', '85–86'),
      L('5-5', 'العنصر المحايد والضرب في صفر', 'Identity and multiplication by zero', '79–80', '87–88'),
      L('5-6', 'خاصية التجميع في الضرب', 'Associative property of multiplication', '81–82', '89–90'),
      L('5-7', 'تطبيق أنماط الضرب', 'Applying multiplication patterns', '83–84', '91–92'),
    ],
  },
  {
    num: 6, title: { ar: 'العوامل والمضاعفات', en: 'Factors and multiples' },
    lessons: [
      L('6-1', 'إيجاد عوامل عدد صحيح', 'Identifying whole-number factors', '86–87', '94–95'),
      L('6-2', 'الأعداد الأولية والمركبة', 'Prime and composite numbers', '88–90', '96–98'),
      L('6-3', 'العامل المشترك الأكبر', 'Greatest common factor', '91–92', '99–100'),
      L('6-4', 'إيجاد مضاعفات عدد صحيح', 'Identifying whole-number multiples', '93–94', '101–102'),
      L('6-5', 'المضاعفات المشتركة', 'Common multiples', '95–96', '103–104'),
      L('6-6', 'العلاقة بين العوامل والمضاعفات', 'Relationships between factors and multiples', '97–98', '105–106'),
    ],
  },
  {
    num: 7, title: { ar: 'الضرب والقسمة', en: 'Multiplication and division' },
    lessons: [
      L('7-1', 'استراتيجية نموذج مساحة المستطيل', 'Rectangular-area-model strategy', '100–101', '108–109'),
      L('7-2', 'خاصية التوزيع', 'Distributive property', '102–103', '110–111'),
      L('7-3', 'خوارزمية ضرب الأجزاء', 'Partial-products multiplication', '104–106', '112–114'),
      L('7-4', 'الضرب في رقم واحد', 'Multiplying by a one-digit number', '107–108', '115–116'),
      L('7-5', 'ضرب عدد من رقمين في مضاعفات ١٠', 'Multiplying by multiples of 10', '109–110', '117–118'),
      L('7-6', 'استكشاف الباقي', 'Exploring the remainder', '111–112', '119–120'),
      L('7-7', 'أنماط القسمة', 'Division patterns', '113–115', '121–123'),
      L('7-8', 'القسمة بنموذج مساحة المستطيل', 'Division using an area model', '116', '124'),
      L('7-9', 'خوارزمية القسمة الجزئية', 'Partial-quotients algorithm', '117–118', '125–126'),
      L('7-10', 'خوارزمية القسمة العادية', 'Standard division algorithm', '119–120', '127–128'),
      L('7-11', 'القسمة والضرب', 'Division and multiplication', '121–122', '129–130'),
    ],
  },
  {
    num: 8, title: { ar: 'ترتيب العمليات', en: 'Order of operations' },
    lessons: [
      L('8-1', 'ترتيب العمليات الحسابية', 'Order of arithmetic operations', '124–125', '132–133'),
      L('8-2', 'ترتيب العمليات والمسائل اللفظية', 'Order of operations and word problems', '126–127', '134–135'),
    ],
  },
];

/**
 * ICT (Computer Studies) — Primary 4 Term 1.
 * Only two lessons were individually verified in the audit; the complete
 * ICT lesson list awaits the supplied book, so nothing else is invented.
 * Both entries are proposed adaptations of audited lessons, NOT built games.
 */
export const P4_ICT = {
  units: 2, // audited: the book contains two units
  verifiedLessons: [
    L('1-5', 'مشاكل التقنية الشائعة وحلولها', 'Common technology problems and solutions', '22–23', '22–23'),
    L('1-6', 'مصادر البيانات وتحليلها', 'Sources of data and analysis', '26–27', '26–27'),
  ],
};

/** Subjects that have lesson-level browsing in the Primary 4 catalog. */
export const SUBJECTS_WITH_LESSONS = Object.freeze(['science', 'math', 'ict']);

/**
 * Get the lesson groups for a Primary 4 Term 1 selection.
 * @param {string} subject 'science' | 'math'
 * @returns {Array|null} chapter/unit groups, or null when not covered
 */
export function getP4Lessons(subject) {
  if (subject === 'science') return P4_SCIENCE_CHAPTERS;
  if (subject === 'math') return P4_MATH_UNITS;
  return null;
}

/** Count the numbered lessons for a P4 subject (used in headings). */
export function countP4Lessons(subject) {
  const groups = getP4Lessons(subject);
  if (!groups) return 0;
  return groups.reduce((total, group) => total + group.lessons.length, 0);
}

/** Flatten lesson links so a caller can open an existing experiment. */
export function collectLinkedExperiments(groups) {
  const ids = new Set();
  for (const group of groups) {
    for (const lesson of group.lessons) if (lesson.link) ids.add(lesson.link.experimentId);
  }
  return ids;
}
