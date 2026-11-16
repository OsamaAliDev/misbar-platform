import { useI18n } from '../i18n/index.jsx';
import { useTheme } from '../state/theme.jsx';
import './Preferences.css';

export default function ThemeToggle() {
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const label = t(theme === 'night' ? 'common.themeLight' : 'common.themeNight');
  return <button id="theme-toggle" type="button" className="btn btn--neutral preference-toggle" onClick={toggleTheme} aria-label={label}>{label}</button>;
}
