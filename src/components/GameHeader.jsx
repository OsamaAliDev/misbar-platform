import { useI18n } from '../i18n/index.jsx';
import { buildHash, VIEWS } from '../state/navigation.jsx';
import BrandMark from './BrandMark.jsx';
import Icon from './Icon.jsx';
import StarBalance from './StarBalance.jsx';
import './GameHeader.css';

/** The four game screens, in nav order. */
const NAV_ITEMS = [
  { view: VIEWS.LOBBY, icon: 'home', labelKey: 'game.nav.lobby' },
  { view: VIEWS.HEROES, icon: 'groups', labelKey: 'game.nav.heroes' },
  { view: VIEWS.VAULT, icon: 'checkroom', labelKey: 'game.nav.vault' },
  { view: VIEWS.RANKS, icon: 'stairs', labelKey: 'game.nav.ranks' },
];

/**
 * <GameHeader /> — top bar shared by the game screens (night theme).
 *
 *   desktop  brand · [lobby · heroes · vault · ranks] · stars · library
 *   phones   brand · stars · library
 *            [lobby · heroes · vault · ranks]   (4 equal tabs, no scrolling)
 *
 * Nav items are plain hash links, so browser back/forward work as usual.
 *
 * @param {object} props
 * @param {string} props.currentView  one of VIEWS (marks the active tab)
 */
export default function GameHeader({ currentView }) {
  const { t } = useI18n();

  return (
    <header className="game-header">
      <a className="game-header__brand" href={buildHash(VIEWS.LOBBY)} aria-label={t('game.titles.lobby')}>
        <BrandMark />
      </a>

      <nav className="game-nav" aria-label={t('game.nav.label')}>
        <ul className="game-nav__list">
          {NAV_ITEMS.map((item) => (
            <li key={item.view}>
              <a
                className="game-nav__link"
                href={buildHash(item.view)}
                aria-current={currentView === item.view ? 'page' : undefined}
              >
                <Icon name={item.icon} size={22} filled={currentView === item.view} />
                <span className="game-nav__label">{t(item.labelKey)}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="game-header__end">
        <StarBalance />
        <a className="btn btn--neutral game-header__library" href={buildHash(VIEWS.CATALOG)}>
          <Icon name="menu_book" size={20} className="game-header__library-icon" />
          <span className="game-header__library-label">{t('game.nav.library')}</span>
        </a>
      </div>
    </header>
  );
}
