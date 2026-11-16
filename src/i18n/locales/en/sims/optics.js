// needs human review: English science wording
/** Strings for the light-refraction simulation (en). */
export default {
  media: {
    air: 'Air', // needs human review
    water: 'Water', // needs human review
    glass: 'Glass', // needs human review
  },
  units: {
    degree: '°',
    degreeWord: '°',
    percent: '%',
  },
  stage: {
    ariaLabel: 'Light ray from {from} to {to} at {angle}{degreeWord}', // needs human review
    refractiveIndex: 'Refractive index {value}', // needs human review
  },
  status: {
    totalReflection: 'Total internal reflection! All the light bounced back', // needs human review
    sameMedium: 'Same medium: light keeps a straight path without bending', // needs human review
    straightOn: 'The light hits the surface straight on, so it does not change direction', // needs human review
    denser: 'The light enters a denser medium, so it bends toward the normal', // needs human review
    lessDense: 'The light enters a less dense medium, so it bends away from the normal', // needs human review
  },
  controls: {
    incidenceAngle: 'Incidence angle', // needs human review
    firstMedium: 'First medium (where light comes from)', // needs human review
    secondMedium: 'Second medium', // needs human review
  },
  readings: {
    incidenceAngle: 'Incidence angle', // needs human review
    reflectionAngle: 'Reflection angle', // needs human review
    refractionAngle: 'Refraction angle', // needs human review
    criticalAngle: 'Critical angle', // needs human review
    reflectedLight: 'Reflected light', // needs human review
    noRefraction: 'No bending', // needs human review
    none: 'None', // needs human review
  },
};
