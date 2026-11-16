// needs human review: English science wording
/** Strings for the matter-states simulation (en). */
export default {
  states: {
    solid: 'Solid', // needs human review
    liquid: 'Liquid', // needs human review
    gas: 'Gas', // needs human review
    melting: 'Melting', // needs human review
    freezing: 'Freezing', // needs human review
    boiling: 'Boiling', // needs human review
    condensing: 'Condensing', // needs human review
  },
  units: {
    degree: '°',
    celsius: '°C', // needs human review
    ariaCelsius: '°C', // needs human review
    speed: 'm/s', // needs human review
  },
  temperatures: {
    melting: '0°C', // needs human review
    boiling: '100°C', // needs human review
  },
  stage: {
    ariaLabel: 'Chamber with water particles: {state}, temperature {temperature}{unit}', // needs human review
    heaterOn: 'Heater on', // needs human review
    coolerOn: 'Cooling on', // needs human review
    stableTemperature: 'Temperature steady', // needs human review
  },
  status: {
    solid: 'Solid: particles vibrate in place', // needs human review
    melting: '{state}… Temperature stays at {temperature} until it finishes', // needs human review
    liquid: 'Liquid: particles slide past each other', // needs human review
    boiling: '{state}… Temperature stays at {temperature} until it finishes', // needs human review
    gas: 'Gas: particles fly freely through the chamber', // needs human review
  },
  controls: {
    heaterTemperature: 'Heater temperature', // needs human review
    quickControl: 'Quick control', // needs human review
    prepare: 'Set a state', // needs human review
    actions: {
      heat: 'Heat {value}{degree}', // needs human review
      cool: 'Cool {value}{degree}', // needs human review
    },
  },
  materials: {
    ice: 'Ice', // needs human review
    water: 'Water', // needs human review
    steam: 'Steam', // needs human review
  },
  readings: {
    temperature: 'Material temperature', // needs human review
    state: 'State', // needs human review
    particleSpeed: 'Particle speed', // needs human review
    shapeVolume: 'Shape and volume', // needs human review
  },
  shape: {
    solid: 'Fixed shape and volume', // needs human review
    gas: 'Fills the whole chamber', // needs human review
    liquid: 'Fixed volume, changing shape', // needs human review
  },
};
