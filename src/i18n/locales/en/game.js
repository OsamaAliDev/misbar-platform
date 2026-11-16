/** Game screens (lobby · heroes · vault · ranks) — English. */
export default {
  nav: {
    label: 'Game screens',
    lobby: 'Lobby',
    heroes: 'Heroes',
    vault: 'Vault',
    ranks: 'Ranks',
    library: 'Library',
    libraryLong: 'Experiment library',
  },
  titles: {
    lobby: 'Hero Lobby',
    heroes: 'Choose your hero',
    vault: 'Outfit Vault',
    ranks: 'Rank Ladder',
  },

  heroSelect: {
    eyebrow: 'Team Misbar',
    title: 'Choose your hero',
    subtitle: 'Your hero becomes your guide in every experiment, with tips and cheers along the way.',
    groupLabel: 'The five heroes',
    chosen: 'Chosen',
    saved: ({ name }) => `Saved! ${name} will guide you in every experiment.`,
    pickFirst: 'Pick a hero to continue.',
    continue: ({ name }) => `Go to the lobby with ${name}`,
  },

  lobby: {
    title: 'Hero Lobby',
    greeting: ({ nickname }) => `Hi, ${nickname}!`,
    guideLabel: 'Your guide',
    changeHero: 'Change hero',
    starsLabel: 'Your stars',
    rankLabel: 'Your rank',
    toNextRank: ({ stars, rank }) => `${stars} more to reach “${rank}”.`,
    topRank: 'You reached the top rank! Amazing work.',
    allRanks: 'All ranks',
    vaultLink: 'Outfit vault',
    missionsTitle: 'Your missions',
    missionsHint: 'Finish experiment challenges to complete missions and earn bonus stars.',
    enterLibrary: 'Enter the experiment library',
    rankProgressLabel: 'Progress to the next rank',
  },

  missions: {
    reward: ({ stars }) => `Reward: ${stars}`,
    claim: 'Collect stars',
    claimed: 'Collected',
    inProgress: 'In progress',
    ready: 'Ready!',
    progressLabel: 'Mission progress',
    items: {
      'first-discovery': {
        title: 'First Discovery',
        description: 'Finish 1 experiment challenge.',
      },
      'two-experiments': {
        title: 'Busy Scientist',
        description: 'Finish 2 experiment challenges.',
      },
      'science-tour': {
        title: 'Science Tour',
        description: 'Finish a challenge in physics, math and astronomy.',
      },
    },
  },

  ranks: {
    title: 'Rank Ladder',
    subtitle: 'Every star you earn moves you up. Ranks are based on your total stars.',
    current: 'Current rank',
    reached: 'Reached',
    needs: ({ stars }) => `Needs ${stars}`,
    from: ({ stars }) => `From ${stars}`,
    ladderLabel: 'The five ranks',
    items: {
      'young-explorer': {
        name: 'Young Explorer',
        description: 'The journey begins: every question is a new discovery.',
      },
      inventor: {
        name: 'Inventor',
        description: 'You test your own ideas and see the results.',
      },
      'lab-captain': {
        name: 'Lab Captain',
        description: 'You know the tools and plan your experiments well.',
      },
      'discovery-commander': {
        name: 'Discovery Commander',
        description: 'You connect different sciences and spot patterns.',
      },
      'master-scientist': {
        name: 'Master Scientist',
        description: 'Every challenge and mission done. A role model for the team!',
      },
    },
  },

  vault: {
    title: 'Outfit Vault',
    subtitle: 'Every hero starts with an outfit. New outfit slots unlock as your stars grow.',
    heroPickerLabel: 'Choose a hero to see their outfits',
    slotName: ({ slot }) => `Outfit ${slot}`,
    starter: 'Starter outfit',
    wearing: 'Wearing now',
    unlocksAt: ({ stars }) => `Unlocks at ${stars}`,
    moreNeeded: ({ stars }) => `${stars} to go`,
    unlock: 'Unlock slot',
    unlocked: 'Unlocked! Design coming soon',
    note: 'Unlocking never spends your stars.',
    slotsLabel: ({ name }) => `${name}'s outfits`,
  },
};
