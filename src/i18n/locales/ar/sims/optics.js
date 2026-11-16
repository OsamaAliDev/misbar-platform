/** Strings for the light-refraction simulation (ar). */
export default {
  media: {
    air: 'الهواء',
    water: 'الماء',
    glass: 'الزجاج',
  },
  units: {
    degree: '°',
    degreeWord: 'درجة',
    percent: '٪',
  },
  stage: {
    ariaLabel: 'شعاع ضوء خارج من {from} إلى {to} بزاوية سقوط {angle} {degreeWord}',
    refractiveIndex: 'معامل الانكسار {value}',
  },
  status: {
    totalReflection: 'انعكاس كلّي داخلي! الضوء كله ارتد ومعدّاش',
    sameMedium: 'نفس الوسط: الضوء بيكمل في خط مستقيم من غير انكسار',
    straightOn: 'الضوء نازل عمودي على السطح، فمش بيغيّر اتجاهه',
    denser: 'الضوء دخل وسط أكثف، فقرّب من العمود المقام',
    lessDense: 'الضوء دخل وسط أقل كثافة، فبعد عن العمود المقام',
  },
  controls: {
    incidenceAngle: 'زاوية السقوط',
    firstMedium: 'الوسط الأول (اللي جاي منه الضوء)',
    secondMedium: 'الوسط التاني',
  },
  readings: {
    incidenceAngle: 'زاوية السقوط',
    reflectionAngle: 'زاوية الانعكاس',
    refractionAngle: 'زاوية الانكسار',
    criticalAngle: 'الزاوية الحرجة',
    reflectedLight: 'الضوء المنعكس',
    noRefraction: 'مفيش انكسار',
    none: 'مفيش',
  },
};
