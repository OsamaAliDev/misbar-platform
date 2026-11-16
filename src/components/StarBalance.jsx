import { useI18n } from '../i18n/index.jsx';
import { formatNumber } from '../lib/arabic.js';
import { useStudent } from '../state/student.jsx';
import Icon from './Icon.jsx';
import './StarBalance.css';

/**
 * <StarBalance /> — the student's star total (reward colour family).
 * Shows "١٢ نجمة" / "12 stars"; on phones only the number is visible and
 * the full sentence stays in the accessible label.
 */
export default function StarBalance({ className = '' }) {
  const { student } = useStudent();
  const { t } = useI18n();
  return (
    <div
      className={`star-balance ${className}`.trim()}
      role="status"
      aria-label={t('common.starBalanceLabel', { count: student.stars })}
    >
      <Icon name="star" filled size={22} />
      <span aria-hidden="true">
        {formatNumber(student.stars)}
        <span className="star-balance__unit"> {t('common.starsUnit')}</span>
      </span>
    </div>
  );
}
