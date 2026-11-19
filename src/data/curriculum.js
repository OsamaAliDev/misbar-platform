import evidence from './curriculum-evidence.json';

/** Browsing preferences are deliberately separate from student progress. */
export const CURRICULUM_STORAGE_KEY = 'misbar:curriculum:v1';

/** Requested browsing scope, not a claim about textbook or term coverage. */
export const CURRICULUM_GRADES = Object.freeze([
  { id: 'primary-4', stage: 'primary', labelKey: 'primary4' },
  { id: 'primary-5', stage: 'primary', labelKey: 'primary5' },
  { id: 'primary-6', stage: 'primary', labelKey: 'primary6' },
  { id: 'prep-1', stage: 'prep', labelKey: 'prep1' },
  { id: 'prep-2', stage: 'prep', labelKey: 'prep2' },
  { id: 'prep-3', stage: 'prep', labelKey: 'prep3' },
]);
/* ICT appears for Primary 4 as an audited browsing path; see lessons.js. */
export const CURRICULUM_SUBJECTS = Object.freeze(['science', 'math', 'ict']);

const isSemester = (value) => value === 1 || value === 2;
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

/** Only researched numeric semesters may create a semester selection step. */
export function getCurriculumSemesters() {
  const semesters = Array.isArray(evidence.semesters) ? evidence.semesters : [];
  return [...new Set(semesters.filter(isSemester))].sort((a, b) => a - b);
}

/** Fail closed on malformed/stale localStorage, including string term numbers. */
export function normalizeCurriculumSelection(value) {
  const selection = isRecord(value) ? value : {};
  const gradeId = CURRICULUM_GRADES.some((grade) => grade.id === selection.gradeId)
    ? selection.gradeId
    : null;
  const subject = gradeId && CURRICULUM_SUBJECTS.includes(selection.subject) ? selection.subject : null;
  const semester = subject && getCurriculumSemesters().includes(selection.semester) ? selection.semester : null;
  return { gradeId, subject, semester };
}

export function getCurriculumGrade(gradeId) {
  return CURRICULUM_GRADES.find((grade) => grade.id === gradeId) ?? null;
}

/**
 * Resolve only evidence links to existing experiments, never infer from category,
 * title or science content. Each experiment appears once, even with repeated links.
 * Unknown terms stay outside a selected semester and always require teacher review.
 */
export function getCurriculumMatches(value, experiments) {
  const { gradeId, subject, semester } = normalizeCurriculumSelection(value);
  if (!gradeId || !subject) return { confirmed: [], unconfirmed: [] };

  const mappings = (Array.isArray(evidence.mappings) ? evidence.mappings : []).filter(
    (mapping) => isRecord(mapping) && mapping.gradeId === gradeId && mapping.subject === subject,
  );
  const confirmed = [];
  const unconfirmed = [];

  for (const experiment of experiments) {
    const links = mappings.filter((mapping) => mapping.experimentId === experiment.id);
    if (links.length === 0) continue;

    // A malformed terms array is not evidence for any term.
    const knownLinks = links.filter(
      (mapping) => Array.isArray(mapping.terms) && mapping.terms.length > 0 && mapping.terms.every(isSemester),
    );
    const relevantLinks = semester === null
      ? knownLinks
      : knownLinks.filter((mapping) => mapping.terms.includes(semester));
    const unknownLinks = links.filter((mapping) => !knownLinks.includes(mapping));
    if (relevantLinks.length === 0 && unknownLinks.length === 0) continue;

    const terms = [...new Set(relevantLinks.flatMap((mapping) => mapping.terms))].sort((a, b) => a - b);
    const termUnconfirmed = terms.length === 0;
    const match = {
      experiment,
      sourceUrls: [...new Set([...relevantLinks, ...unknownLinks].flatMap((link) => Array.isArray(link.sourceUrls) ? link.sourceUrls : []))].filter((url) => typeof url === 'string' && url.startsWith('https://')),
      terms,
      termUnconfirmed,
      needsTeacherReview: termUnconfirmed || relevantLinks.some((mapping) => mapping.status !== 'verified'),
    };
    (termUnconfirmed ? unconfirmed : confirmed).push(match);
  }

  return { confirmed, unconfirmed };
}
