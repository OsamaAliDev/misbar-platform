/** Game screens (lobby · heroes · vault · ranks) — Arabic (default). */
export default {
  nav: {
    label: 'شاشات اللعبة',
    lobby: 'الساحة',
    heroes: 'الأبطال',
    vault: 'الأزياء',
    ranks: 'الرتب',
    library: 'المكتبة',
    libraryLong: 'مكتبة التجارب',
  },
  titles: {
    lobby: 'ساحة الأبطال',
    heroes: 'اختار بطلك',
    vault: 'خزانة الأزياء',
    ranks: 'سلّم الرتب',
  },

  heroSelect: {
    eyebrow: 'فريق مِسبار',
    title: 'اختار بطلك',
    subtitle: 'البطل اللي تختاره هيبقى دليلك في كل تجربة: هيديك نصايح ويفرح معاك.',
    groupLabel: 'الأبطال الخمسة',
    chosen: 'مختار',
    saved: ({ name }) => `تم الحفظ! ${name} معاك في كل تجربة.`,
    pickFirst: 'اختار بطل عشان تكمّل.',
    continue: ({ name }) => `يلا على الساحة مع ${name}`,
  },

  lobby: {
    title: 'ساحة الأبطال',
    greeting: ({ nickname }) => `أهلاً يا ${nickname}!`,
    guideLabel: 'دليلك',
    changeHero: 'غيّر البطل',
    starsLabel: 'نجومك',
    rankLabel: 'رتبتك',
    toNextRank: ({ stars, rank }) => `فاضل ${stars} وتوصل لرتبة «${rank}».`,
    topRank: 'وصلت لأعلى رتبة! برافو عليك.',
    allRanks: 'كل الرتب',
    vaultLink: 'خزانة الأزياء',
    missionsTitle: 'مهامك',
    missionsHint: 'خلّص تحديات التجارب عشان تكمّل المهام وتكسب نجوم زيادة.',
    enterLibrary: 'ادخل مكتبة التجارب',
    rankProgressLabel: 'التقدم للرتبة الجاية',
  },

  missions: {
    reward: ({ stars }) => `المكافأة: ${stars}`,
    claim: 'خُد النجوم',
    claimed: 'اتسلّمت',
    inProgress: 'لسه شغّالين',
    ready: 'جاهزة!',
    progressLabel: 'تقدّم المهمة',
    items: {
      'first-discovery': {
        title: 'أول اكتشاف',
        description: 'خلّص تحدي تجربة واحدة.',
      },
      'two-experiments': {
        title: 'عالِم نشيط',
        description: 'خلّص تحديات تجربتين.',
      },
      'science-tour': {
        title: 'جولة العلوم',
        description: 'خلّص تحدي في الفيزياء والرياضيات والفلك.',
      },
    },
  },

  ranks: {
    title: 'سلّم الرتب',
    subtitle: 'كل نجمة بتكسبها بتطلّعك لفوق. الرتب بتتحسب من مجموع نجومك.',
    current: 'رتبتك الحالية',
    reached: 'وصلت لها',
    needs: ({ stars }) => `محتاجة ${stars}`,
    from: ({ stars }) => `من ${stars}`,
    ladderLabel: 'الرتب الخمسة',
    items: {
      'young-explorer': {
        name: 'المستكشف الصغير',
        description: 'بداية الرحلة: كل سؤال هو اكتشاف جديد.',
      },
      inventor: {
        name: 'المخترع',
        description: 'بتجرّب أفكارك وبتشوف نتيجتها بنفسك.',
      },
      'lab-captain': {
        name: 'كابتن المعمل',
        description: 'فاهم الأدوات وبتنظّم تجاربك كويس.',
      },
      'discovery-commander': {
        name: 'قائد الاكتشافات',
        description: 'بتربط بين العلوم المختلفة وبتلاقي الأنماط.',
      },
      'master-scientist': {
        name: 'العالِم الكبير',
        description: 'خلّصت كل التحديات والمهام. إنت قدوة للفريق!',
      },
    },
  },

  vault: {
    title: 'خزانة الأزياء',
    subtitle: 'كل بطل معاه زيّه الأساسي. أماكن الأزياء الجديدة بتتفتح لما نجومك تزيد.',
    heroPickerLabel: 'اختار بطل تشوف أزياءه',
    slotName: ({ slot }) => `زي رقم ${slot}`,
    starter: 'الزي الأساسي',
    wearing: 'لابسه دلوقتي',
    unlocksAt: ({ stars }) => `يتفتح عند ${stars}`,
    moreNeeded: ({ stars }) => `فاضل ${stars}`,
    unlock: 'افتح المكان',
    unlocked: 'اتفتح! التصميم جاي قريب',
    note: 'فتح الأزياء مش بيصرف نجومك.',
    slotsLabel: ({ name }) => `أزياء ${name}`,
  },
};
