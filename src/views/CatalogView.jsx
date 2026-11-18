import { useDeferredValue, useMemo } from 'react';
import CategoryFilters from '../components/CategoryFilters.jsx';
import CurriculumBrowser from '../components/CurriculumBrowser.jsx';
import ExperimentCard from '../components/ExperimentCard.jsx';
import Icon from '../components/Icon.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { normalizeCurriculumSelection } from '../data/curriculum.js';
import { ALL_CATEGORY_ID, EXPERIMENTS, buildSearchIndex, filterExperiments } from '../data/experiments.js';
import { useI18n } from '../i18n/index.jsx';
import './CatalogView.css';

/**
 * <CatalogView /> — curriculum browsing plus the quick free-play catalog.
 *
 * Search, category and curriculum selection are controlled by <App /> and
 * preserved across a trip to the lab. Curriculum has its own storage key.
 *
 * @param {object}   props
 * @param {{ query: string, category: string, curriculum: object }} props.filters
 * @param {Function} props.onFiltersChange   receives a partial filters object
 * @param {Function} props.onStartExperiment receives an experiment id
 */
export default function CatalogView({ filters, onFiltersChange, onStartExperiment }) {
  const { t } = useI18n();
  const curriculum = normalizeCurriculumSelection(filters.curriculum);
  // The translation helper changes only with language, not on each keystroke.
  const searchIndex = useMemo(() => buildSearchIndex(t), [t]);
  // Keep typing responsive even on slow devices.
  const deferredQuery = useDeferredValue(filters.query);

  const results = useMemo(
    () => filterExperiments(EXPERIMENTS, { query: deferredQuery, category: filters.category }, searchIndex),
    [deferredQuery, filters.category, searchIndex],
  );

  const isFiltered = filters.query.trim() !== '' || filters.category !== ALL_CATEGORY_ID;
  const resetFilters = () => onFiltersChange({ query: '', category: ALL_CATEGORY_ID });
  const showAllExperiments = () => onFiltersChange({
    query: '',
    category: ALL_CATEGORY_ID,
    curriculum: normalizeCurriculumSelection(null),
  });

  return (
    <div className="catalog">
      <h1 id="view-heading" className="visually-hidden" tabIndex={-1}>
        {t('catalog.title')}
      </h1>

      <CurriculumBrowser
        value={curriculum}
        onChange={(selection) => onFiltersChange({ curriculum: selection })}
        onShowAllExperiments={showAllExperiments}
        onStartExperiment={onStartExperiment}
      />

      {/* Mount only one set of cards: their experiment-title IDs must be unique. */}
      {!curriculum.gradeId && (
        <>
          <div className="curriculum-free-heading">
            <h2>{t('curriculum.freeTitle')}</h2>
            <p>{t('curriculum.freeText')}</p>
          </div>

          <div className="catalog__toolbar">
            <CategoryFilters
              className="catalog__filters"
              value={filters.category}
              totalCount={EXPERIMENTS.length}
              onChange={(category) => onFiltersChange({ category })}
            />
            <SearchBar
              className="catalog__search"
              value={filters.query}
              onChange={(query) => onFiltersChange({ query })}
            />
          </div>

          {/* Announce result changes to screen readers. */}
          <p className="visually-hidden" aria-live="polite" aria-atomic="true">
            {isFiltered ? t('catalog.results', { count: results.length }) : ''}
          </p>

          {results.length > 0 ? (
            <ul className="catalog__grid" aria-label={t('catalog.gridLabel')}>
              {results.map((experiment) => (
                <li key={experiment.id} className="catalog__grid-item">
                  <ExperimentCard experiment={experiment} onStart={onStartExperiment} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="card catalog__empty">
              <span className="catalog__empty-icon" aria-hidden="true">
                <Icon name="search_off" size={32} />
              </span>
              <h2 className="catalog__empty-title">{t('catalog.empty.title')}</h2>
              <p className="catalog__empty-text">{t('catalog.empty.text')}</p>
              <button type="button" className="btn btn--neutral" onClick={resetFilters}>
                <Icon name="restart_alt" size={20} />
                <span>{t('catalog.empty.showAll')}</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
