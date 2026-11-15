import { NOUR_SRC } from '../lib/assets.js';
import './MascotGreeting.css';

/**
 * <MascotGreeting /> — «نُور» welcomes the student.
 *
 * Two layouts taken from the Stitch Catalog screens:
 *  - "badge": compact pill inside the desktop header
 *  - "strip": avatar + speech bubble under the header (tablet & mobile)
 *
 * @param {object} props
 * @param {'badge' | 'strip'} props.variant
 * @param {string} [props.className]
 */
export default function MascotGreeting({ variant, className = '' }) {
  if (variant === 'badge') {
    return (
      <div className={`mascot-badge ${className}`.trim()}>
        <img className="mascot-badge__img" src={NOUR_SRC} alt="تميمة نُور" width="40" height="40" />
        <span className="mascot-badge__text">أهلاً يا بطل! جاهز نكتشف؟</span>
      </div>
    );
  }

  return (
    <section className={`mascot-strip ${className}`.trim()} aria-label="ترحيب نُور">
      <span className="mascot-strip__avatar">
        <img src={NOUR_SRC} alt="تميمة نُور" width="46" height="46" />
      </span>
      <p className="speech-bubble">أهلاً يا بطل! اختار تجربة ونبدأ سوا!</p>
    </section>
  );
}
