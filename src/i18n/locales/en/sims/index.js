/**
 * Per-simulation strings (en), keyed by experiment id:
 *   t('lab.sims.motion-acceleration.<key>')
 * Each simulation owns one module so it can be edited on its own.
 */
import fractions from './fractions.js';
import lever from './lever.js';
import matter from './matter.js';
import motion from './motion.js';
import optics from './optics.js';
import orbit from './orbit.js';

export default {
  'motion-acceleration': motion,
  'lever-balance': lever,
  'planet-orbits': orbit,
  'fractions-area': fractions,
  'light-refraction': optics,
  'matter-states': matter,
};
