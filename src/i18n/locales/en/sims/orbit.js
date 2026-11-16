// needs human review: English science wording
export default {
  starTypes: {
    // needs human review
    redDwarf: 'small red dwarf',
    // needs human review
    sunLike: 'Sun-like star',
    // needs human review
    blueGiant: 'blue giant star',
  },
  planets: {
    // needs human review
    venus: 'Venus',
    // needs human review
    earth: 'Earth',
    // needs human review
    mars: 'Mars',
  },
  stage: {
    // needs human review
    ariaLabel: ({ star, radius }) => `${star} with a planet orbiting at ${radius} AU`,
    // needs human review
    distanceUnit: 'AU',
    vector: {
      // needs human review
      gravity: 'Gravity',
      // needs human review
      speed: 'Speed',
    },
  },
  status: {
    // needs human review
    starMass: ({ name, value }) => `${name} • mass ${value} Sun masses`,
  },
  controls: {
    // needs human review
    starMass: 'Star mass',
    // needs human review
    starMassUnit: 'Sun masses',
    // needs human review
    orbitRadius: 'Orbit radius',
    // needs human review
    orbitRadiusUnit: 'AU',
    // needs human review
    planetPreset: 'Try a planet around the Sun',
    // needs human review
    vectors: 'Gravity + speed arrows',
    // needs human review
    vectorsDescription: 'Gravity points to the star; speed follows the orbit',
  },
  readings: {
    // needs human review
    speed: 'Orbital speed',
    // needs human review
    speedUnit: 'km/s',
    // needs human review
    period: 'Period',
    // needs human review
    periodUnit: 'days',
    // needs human review
    gravity: 'Gravity',
    // needs human review
    gravityUnit: '× Earth gravity',
    // needs human review
    orbits: 'Full orbits',
    // needs human review
    orbitsUnit: 'orbits',
  },
};
