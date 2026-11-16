/** Strings for the matter-states simulation (ar). */
export default {
  states: {
    solid: 'صلب',
    liquid: 'سائل',
    gas: 'غاز',
    melting: 'بينصهر',
    freezing: 'بيتجمد',
    boiling: 'بيغلي',
    condensing: 'بيتكثف',
  },
  units: {
    degree: '°',
    celsius: '°م',
    ariaCelsius: 'درجة مئوية',
    speed: 'م/ث',
  },
  temperatures: {
    melting: '٠°م',
    boiling: '١٠٠°م',
  },
  stage: {
    ariaLabel: 'حجرة فيها جزيئات مية في الحالة: {state}، ودرجة الحرارة {temperature} {unit}',
    heaterOn: 'السخّان شغّال',
    coolerOn: 'التبريد شغّال',
    stableTemperature: 'درجة الحرارة ثابتة',
  },
  status: {
    solid: 'صلب: الجزيئات بتتذبذب في أماكنها',
    melting: '{state}… الحرارة ثابتة عند {temperature} لحد ما التحوّل يخلص',
    liquid: 'سائل: الجزيئات بتنزلق جنب بعض',
    boiling: '{state}… الحرارة ثابتة عند {temperature} لحد ما التحوّل يخلص',
    gas: 'غاز: الجزيئات بتطير بحرية في الحجرة كلها',
  },
  controls: {
    heaterTemperature: 'درجة حرارة السخّان',
    quickControl: 'تحكم سريع',
    prepare: 'حضّر المادة بسرعة',
    actions: {
      heat: 'سخّن',
      cool: 'برّد',
    },
  },
  materials: {
    ice: 'ثلج',
    water: 'مية',
    steam: 'بخار',
  },
  readings: {
    temperature: 'درجة حرارة المادة',
    state: 'الحالة',
    particleSpeed: 'سرعة الجزيئات',
    shapeVolume: 'الشكل والحجم',
  },
  shape: {
    solid: 'شكل وحجم ثابتين',
    gas: 'بيملا الحجرة كلها',
    liquid: 'حجم ثابت وشكل متغيّر',
  },
};
