import { useEffect, useRef, useState } from 'react';
import { DEFAULT_GUIDE_HERO_ID, getHero } from '../data/heroes.js';
import { useI18n } from '../i18n/index.jsx';
import { useStudent } from './student.jsx';

/**
 * The student's guide.
 * ---------------------------------------------------------------------------
 * The chosen hero is the guide everywhere (lab hint & feedback spots, the
 * catalog greeting, the lobby). Before a hero is chosen — e.g. a direct link
 * to an experiment — Nour guides by default.
 *
 * @returns {{ hero: object, name: string, title: string }}
 */
export function useGuide() {
  const { student } = useStudent();
  const { t } = useI18n();
  const hero = getHero(student.heroId) ?? getHero(DEFAULT_GUIDE_HERO_ID);
  return { hero, name: t(`heroes.${hero.id}.name`), title: t(`heroes.${hero.id}.title`) };
}

/** Pick a random index in [0, length) that differs from `current` when possible. */
function pickAnother(current, length) {
  if (length <= 1) return 0;
  const next = Math.floor(Math.random() * (length - 1));
  return next >= current ? next + 1 : next;
}

/**
 * One of the hero's 4 lines for a situation. A new line is picked whenever
 * the situation (or the optional `trigger`) changes, so repeated feedback
 * does not always say the same thing.
 *
 * @param {string} heroId
 * @param {'celebrate' | 'encourage' | 'hint' | 'wrong'} situation
 * @param {unknown} [trigger] any value; a change picks a fresh line
 * @returns {string}
 */
export function useHeroLine(heroId, situation, trigger) {
  const { t } = useI18n();
  const lines = t(`heroes.${heroId}.lines.${situation}`);
  const count = Array.isArray(lines) ? lines.length : 0;
  const [index, setIndex] = useState(() => Math.floor(Math.random() * Math.max(1, count)));

  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    setIndex((current) => pickAnother(current, count));
  }, [heroId, situation, trigger, count]);

  return count ? lines[index % count] : '';
}
