import { useI18n } from '../i18n/index.jsx';
import { VIEWS } from '../state/navigation.jsx';
import BrandMark from './BrandMark.jsx';
import './Footer.css';

/**
 * <Footer /> — the standard site footer.
 * Shown on the content screens (catalog, dashboard, info pages); hidden in
 * the focused lab and game screens on purpose.
 * @param {object}   props
 * @param {Function} props.onNavigate receives a VIEWS value
 */
export default function Footer({ onNavigate }) {
  const { t } = useI18n();
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <BrandMark />
          <p className="site-footer__tagline">{t('site.footer.tagline')}</p>
        </div>
        <nav className="site-footer__nav" aria-label={t('site.footer.about')}>
          <button type="button" className="site-footer__link" onClick={() => onNavigate(VIEWS.ABOUT)}>
            {t('site.footer.about')}
          </button>
          <button type="button" className="site-footer__link" onClick={() => onNavigate(VIEWS.HELP)}>
            {t('site.footer.help')}
          </button>
          <button type="button" className="site-footer__link" onClick={() => onNavigate(VIEWS.PRIVACY)}>
            {t('site.footer.privacy')}
          </button>
          <a
            className="site-footer__link"
            href="https://github.com/OsamaAliDev/misbar-platform"
            target="_blank"
            rel="noreferrer"
          >
            {t('site.footer.repo')}
          </a>
        </nav>
      </div>
      <p className="site-footer__rights">{t('site.footer.rights')}</p>
    </footer>
  );
}
