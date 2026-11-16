import BrandMark from './BrandMark.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import LanguageToggle from './LanguageToggle.jsx';
import Icon from './Icon.jsx';
import { useI18n } from '../i18n/index.jsx';
import { useSaas } from '../state/saas.jsx';
import { buildHash, useNavigation, VIEWS } from '../state/navigation.jsx';
import './SaasChrome.css';

export function AccountLink() {
  const { t } = useI18n();
  const { session } = useSaas();
  const destination = session?.role === 'platform_admin' ? VIEWS.STAFF_LOGIN : session && session.role !== 'student' ? VIEWS.CLASSES : VIEWS.STUDENT_LOGIN;
  return <a className="btn btn--neutral saas-account-link" href={buildHash(destination)} title={t('saas.chrome.account')} aria-label={t('saas.chrome.account')}><Icon name="login" size={20} /><span>{t('saas.chrome.account')}</span></a>;
}
export function SaasHeader() {
  const { t } = useI18n();
  const { session, logout } = useSaas();
  const { navigate } = useNavigation();
  const leave = async () => { await logout(); navigate(VIEWS.STAFF_LOGIN); };
  return <header className="saas-header">
    <BrandMark />
    <nav className="saas-header__links" aria-label={t('saas.chrome.navigation')}>
      <a className="btn btn--neutral" href={buildHash(VIEWS.CATALOG)}><Icon name="science" size={20} />{t('saas.chrome.library')}</a>
      {session && session.role !== 'student' && <a className="btn btn--neutral" href={buildHash(session.role === 'platform_admin' ? VIEWS.STAFF_LOGIN : VIEWS.CLASSES)}>{t('saas.chrome.workspace')}</a>}
      {!session && <a className="btn btn--neutral" href={buildHash(VIEWS.STUDENT_LOGIN)}>{t('saas.chrome.studentLogin')}</a>}
      {!session && <a className="btn btn--neutral" href={buildHash(VIEWS.STAFF_LOGIN)}>{t('saas.chrome.staffLogin')}</a>}
      <LanguageToggle /><ThemeToggle />
      {session && <button type="button" className="btn btn--neutral" onClick={leave}>{t('saas.chrome.logout')}</button>}
    </nav>
  </header>;
}
export function SaasNotice() {
  const { t } = useI18n();
  const { session, error, clearError } = useSaas();
  if (!error) return null;
  return <aside className="saas-notice" role="status" aria-live="polite">
    <Icon name="info" size={20} />
    <p>{t(`saas.errors.${error}`)}</p>
    {error && <button type="button" className="btn btn--neutral" onClick={clearError}>{t('saas.chrome.dismiss')}</button>}
  </aside>;
}
