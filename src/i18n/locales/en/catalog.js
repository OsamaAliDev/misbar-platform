// needs human review: English science wording (experiment titles, descriptions, keywords).
import { formatNumber } from '../../../lib/arabic.js';

function experimentCount({ count = 0 }) {
  if (count === 0) return 'no matching experiments';
  if (count === 1) return '1 experiment';
  return `${formatNumber(count)} experiments`;
}

/** Catalog (experiment library) strings — English. Same shape as ar/catalog.js. */
export default {
  title: 'Interactive Experiments Library',
  search: {
    label: 'Search for an experiment',
    placeholder: 'Search experiments...',
    clear: 'Clear search',
  },
  filters: {
    label: 'Filter by subject',
    allWithCount: ({ count = 0 }) => `All (${formatNumber(count)})`,
  },
  categories: {
    all: 'All',
    physics: 'Physics',
    math: 'Maths',
    astronomy: 'Space',
  },
  results: ({ count = 0 }) => `Results: ${experimentCount({ count })}`,
  gridLabel: 'Experiments',
  empty: {
    title: 'No experiment with that name',
    text: 'Try another word or pick a different subject.',
    showAll: 'Show all experiments',
  },
  card: {
    start: 'Start experiment',
    level: ({ value = 0, max = 0 }) => `Challenge level: ${formatNumber(value)} of ${formatNumber(max)}`,
  },
  experiments: {
    'motion-acceleration': {
      // needs human review
      title: 'Motion, Speed and Acceleration',
      description: 'See how a push and friction change the way things move, in a hands-on lab.',
      keywords: ['force', 'speed', 'acceleration', 'friction', 'newton', 'cart', 'push', 'motion'],
      art: {
        label: 'A cart of mass m pushed by a force F = m × a along a marked floor',
      },
    },
    'lever-balance': {
      // needs human review
      title: 'Balancing Forces with a Lever',
      description: 'Find out how different weights can balance on a lever around its pivot.',
      keywords: ['lever', 'weight', 'weights', 'pivot', 'fulcrum', 'balance', 'torque', 'mass'],
      art: {
        label: 'A balanced lever: a 4 kg weight near the pivot and a 2 kg weight twice as far away',
        heavy: '4 kg',
        light: '2 kg',
      },
    },
    'planet-orbits': {
      // needs human review
      title: 'Planet Orbits and Gravity',
      description: "Change the star's mass and watch how gravity changes the planet's orbit.",
      keywords: ['planet', 'planets', 'star', 'sun', 'orbit', 'gravity', 'space'],
      art: {
        label: 'A star in the middle with two planets moving around it on two orbits',
      },
    },
    'fractions-area': {
      // needs human review
      title: 'Fractions and Percentages with Area',
      description: 'Split shapes into parts and compare fractions and percentages you can see.',
      keywords: ['fraction', 'fractions', 'ratio', 'percent', 'percentage', 'area', 'circle', 'divide'],
      art: {
        label: 'A circle with three quarters coloured in, next to 3/4 = 75%',
        result: '3/4 = 75%',
      },
    },
    'light-refraction': {
      // needs human review
      title: 'Reflection and Refraction of Light',
      description: 'Aim a beam of light into different materials and watch it bounce and bend.',
      keywords: ['light', 'beam', 'ray', 'prism', 'lens', 'mirror', 'refraction', 'reflection', 'colours'],
      art: {
        label: 'A beam of light enters a prism and splits into three colours',
      },
    },
    'matter-states': {
      // needs human review
      title: 'States of Matter and Heat',
      description: 'Turn up the heat and watch particles change between solid, liquid and gas.',
      keywords: ['matter', 'heat', 'temperature', 'solid', 'liquid', 'gas', 'particles', 'boiling', 'melting'],
      art: {
        label: 'A beaker of coloured particles next to a flame at 100 degrees Celsius',
        temperature: '100 °C',
      },
    },
  },
};
