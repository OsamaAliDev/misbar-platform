export default {
  title: 'Browse by grade',
  intro: 'Choose your grade, then a subject, to explore curriculum-linked experiments.',
  stages: { primary: 'Primary school', prep: 'Preparatory school' },
  grades: {
    primary4: 'Primary 4',
    primary5: 'Primary 5',
    primary6: 'Primary 6',
    prep1: 'Preparatory 1',
    prep2: 'Preparatory 2',
    prep3: 'Preparatory 3',
  },
  subjects: { science: 'Science', math: 'Math' },
  semesters: { 1: 'First semester', 2: 'Second semester' },
  chooseSubject: 'Choose a subject',
  chooseSemester: 'Choose a semester',
  resultsTitle: 'Experiments for this selection',
  pathLabel: 'Curriculum browsing path',
  back: 'Back one step',
  allGrades: 'All grades',
  allExperiments: 'All experiments',
  freeTitle: 'All experiments — quick free play',
  freeText: "Start any experiment without choosing a grade or subject. Free play is not curriculum approval; grade links for lever balance and refraction still need teacher review.",
  comingSoon: {
    title: 'Experiments for this selection are coming soon',
    text: 'We are checking curriculum links. In the meantime, explore all six experiments in free play.',
  },
  verified: 'Curriculum link verified',
  needsTeacherReview: 'Needs teacher review',
  termUnconfirmed: 'Semester unconfirmed',
  unknownTitle: 'Links with an unconfirmed semester',
  unknownText: 'These links are not assigned to a semester and still need a teacher’s review.',
  scopeNotice: "The live textbook lists could not be opened. Semesters are browsing labels; showing the second semester does not mean its current book was checked. Review-marked links are not approved lessons.",
  source: "Link source",
  mappingNotes: {
  "primary-4": {
    "motion-acceleration": "Science semester-one pages 78–89 support wind and rubber-band car motion, not calculating acceleration from force and mass. The quantitative model needs teacher review."
  },
  "primary-5": {
    "fractions-area": "The evidence is decimal fractions shown with area on pages 4–5 and 99, not every fraction denominator or the percentage display.",
    "matter-states": "Pages 92–99 support evaporation and condensation in the water cycle, not the full three-state curve at 0 and 100 degrees."
  },
  "prep-1": {
    "planet-orbits": "A candidate from an unofficial 2025 contents list, page 80. The current edition and orbit-model details were not verified; teacher review is required."
  },
  "prep-2": {
    "matter-states": "Semester-one pages 10–16 support water state changes, heating and cooling. The 0 and 100 degree transitions assume pure water at normal atmospheric pressure."
  }
},
  gridLabel: 'Experiments linked to the curriculum selection',
  unknownGridLabel: 'Experiments with an unconfirmed semester',
};
