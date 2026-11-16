import { useI18n } from '../i18n/index.jsx';
import { buildHash, VIEWS } from '../state/navigation.jsx';
import { useGuide } from '../state/guide.js';
import HeroAvatar from './HeroAvatar.jsx';
import Icon from './Icon.jsx';
import './MascotGreeting.css';

/**
 * <MascotGreeting /> — the student's guide hero welcomes them in the catalog.
 *
 * Two layouts taken from the Stitch Catalog screens:
 *  - "badge": compact pill inside the desktop header; the whole pill links
 *             to the hero lobby
 *  - "strip": hero avatar + speech bubble under the header (tablet & mobile),
 *             followed by a "ساحة الأبطال" link
 *
 * @param {object} props
 * @param {'badge' | 'strip'} props.variant
 * @param {string} [props.className]
 */
export default function MascotGreeting({ variant, className = '' }) {
  const { hero, name } = useGuide();
  const { t } = useI18n();
  const lobbyHref = buildHash(VIEWS.LOBBY);

  if (variant === 'badge') {
    return (
      <a className={`mascot-badge ${className}`.trim()} href={lobbyHref}>
        <HeroAvatar hero={hero} size={40} />
        <span className="mascot-badge__text">{t('app.greetingBadge')}</span>
        <span className="visually-hidden">{t('app.guideLobby', { name })}</span>
        <Icon name="chevron_left" size={20} className="mascot-badge__go icon--dir" />
      </a>
    );
  }

  return (
    <section className={`mascot-strip ${className}`.trim()} aria-label={t('app.guideGreeting', { name })}>
      <span className="mascot-strip__avatar">
        <HeroAvatar hero={hero} size={52} />
      </span>
      <p className="speech-bubble">{t('app.greetingStrip')}</p>
      <a className="btn btn--neutral mascot-strip__lobby" href={lobbyHref}>
        <Icon name="groups" size={20} className="mascot-strip__lobby-icon" />
        <span>{t('app.lobby')}</span>
      </a>
    </section>
  );
}
