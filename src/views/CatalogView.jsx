import { useDeferredValue, useMemo } from 'react';
import CategoryFilters from '../components/CategoryFilters.jsx';
import ExperimentCard from '../components/ExperimentCard.jsx';
import Icon from '../components/Icon.jsx';
import MascotGreeting from '../components/MascotGreeting.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { ALL_CATEGORY_ID, EXPERIMENTS, filterExperiments } from '../data/experiments.js';
import { formatNumber } from '../lib/arabic.js';
import './CatalogView.css';

/** Arabic result-count sentence for the screen-reader live region. */
function describeResults(count) {
  if (count === 0) return 'لا توجد تجارب مطابقة';
  if (count === 1) return 'تجربة واحدة';
  if (count === 2) return 'تجربتان';
  if (count <= 10) return `${formatNumber(count)} تجارب`;
  return `${formatNumber(count)} تجربة`;
}

/**
 * <CatalogView /> — the Interactive Experiments Catalog.
 *
 * Filter state (search text + category) is owned by <App /> so that it is
 * preserved when the student opens a placeholder view and comes back.
 *
 * @param {object}   props
 * @param {{ query: string, category: string }} props.filters
 * @param {Function} props.onFiltersChange   receives a partial filters object
 * @param {Function} props.onStartExperiment receives an experiment id
 */
export default function CatalogView({ filters, onFiltersChange, onStartExperiment }) {
  // Keep typing responsive even on slow devices.
  const deferredQuery = useDeferredValue(filters.query);

  const results = useMemo(
    () => filterExperiments(EXPERIMENTS, { query: deferredQuery, category: filters.category }),
    [deferredQuery, filters.category],
  );

  const isFiltered = filters.query.trim() !== '' || filters.category !== ALL_CATEGORY_ID;

  const resetFilters = () => onFiltersChange({ query: '', category: ALL_CATEGORY_ID });

  return (
    <div className="catalog">
      <h1 id="view-heading" className="visually-hidden" tabIndex={-1}>
        مكتبة التجارب التفاعلية
      </h1>

      {/* Nour's welcome strip (tablet & mobile; on desktop it sits in the header). */}
      <MascotGreeting variant="strip" />

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
        {isFiltered ? `النتائج: ${describeResults(results.length)}` : ''}
      </p>

      {results.length > 0 ? (
        <ul className="catalog__grid" aria-label="التجارب">
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
          <h2 className="catalog__empty-title">مالقيناش تجربة بالاسم ده</h2>
          <p className="catalog__empty-text">جرّب كلمة تانية أو اختار مادة مختلفة.</p>
          <button type="button" className="btn btn--neutral" onClick={resetFilters}>
            <Icon name="restart_alt" size={20} />
            <span>عرض كل التجارب</span>
          </button>
        </div>
      )}
    </div>
  );
}
