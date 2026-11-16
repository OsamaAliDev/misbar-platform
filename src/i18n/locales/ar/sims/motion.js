/** Strings for one simulation (ar). */
export default {
  units: {
    newton: 'نيوتن',
    kilogram: 'كجم',
    acceleration: 'م/ث²',
    velocity: 'م/ث',
    meterWord: 'متر',
    secondWord: 'ثانية',
  },
  stage: {
    ariaLabel: 'عربة كتلتها {mass} {kilogram} على مسار طوله {length} {meterWord}، قطعت {distance} {meterWord}',
    distanceLabel: 'المسافة بالمتر',
    start: 'البداية',
    finish: 'النهاية',
    formula: 'التسارع = القوة المحصلة ÷ الكتلة',
    legend: {
      push: 'قوة الدفع',
      friction: 'الاحتكاك',
      speed: 'السرعة',
    },
  },
  cart: {
    mass: '{value} {kilogram}',
  },
  status: {
    finished: 'وصلت العربة لخط النهاية في {time} {second}',
    noPush: 'مفيش قوة دفع، العربة واقفة مكانها',
    frictionStopped: 'الاحتكاك أقوى من قوة الدفع، العربة مش قادرة تتحرك',
    accelerating: 'العربة بتتسارع',
    slowing: 'العربة بتتباطأ بسبب الاحتكاك',
    steady: 'العربة ماشية بسرعة ثابتة',
    ready: 'اضغط «تشغيل» عشان تبدأ الدفع',
    paused: 'التجربة متوقفة مؤقتاً',
  },
  controls: {
    pushForce: 'قوة الدفع',
    cartMass: 'كتلة العربة',
    floorFriction: 'الاحتكاك مع الأرض',
    maxFriction: 'قوة الاحتكاك القصوى {value} {newton}',
    noFriction: 'أرضية ناعمة جداً من غير احتكاك',
  },
  readings: {
    netForce: 'القوة المحصلة',
    acceleration: 'التسارع',
    speed: 'السرعة',
    distance: 'المسافة',
    time: 'الزمن',
  },
};
