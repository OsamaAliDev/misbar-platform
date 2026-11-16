import { formatNumber } from '../../../lib/arabic.js';

/** English count of stars: "1 star", "12 stars". */
function starCount({ count = 0 }) {
  return count === 1 ? '1 star' : `${formatNumber(count)} stars`;
}

/** Shared strings — English. */
export default {
  themeNight: 'Night mode',
  themeLight: 'Light mode',
  siteName: 'Misbar',
  starCount,
  starsUnit: 'stars',
  starBalanceLabel: ({ count = 0 }) => `Your balance: ${starCount({ count })}`,
  progressOf: ({ value = 0, goal = 0 }) => `${formatNumber(value)} of ${formatNumber(goal)}`,
};
