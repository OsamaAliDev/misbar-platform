import { getAvatar } from '../data/avatars.js';
import FlatIllustration from './FlatIllustration.jsx';
import './Avatar.css';

/**
 * <Avatar /> — a student's geometric cartoon avatar inside a coloured circle.
 *
 * @param {object} props
 * @param {string} props.avatarId  id from src/data/avatars.js
 * @param {number} [props.size=36] diameter in px
 */
export default function Avatar({ avatarId, size = 36 }) {
  const avatar = getAvatar(avatarId);

  return (
    <span
      className={`avatar avatar--${avatar.tone}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <FlatIllustration viewBox="0 0 48 48" shapes={avatar.shapes} />
    </span>
  );
}
