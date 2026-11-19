import { useEffect, useMemo, useRef } from 'react';
import {
  CURRICULUM_GRADES,
  CURRICULUM_SUBJECTS,
  getCurriculumGrade,
  getCurriculumMatches,
  getCurriculumSemesters,
  normalizeCurriculumSelection,
} from '../data/curriculum.js';
import { EXPERIMENTS } from '../data/experiments.js';
import { useI18n } from '../i18n/index.jsx';
import ExperimentCard from './ExperimentCard.jsx';
import LessonBrowser from './LessonBrowser.jsx';
import './CurriculumBrowser.css';

/** No curriculum claim is inferred here; all links come from the evidence file. */
export default function CurriculumBrowser({ value, onChange, onShowAllExperiments, onStartExperiment }) {
  const { t } = useI18n();
  const selection = normalizeCurriculumSelection(value);
  const { gradeId, subject, semester } = selection;
  const grade = getCurriculumGrade(gradeId);
  const semesters = getCurriculumSemesters();
  const needsSemester = semesters.length > 0;
  const showResults = Boolean(subject) && (!needsSemester || semester !== null);
  /* Primary 4 gets lesson-level browsing (Science/Math/ICT) from the audit. */
  const showsLessons = gradeId === 'primary-4' && Boolean(subject);
  const matches = useMemo(
    () => getCurriculumMatches({ gradeId, subject, semester }, EXPERIMENTS),
    [gradeId, subject, semester],
  );

  const headingRef = useRef(null);
  const stepKey = `${gradeId ?? ''}/${subject ?? ''}/${semester ?? ''}`;
  const previousStep = useRef(stepKey);
  useEffect(() => {
    // Comparing keys also avoids first-mount focus in React StrictMode.
    if (previousStep.current === stepKey) return;
    previousStep.current = stepKey;
    headingRef.current?.focus();
  }, [stepKey]);

  const goBack = () => {
    if (semester !== null) onChange({ gradeId, subject, semester: null });
    else if (subject) onChange({ gradeId, subject: null, semester: null });
    else onShowAllExperiments();
  };

  const titleKey = !grade
    ? 'title'
    : !subject
      ? 'chooseSubject'
      : needsSemester && semester === null
        ? 'chooseSemester'
        : 'resultsTitle';
  const path = [t('curriculum.allGrades')];
  if (grade) path.push(t(`curriculum.grades.${grade.labelKey}`));
  if (subject) path.push(t(`curriculum.subjects.${subject}`));
  if (semester !== null) path.push(t(`curriculum.semesters.${semester}`));

  const renderMatches = (items, unknown = false) => (
    <ul
      className="catalog__grid"
      aria-label={t(unknown ? 'curriculum.unknownGridLabel' : 'curriculum.gridLabel')}
    >
      {items.map((match) => (
        <li key={match.experiment.id} className="catalog__grid-item curriculum-browser__result">
          <p className={`curriculum-browser__notes${match.needsTeacherReview ? ' curriculum-browser__notes--review' : ''}`}>
            {match.termUnconfirmed ? (
              <span>{t('curriculum.termUnconfirmed')}</span>
            ) : (
              match.terms
                .filter((term) => semester === null || term === semester)
                .map((term) => <span key={term}>{t(`curriculum.semesters.${term}`)}</span>)
            )}
            <span>{t(match.needsTeacherReview ? 'curriculum.needsTeacherReview' : 'curriculum.verified')}</span>
          </p>
          <p className="curriculum-browser__explanation">{t(`curriculum.mappingNotes.${gradeId}.${match.experiment.id}`)}</p>
          {match.sourceUrls.length > 0 && (
            <a className="btn btn--neutral curriculum-browser__source" href={match.sourceUrls[0]} target="_blank" rel="noreferrer">
              {t('curriculum.source')}
            </a>
          )}
          <ExperimentCard experiment={match.experiment} onStart={onStartExperiment} />
        </li>
      ))}
    </ul>
  );

  return (
    <section className="curriculum-browser" data-testid="curriculum-browser" aria-labelledby="curriculum-heading">
      <div className="card curriculum-browser__panel">
        <div className="curriculum-browser__header">
          <h2 id="curriculum-heading" ref={headingRef} className="curriculum-browser__title" tabIndex={-1}>
            {t(`curriculum.${titleKey}`)}
          </h2>
          {!grade && <p className="curriculum-browser__intro">{t('curriculum.intro')}</p>}
          {grade && (
            <nav aria-label={t('curriculum.pathLabel')}>
              <ol className="curriculum-browser__path">
                {path.map((label, index) => (
                  <li key={index} aria-current={index === path.length - 1 ? 'step' : undefined}>
                    {label}
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </div>

        {grade && (
          <div className="curriculum-browser__actions">
            <button type="button" className="btn btn--neutral" onClick={goBack}>
              {t('curriculum.back')}
            </button>
            <button type="button" className="btn btn--neutral" onClick={onShowAllExperiments}>
              {t('curriculum.allGrades')}
            </button>
            <button type="button" className="btn btn--primary" data-action="free-experiments" onClick={onShowAllExperiments}>
              {t('curriculum.allExperiments')}
            </button>
          </div>
        )}

        {!grade && (
          <div className="curriculum-browser__stages">
            {['primary', 'prep'].map((stage) => (
              <section key={stage} className="curriculum-browser__group" aria-labelledby={`curriculum-stage-${stage}`}>
                <h3 id={`curriculum-stage-${stage}`}>{t(`curriculum.stages.${stage}`)}</h3>
                <ul className="curriculum-browser__choices">
                  {CURRICULUM_GRADES.filter((item) => item.stage === stage).map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className="btn btn--neutral curriculum-browser__choice"
                        data-grade-id={item.id}
                        onClick={() => onChange({ gradeId: item.id, subject: null, semester: null })}
                      >
                        {t(`curriculum.grades.${item.labelKey}`)}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        {grade && !subject && (
          <ul className="curriculum-browser__choices curriculum-browser__choices--subjects">
            {CURRICULUM_SUBJECTS.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  className="btn btn--neutral curriculum-browser__choice"
                  data-subject-id={item}
                  onClick={() => onChange({ gradeId, subject: item, semester: null })}
                >
                  {t(`curriculum.subjects.${item}`)}
                </button>
              </li>
            ))}
          </ul>
        )}

        {subject && needsSemester && semester === null && (
          <ul className="curriculum-browser__choices curriculum-browser__choices--semesters">
            {semesters.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  className="btn btn--neutral curriculum-browser__choice"
                  data-term-id={item}
                  onClick={() => onChange({ gradeId, subject, semester: item })}
                >
                  {t(`curriculum.semesters.${item}`)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showResults && (
        <>
          <p className="curriculum-browser__scope">{t('curriculum.scopeNotice')}</p>
          {showsLessons ? (
            <LessonBrowser
              subject={subject}
              semester={semester}
              onOpenExperiment={onStartExperiment}
            />
          ) : (
            <>
              {matches.confirmed.length > 0 ? renderMatches(matches.confirmed) : (
                <div className="card curriculum-browser__empty">
                  <h3>{t('curriculum.comingSoon.title')}</h3>
                  <p>{t('curriculum.comingSoon.text')}</p>
                </div>
              )}
              {matches.unconfirmed.length > 0 && (
                <section className="curriculum-browser__results" aria-labelledby="curriculum-unknown-heading">
                  <h3 id="curriculum-unknown-heading">{t('curriculum.unknownTitle')}</h3>
                  <p>{t('curriculum.unknownText')}</p>
                  {renderMatches(matches.unconfirmed, true)}
                </section>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
