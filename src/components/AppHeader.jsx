import LanguageToggle from './LanguageToggle.jsx';
import { useI18n } from '../i18n/index.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import BrandMark from './BrandMark.jsx';
import Icon from './Icon.jsx';
import MascotGreeting from './MascotGreeting.jsx';
import StarBalance from './StarBalance.jsx';
import './AppHeader.css';

/** Catalog header: one hero-lobby greeting, preferences, stars and dashboard. */
export default function AppHeader({ onOpenDashboard, isDashboardOpen = false }) {
  const { t } = useI18n();

  return (
    <header className="app-header">
      <div className="app-header__start">
        <BrandMark />
        <span className="app-header__divider" aria-hidden="true" />
        <MascotGreeting variant="badge" className="app-header__greeting" />
      </div>

      <div className="app-header__end">
        <LanguageToggle />
        <ThemeToggle />
        <StarBalance />
        <button
          type="button"
          id="open-dashboard"
          className="btn btn--neutral teacher-btn"
          aria-current={isDashboardOpen ? 'page' : undefined}
          onClick={onOpenDashboard}
        >
          <Icon name="supervisor_account" size={20} className="teacher-btn__icon" />
          <span className="teacher-btn__label">{t('app.portal')}</span>
        </button>
      </div>
    </header>
  );
}
