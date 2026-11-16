import { formatNumber } from '../../../lib/arabic.js';

/** Arabic count of stars with dual and plural forms: "نجمة واحدة", "نجمتان", "٣ نجوم", "١٢ نجمة". */
function starCount({ count = 0 }) {
  if (count === 1) return 'نجمة واحدة';
  if (count === 2) return 'نجمتان';
  if (count >= 3 && count <= 10) return `${formatNumber(count)} نجوم`;
  return `${formatNumber(count)} نجمة`;
}

/** Shared strings — Arabic (default). */
export default {
  themeNight: 'الوضع الليلي',
  themeLight: 'الوضع الفاتح',
  defaultNickname: 'بطل الفضاء',
  siteName: 'مِسبار',
  starCount,
  /** Short unit shown after the number in star counters: "١٢ نجمة". */
  starsUnit: 'نجمة',
  starBalanceLabel: ({ count = 0 }) => `رصيدك: ${starCount({ count })}`,
  progressOf: ({ value = 0, goal = 0 }) => `${formatNumber(value)} من ${formatNumber(goal)}`,
};
