import { getP4Lessons, countP4Lessons, P4_ICT } from '../data/lessons.js';
import { useI18n } from '../i18n/index.jsx';
import Icon from './Icon.jsx';
import './LessonBrowser.css';

/**
 * <LessonBrowser /> — the Primary 4 Term 1 lesson catalog.
 *
 * One row per audited textbook lesson with its cited pages. A lesson either
 * opens an EXISTING simulation the audit matched to it (candidates keep the
 * teacher-review label) or shows the honest "coming soon" state: the lesson
 * game is produced only after the corresponding book arrives, exactly as the
 * product owner instructed. Nothing here invents textbook content.
 *
 * @param {object}   props
 * @param {string}   props.subject          'science' | 'math' | 'ict'
 * @param {number}   props.semester         1 | 2
 * @param {Function} props.onOpenExperiment receives an existing experiment id
 */
export default function LessonBrowser({ subject, semester, onOpenExperiment }) {
  const { t, lang } = useI18n();
  const subjectLabel = t(`curriculum.subjects.${subject}`);

  /* No current Term 2 book was audited for any subject: state it plainly. */
  if (semester === 2) {
    return (
      <div className="card lesson-browser__term2">
        <h3>{t('lessons.term2Soon.title')}</h3>
        <p>{t('lessons.term2Soon.text')}</p>
      </div>
    );
  }

  /* ICT has no audited full index yet: verified lessons + an explicit wait. */
  if (subject === 'ict') {
    return (
      <section className="lesson-browser" data-testid="lesson-browser" aria-labelledby="lessons-heading">
        <div className="card lesson-browser__intro">
          <h3 id="lessons-heading">{t('lessons.ictIntro')}</h3>
        </div>
        <ul className="lesson-browser__list" aria-label={subjectLabel}>
          {P4_ICT.verifiedLessons.map((lesson) => (
            <li key={lesson.num} className="card lesson-row lesson-row--soon">
              <span className="lesson-row__num" aria-hidden="true">{lesson.num}</span>
              <div className="lesson-row__body">
                <p className="lesson-row__title">{lesson.title[lang]}</p>
                <p className="lesson-row__pages">
                  {t('lessons.ictLessonLabel')} · {lang === 'ar' ? 'مطبوعة' : 'printed'} {lesson.printed}
                </p>
                <p className="lesson-row__wait">{t('lessons.soonWait')}</p>
              </div>
              <span className="badge badge--reward lesson-row__chip">
                <Icon name="lock" size={14} />
                {t('lessons.soonChip')}
              </span>
            </li>
          ))}
        </ul>
        <p className="lesson-browser__note">{t('lessons.progressSoon')}</p>
      </section>
    );
  }

  const groups = getP4Lessons(subject);
  if (!groups) return null;

  return (
    <section className="lesson-browser" data-testid="lesson-browser" aria-labelledby="lessons-heading">
      <div className="lesson-browser__intro">
        <h3 id="lessons-heading">
          {t('lessons.heading', { subject: subjectLabel, term: semester })}
          <span className="lesson-browser__count">{t('lessons.countLabel', { count: countP4Lessons(subject) })}</span>
        </h3>
        <p className="lesson-browser__note">{t('lessons.sourceNote')}</p>
      </div>

      {groups.map((group) => (
        <div className="lesson-browser__group" key={group.num}>
          <h4 className="lesson-browser__group-title">
            {`${group.num} — ${group.title[lang]}`}
          </h4>
          <ul className="lesson-browser__list" aria-label={group.title[lang]}>
            {group.lessons.map((lesson) => {
              const playable = Boolean(lesson.link);
              const verified = playable && lesson.link.verified;
              return (
                <li
                  key={lesson.num}
                  className={`card lesson-row ${playable ? 'lesson-row--open' : 'lesson-row--soon'}`}
                >
                  <span className="lesson-row__num" aria-hidden="true">{lesson.num}</span>
                  <div className="lesson-row__body">
                    <p className="lesson-row__title">{lesson.title[lang]}</p>
                    <p className="lesson-row__pages">
                      {lang === 'ar' ? 'صفحات الكتاب' : 'book pages'} {lesson.printed}
                      {' · '}
                      {lang === 'ar' ? 'ملف PDF' : 'PDF'} {lesson.pdf}
                    </p>
                    {playable ? (
                      <p className="lesson-row__note">{t(verified ? 'lessons.verifiedNote' : 'lessons.reviewNote')}</p>
                    ) : (
                      <p className="lesson-row__wait">{t('lessons.soonWait')}</p>
                    )}
                  </div>
                  <div className="lesson-row__side">
                    {playable ? (
                      <>
                        <span className={`badge ${verified ? 'badge--primary' : 'badge--help'} lesson-row__chip`}>
                          <Icon name={verified ? 'check_circle' : 'help'} size={14} />
                          {verified ? t('curriculum.verified') : t('curriculum.needsTeacherReview')}
                        </span>
                        <button
                          type="button"
                          className="btn btn--primary lesson-row__open"
                          onClick={() => onOpenExperiment(lesson.link.experimentId)}
                        >
                          {t('lessons.openButton')}
                        </button>
                      </>
                    ) : (
                      <span className="badge badge--reward lesson-row__chip">
                        <Icon name="lock" size={14} />
                        {t('lessons.soonChip')}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <p className="lesson-browser__note">{t('lessons.progressSoon')}</p>
    </section>
  );
}
