import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { AVATARS, DEFAULT_AVATAR_ID } from '../data/avatars.js';
import { readJSON, writeJSON } from '../lib/storage.js';

/**
 * Shared student state
 * ---------------------------------------------------------------------------
 * Misbar never collects personal data: a student is only a nickname, a
 * geometric cartoon avatar and a star balance. The profile is persisted in
 * localStorage and shared by every view (catalog now, playground & dashboard
 * in later batches).
 */

/** Versioned key so future schema changes can migrate cleanly. */
export const STUDENT_STORAGE_KEY = 'misbar:student:v1';

const NICKNAME_MAX_LENGTH = 24;

/** Default profile for a first-time visitor. */
export const DEFAULT_STUDENT = Object.freeze({
  nickname: 'بطل الفضاء',
  avatarId: DEFAULT_AVATAR_ID,
  stars: 12,
});

/**
 * Validate data coming from storage (it may be stale or hand-edited) and
 * fill anything missing with defaults.
 * @param {unknown} raw
 * @returns {{ nickname: string, avatarId: string, stars: number }}
 */
function sanitizeStudent(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};

  const nickname =
    typeof source.nickname === 'string' && source.nickname.trim()
      ? source.nickname.trim().slice(0, NICKNAME_MAX_LENGTH)
      : DEFAULT_STUDENT.nickname;

  const avatarId = AVATARS.some((avatar) => avatar.id === source.avatarId)
    ? source.avatarId
    : DEFAULT_STUDENT.avatarId;

  const stars =
    Number.isFinite(source.stars) && source.stars >= 0
      ? Math.floor(source.stars)
      : DEFAULT_STUDENT.stars;

  return { nickname, avatarId, stars };
}

/** Load the stored profile (or the defaults on first visit). */
function loadStudent() {
  return sanitizeStudent(readJSON(STUDENT_STORAGE_KEY));
}

function studentReducer(state, action) {
  switch (action.type) {
    case 'setNickname':
      return sanitizeStudent({ ...state, nickname: action.nickname });
    case 'setAvatar':
      return sanitizeStudent({ ...state, avatarId: action.avatarId });
    case 'addStars':
      return { ...state, stars: Math.max(0, state.stars + Math.trunc(action.amount)) };
    case 'hydrate':
      return sanitizeStudent(action.student);
    case 'reset':
      return { ...DEFAULT_STUDENT };
    default:
      return state;
  }
}

const StudentContext = createContext(null);

/**
 * Provides `{ student, setNickname, setAvatar, addStars, resetStudent }`.
 */
export function StudentProvider({ children }) {
  const [student, dispatch] = useReducer(studentReducer, undefined, loadStudent);

  // Persist every change (this also stores the defaults on the first visit).
  useEffect(() => {
    writeJSON(STUDENT_STORAGE_KEY, student);
  }, [student]);

  // Keep several open tabs in sync.
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === STUDENT_STORAGE_KEY) {
        dispatch({ type: 'hydrate', student: readJSON(STUDENT_STORAGE_KEY) });
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Stable action creators (dispatch never changes).
  const actions = useMemo(
    () => ({
      setNickname: (nickname) => dispatch({ type: 'setNickname', nickname }),
      setAvatar: (avatarId) => dispatch({ type: 'setAvatar', avatarId }),
      addStars: (amount) => dispatch({ type: 'addStars', amount }),
      resetStudent: () => dispatch({ type: 'reset' }),
    }),
    [],
  );

  const value = useMemo(() => ({ student, ...actions }), [student, actions]);

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
}

/** Access the shared student profile and its actions. */
export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) throw new Error('useStudent must be used inside <StudentProvider>.');
  return context;
}
