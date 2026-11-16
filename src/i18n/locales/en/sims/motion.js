// needs human review: English science wording
export default {
  units: {
    // needs human review
    newton: 'N',
    // needs human review
    kilogram: 'kg',
    // needs human review
    acceleration: 'm/s²',
    // needs human review
    velocity: 'm/s',
    // needs human review
    meterWord: 'm',
    // needs human review
    secondWord: 's',
  },
  stage: {
    // needs human review
    ariaLabel: 'Cart mass {mass} {kilogram}, track length {length} {meterWord}, distance {distance} {meterWord}',
    // needs human review
    distanceLabel: 'Distance (m)',
    start: 'Start',
    finish: 'Finish',
    // needs human review
    formula: 'Acceleration = net force ÷ mass',
    legend: {
      // needs human review
      push: 'Push',
      // needs human review
      friction: 'Friction',
      // needs human review
      speed: 'Speed',
    },
  },
  cart: {
    // needs human review
    mass: '{value} {kilogram}',
  },
  status: {
    // needs human review
    finished: 'Cart reached the finish in {time} {second}',
    // needs human review
    noPush: 'No push; the cart stays put',
    // needs human review
    frictionStopped: 'Friction is too strong; the cart cannot move',
    // needs human review
    accelerating: 'The cart is speeding up',
    // needs human review
    slowing: 'The cart slows from friction',
    // needs human review
    steady: 'The cart moves at steady speed',
    ready: 'Press “Run” to push',
    paused: 'The experiment is paused',
  },
  controls: {
    // needs human review
    pushForce: 'Push force',
    // needs human review
    cartMass: 'Cart mass',
    // needs human review
    floorFriction: 'Floor friction',
    // needs human review
    maxFriction: 'Max friction {value} {newton}',
    // needs human review
    noFriction: 'Very smooth floor, no friction',
  },
  readings: {
    // needs human review
    netForce: 'Net force',
    // needs human review
    acceleration: 'Acceleration',
    // needs human review
    speed: 'Speed',
    // needs human review
    distance: 'Distance',
    // needs human review
    time: 'Time',
  },
};
