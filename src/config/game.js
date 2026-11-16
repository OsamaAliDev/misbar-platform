import { getExperimentById } from '../data/experiments.js';

/**
 * Game configuration — ranks, missions and outfit slots.
 * ---------------------------------------------------------------------------
 * Every number that drives progression lives in this one file so it can be
 * tuned in one place. All names and descriptions are in the translation
 * files (src/i18n/locales/<lang>/game.js), keyed by the ids below.
 *
 * Star budget today: 12 (starting balance) + 6 (one per experiment
 * challenge) + 10 (missions: 2 + 3 + 5) = 28 stars in total.
 * Thresholds are chosen so a student sees the first rank change after one
 * or two challenges, and the top rank needs every challenge and mission.
 */

/**
 * Discovery rank ladder, driven by the total star count.
 * `minStars` must be ascending; the first rank must start at 0.
 * `tone` picks one of the five accent families for the rank's icon.
 */
export const RANKS = Object.freeze([
  { id: 'young-explorer', minStars: 0, icon: 'explore', tone: 'info' },
  { id: 'inventor', minStars: 14, icon: 'lightbulb', tone: 'tools' },
  { id: 'lab-captain', minStars: 18, icon: 'science', tone: 'primary' },
  { id: 'discovery-commander', minStars: 23, icon: 'travel_explore', tone: 'help' },
  { id: 'master-scientist', minStars: 28, icon: 'workspace_premium', tone: 'reward' },
]);

/** The rank reached with `stars` stars. */
export function getRank(stars) {
  let current = RANKS[0];
  for (const rank of RANKS) if (stars >= rank.minStars) current = rank;
  return current;
}

/** The next rank above `stars`, or `null` at the top of the ladder. */
export function getNextRank(stars) {
  return RANKS.find((rank) => rank.minStars > stars) ?? null;
}

/**
 * Progress from the current rank to the next one.
 * @returns {{ rank, nextRank, ratio: number, remaining: number }}
 */
export function getRankProgress(stars) {
  const rank = getRank(stars);
  const nextRank = getNextRank(stars);
  if (!nextRank) return { rank, nextRank: null, ratio: 1, remaining: 0 };
  const span = nextRank.minStars - rank.minStars;
  return {
    rank,
    nextRank,
    ratio: Math.min(1, Math.max(0, (stars - rank.minStars) / span)),
    remaining: nextRank.minStars - stars,
  };
}

/* --------------------------------------------------------------------------
   Missions — simple one-time tasks tied to the existing experiment
   challenges (the same `completedChallenges` list that awards the +1 star
   in the Playground; no second progress store).
   -------------------------------------------------------------------------- */

/** Science subjects counted by the "science tour" mission. */
const TOUR_CATEGORIES = Object.freeze(['physics', 'math', 'astronomy']);

export const MISSIONS = Object.freeze([
  {
    id: 'first-discovery',
    icon: 'science',
    reward: 2,
    goal: 1,
    progress: (completed) => completed.length,
  },
  {
    id: 'two-experiments',
    icon: 'task_alt',
    reward: 3,
    goal: 2,
    progress: (completed) => completed.length,
  },
  {
    id: 'science-tour',
    icon: 'travel_explore',
    reward: 5,
    goal: TOUR_CATEGORIES.length,
    progress: (completed) => {
      const categories = new Set(completed.map((id) => getExperimentById(id)?.category));
      return TOUR_CATEGORIES.filter((category) => categories.has(category)).length;
    },
  },
]);

export function getMission(missionId) {
  return MISSIONS.find((mission) => mission.id === missionId) ?? null;
}

/**
 * Mission status for a student.
 * @param {object} mission
 * @param {{ completedChallenges: string[], claimedMissions: string[] }} student
 * @returns {{ value: number, goal: number, complete: boolean, claimed: boolean }}
 */
export function getMissionStatus(mission, student) {
  const value = Math.min(mission.goal, mission.progress(student.completedChallenges));
  return {
    value,
    goal: mission.goal,
    complete: value >= mission.goal,
    claimed: student.claimedMissions.includes(mission.id),
  };
}

/* --------------------------------------------------------------------------
   Outfit vault — slot 1 is every hero's current outfit (free). Further
   slots are placeholders that unlock once the student's star total reaches
   `cost` (stars are a progress total, so unlocking does not spend them).
   -------------------------------------------------------------------------- */
export const OUTFIT_SLOTS = Object.freeze([
  { slot: 1, cost: 0 },
  { slot: 2, cost: 16 },
  { slot: 3, cost: 22 },
  { slot: 4, cost: 28 },
]);

export function getOutfitSlot(slot) {
  return OUTFIT_SLOTS.find((item) => item.slot === slot) ?? null;
}

/** Storage id of an unlocked outfit, e.g. "lubna:2". */
export function outfitKey(heroId, slot) {
  return `${heroId}:${slot}`;
}
