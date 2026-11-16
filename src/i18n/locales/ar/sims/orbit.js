/** Strings for one simulation (ar). */
export default {
  starTypes: {
    redDwarf: 'قزم أحمر صغير',
    sunLike: 'نجم شبيه بالشمس',
    blueGiant: 'نجم أزرق عملاق',
  },
  planets: {
    venus: 'الزهرة',
    earth: 'الأرض',
    mars: 'المريخ',
  },
  stage: {
    ariaLabel: ({ star, radius }) => `${star} وحواليه كوكب على مدار نصف قطره ${radius} وحدة فلكية`,
    distanceUnit: 'و.ف',
    vector: {
      gravity: 'الجاذبية',
      speed: 'السرعة',
    },
  },
  status: {
    starMass: ({ name, value }) => `${name} • كتلته ${value} من كتلة الشمس`,
  },
  controls: {
    starMass: 'كتلة النجم',
    starMassUnit: 'كتلة شمسية',
    orbitRadius: 'نصف قطر المدار',
    orbitRadiusUnit: 'و.ف',
    planetPreset: 'جرّب مدار كوكب حقيقي حوالين الشمس',
    vectors: 'أسهم الجاذبية والسرعة',
    vectorsDescription: 'الجاذبية دايماً ناحية النجم، والسرعة مماسة للمدار',
  },
  readings: {
    speed: 'السرعة المدارية',
    speedUnit: 'كم/ث',
    period: 'زمن الدورة',
    periodUnit: 'يوم',
    gravity: 'شدة الجذب',
    gravityUnit: '× جذب الأرض',
    orbits: 'دورات مكتملة',
    orbitsUnit: 'دورة',
  },
};
