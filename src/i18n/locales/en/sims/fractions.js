// needs human review: English science wording
export default {
  presets: {
    // needs human review
    ariaLabel: ({ numerator, denominator }) => `${numerator} out of ${denominator}`,
  },
  stage: {
    caption: {
      // needs human review
      counting: ({ counted, denominator }) => `Counting colored parts: ${counted} of ${denominator}`,
      // needs human review
      empty: 'No colored parts to count',
      // needs human review
      idle: 'Numerator = colored parts • denominator = all parts',
    },
    // needs human review
    ariaLabel: ({ denominator, numerator }) => `A circle and rectangle split into ${denominator} equal parts; ${numerator} are colored`,
    // needs human review
    circle: 'Circle',
    // needs human review
    rectangle: 'Rectangle',
  },
  status: {
    // needs human review
    zero: 'No colored parts, so the fraction is zero',
    // needs human review
    whole: 'All parts are colored, so the fraction is one whole',
    // needs human review
    reducible: ({ value }) => `This fraction can be simplified: divide top and bottom by ${value}`,
    // needs human review
    simplest: 'This fraction is in simplest form',
  },
  controls: {
    // needs human review
    numerator: 'Numerator (colored parts)',
    // needs human review
    denominator: 'Denominator (number of parts)',
    // needs human review
    presets: 'Common fractions',
    // needs human review
    simplify: 'Show simplest form',
    // needs human review
    simplifyDescription: 'Thick lines group parts in the simplified fraction',
  },
  readings: {
    // needs human review
    fraction: 'Fraction',
    // needs human review
    fractionSpoken: ({ numerator, denominator }) => `${numerator} out of ${denominator}`,
    // needs human review
    simplest: 'Simplest form',
    // needs human review
    simplestSpoken: ({ numerator, denominator }) => `${numerator} out of ${denominator}`,
    // needs human review
    decimal: 'Decimal',
    // needs human review
    percent: 'Percent',
    // needs human review
    percentUnit: '%',
  },
};
