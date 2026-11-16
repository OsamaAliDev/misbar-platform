/** Strings for one simulation (ar). */
export default {
  units: {
    kilogram: 'كجم',
    meterWord: 'متر',
    meterShort: 'م',
    torque: 'نيوتن·متر',
    degreeWord: 'درجة',
    degree: '°',
  },
  stage: {
    ariaLabel: 'رافعة: ثقل {rightMass} {kilogram} على اليمين وثقل {leftMass} {kilogram} على اليسار، زاوية الميل {angle} {degreeWord}',
    rightTorque: 'العزم الأيمن {value} {torque}',
    leftTorque: 'العزم الأيسر {value} {torque}',
    perfectBalance: 'حالة توازن مثالية!',
    distanceTick: '{value} {meterShort}',
  },
  weight: {
    mass: '{value} {kilogram}',
  },
  status: {
    balanced: 'حالة توازن مثالية! العزم الأيمن = العزم الأيسر',
    rightBigger: 'العزم الأيمن أكبر، فالرافعة بتميل ناحية اليمين',
    leftBigger: 'العزم الأيسر أكبر، فالرافعة بتميل ناحية اليسار',
  },
  controls: {
    rightMass: 'كتلة الثقل الأيمن',
    rightDistance: 'بُعد الثقل الأيمن عن الارتكاز',
    leftMass: 'كتلة الثقل الأيسر',
    leftDistance: 'بُعد الثقل الأيسر عن الارتكاز',
  },
  sides: {
    right: 'يمين',
    left: 'يسار',
  },
  readings: {
    rightTorque: 'العزم الأيمن',
    leftTorque: 'العزم الأيسر',
    torqueDifference: 'فرق العزم',
    tilt: 'زاوية الميل',
    tiltValue: '{value}{degree}',
  },
};
