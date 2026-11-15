/**
 * Arabic text helpers used by the catalog search and UI labels.
 */

/** Harakat / tashkeel, superscript alef and Quranic annotation marks. */
const DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;

/** Tatweel (kashida) used for decorative stretching: "مـــسبار". */
const TATWEEL = /\u0640/g;

/** Arabic-Indic (٠-٩) and Eastern Arabic-Indic (۰-۹) digits. */
const ARABIC_DIGITS = /[\u0660-\u0669\u06F0-\u06F9]/g;

/**
 * Normalise Arabic text so that searching is forgiving for young learners:
 *  - strips diacritics and tatweel   ("مِسبار" → "مسبار")
 *  - unifies alef forms               (أ إ آ ٱ → ا)
 *  - unifies yaa / taa marbuta forms  (ى → ي, ة → ه, ئ → ي, ؤ → و)
 *  - converts Arabic digits to Latin  (٣ → 3)
 *  - lower-cases Latin text and collapses whitespace
 *
 * @param {string} text
 * @returns {string}
 */
export function normalizeArabic(text = '') {
  return String(text)
    .normalize('NFC')
    .replace(DIACRITICS, '')
    .replace(TATWEEL, '')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ئ/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ة/g, 'ه')
    .replace(ARABIC_DIGITS, (digit) => String(digit.charCodeAt(0) & 0xf))
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

const arabicNumberFormat = new Intl.NumberFormat('ar-EG');

/**
 * Format a number with Arabic-Indic digits, matching the Stitch copy
 * ("١٢ نجمة", "الكل (٦)").
 * @param {number} value
 * @returns {string}
 */
export function formatNumber(value) {
  return arabicNumberFormat.format(value);
}

/**
 * Grammatically correct Arabic count of stars (dual and plural forms).
 * @param {number} count
 * @returns {string} e.g. "نجمة واحدة", "نجمتان", "٣ نجوم", "١٢ نجمة"
 */
export function formatStarCount(count) {
  if (count === 1) return 'نجمة واحدة';
  if (count === 2) return 'نجمتان';
  if (count >= 3 && count <= 10) return `${formatNumber(count)} نجوم`;
  return `${formatNumber(count)} نجمة`;
}
