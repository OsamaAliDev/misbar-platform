import { ALL_CATEGORY_ID, CATEGORIES, getCategoryLabel } from '../data/experiments.js';
import { useI18n } from '../i18n/index.jsx';
import './CategoryFilters.css';

/**
 * <CategoryFilters /> — subject filter pills with a total count on All.
 *
 * Toggle buttons with `aria-pressed`; exactly one is active at a time.
 *
 * @param {object}   props
 * @param {string}   props.value        active category id
 * @param {Function} props.onChange     receives the chosen category id
 * @param {number}   props.totalCount   number shown in the All pill
 * @param {string}  [props.className]
 */
export default function CategoryFilters({ value, onChange, totalCount, className = '' }) {
  const { t } = useI18n();
  return (
    <div className={`category-filters ${className}`.trim()} role="group" aria-label={t('catalog.filters.label')}>
      {CATEGORIES.map((category) => {
        const isActive = category.id === value;
        const label =
          category.id === ALL_CATEGORY_ID
            ? t('catalog.filters.allWithCount', { count: totalCount })
            : getCategoryLabel(t, category.id);

        return (
          <button
            key={category.id}
            type="button"
            className={`filter-pill filter-pill--${category.id}${isActive ? ' is-active' : ''}`}
            aria-pressed={isActive}
            onClick={() => onChange(category.id)}
          >
            {category.dot && (
              <span
                className="filter-pill__dot"
                style={{ backgroundColor: `var(--${category.dot})` }}
                aria-hidden="true"
              />
            )}
            <span className="filter-pill__label">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
