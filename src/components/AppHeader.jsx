import { useStudent } from '../state/student.jsx';
import { formatNumber, formatStarCount } from '../lib/arabic.js';
import Avatar from './Avatar.jsx';
import BrandMark from './BrandMark.jsx';
import Icon from './Icon.jsx';
import MascotGreeting from './MascotGreeting.jsx';
import './AppHeader.css';

/**
 * <AppHeader /> — catalog top bar (Stitch Catalog header).
 *
 * Start (right): logo + wordmark, and on wide screens Nour's greeting badge.
 * End (left):    the student's avatar & nickname, star balance, and the
 *                "لوحة المعلم وولي الأمر" portal button.
 *
 * @param {object}   props
 * @param {Function} props.onOpenDashboard   called when the portal button is pressed
 * @param {boolean} [props.isDashboardOpen]  marks the button as the current page
 */
export default function AppHeader({ onOpenDashboard, isDashboardOpen = false }) {
  const { student } = useStudent();

  return (
    <header className="app-header">
      <div className="app-header__start">
        <BrandMark />
        <span className="app-header__divider" aria-hidden="true" />
        <MascotGreeting variant="badge" className="app-header__greeting" />
      </div>

      <div className="app-header__end">
        {/* Student identity: nickname + geometric avatar only (no personal data). */}
        <div className="student-chip" title={student.nickname}>
          <Avatar avatarId={student.avatarId} size={36} />
          <span className="student-chip__name">{student.nickname}</span>
        </div>

        {/* Star balance — reward colour family. */}
        <div className="star-balance" role="status" aria-label={`رصيدك: ${formatStarCount(student.stars)}`}>
          <Icon name="star" filled size={22} />
          <span aria-hidden="true">
            {formatNumber(student.stars)}
            <span className="star-balance__unit"> نجمة</span>
          </span>
        </div>

        <button
          type="button"
          id="open-dashboard"
          className="btn btn--neutral teacher-btn"
          aria-current={isDashboardOpen ? 'page' : undefined}
          onClick={onOpenDashboard}
        >
          <Icon name="supervisor_account" size={20} className="teacher-btn__icon" />
          <span className="teacher-btn__label">لوحة المعلم وولي الأمر</span>
        </button>
      </div>
    </header>
  );
}
