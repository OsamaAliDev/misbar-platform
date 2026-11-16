import arCommon from '../i18n/locales/ar/common.js';
import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { getMission, getMissionStatus, getOutfitSlot, outfitKey } from '../config/game.js';
import { AVATARS, DEFAULT_AVATAR_ID } from '../data/avatars.js';
import { HERO_IDS } from '../data/heroes.js';
import { readJSON } from '../lib/storage.js';
import { createLocalStorageAdapter, readSession } from '../lib/data-access.js';
import { useSaas } from './saas.jsx';

/**
 * Shared student state
 * ---------------------------------------------------------------------------
 * Misbar never collects personal data: a student is only a nickname, a
 * geometric cartoon avatar, a star balance, the list of Playground
 * challenges already completed, and game progress (chosen hero guide,
 * collected missions, unlocked outfit slots). The profile is persisted in
 * localStorage and shared by every view.
 *
 * Stars are a single total: challenges (+1 each) and missions add to it,
 * ranks are derived from it, and outfit slots unlock at star thresholds
 * (nothing ever spends stars). See src/config/game.js.
 */

/**
 * Versioned key so future schema changes can migrate cleanly.
 * (Later batches only *added* fields; older v1 data is still valid.)
 */
export const STUDENT_STORAGE_KEY = 'misbar:student:v1';

const NICKNAME_MAX_LENGTH = 24;

/** Upper bound on stored id lists (defensive against hand-edited data). */
const MAX_LIST_LENGTH = 100;

/** Default profile for a first-time visitor. */
export const DEFAULT_STUDENT = Object.freeze({
  nickname: arCommon.defaultNickname,
  avatarId: DEFAULT_AVATAR_ID,
  stars: 12,
  /** Experiment ids whose Playground challenge earned its +1 star. */
  completedChallenges: Object.freeze([]),
  /** Chosen hero guide; `null` until the student picks one (first visit). */
  heroId: null,
  /** Mission ids whose star reward was collected. */
  claimedMissions: Object.freeze([]),
  /** Unlocked outfit slots, e.g. "lubna:2". */
  unlockedOutfits: Object.freeze([]),
});

/** Keep unique, short string ids only. */
function sanitizeIdList(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id) => typeof id === 'string' && id.length <= 64))].slice(
    0,
    MAX_LIST_LENGTH,
  );
}

/**
 * Validate data coming from storage (it may be stale or hand-edited) and
 * fill anything missing with defaults.
 * @param {unknown} raw
 */
export function sanitizeStudent(raw) {
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

  const completedChallenges = sanitizeIdList(source.completedChallenges);
  const heroId = HERO_IDS.includes(source.heroId) ? source.heroId : null;
  const claimedMissions = sanitizeIdList(source.claimedMissions).filter((id) => getMission(id));
  const unlockedOutfits = sanitizeIdList(source.unlockedOutfits);

  return { nickname, avatarId, stars, completedChallenges, heroId, claimedMissions, unlockedOutfits };
}

/** Load the stored profile (or the defaults on first visit). */
function loadStudent() {
  return sanitizeStudent(readJSON(STUDENT_STORAGE_KEY));
}

export function studentReducer(state, action) {
  switch (action.type) {
    case 'setNickname':
      return sanitizeStudent({ ...state, nickname: action.nickname });
    case 'setAvatar':
      return sanitizeStudent({ ...state, avatarId: action.avatarId });
    case 'addStars':
      return { ...state, stars: Math.max(0, state.stars + Math.trunc(action.amount)) };
    case 'completeChallenge':
      // Once per experiment: a repeated completion never awards another star.
      if (state.completedChallenges.includes(action.experimentId)) return state;
      return {
        ...state,
        stars: state.stars + 1,
        completedChallenges: [...state.completedChallenges, action.experimentId],
      };
    case 'chooseHero':
      if (!HERO_IDS.includes(action.heroId)) return state;
      return { ...state, heroId: action.heroId };
    case 'claimMission': {
      // One-time reward, only once the mission's goal is reached.
      const mission = getMission(action.missionId);
      if (!mission) return state;
      const status = getMissionStatus(mission, state);
      if (!status.complete || status.claimed) return state;
      return {
        ...state,
        stars: state.stars + mission.reward,
        claimedMissions: [...state.claimedMissions, mission.id],
      };
    }
    case 'unlockOutfit': {
      // Unlocks at a star threshold; stars are not spent.
      const slot = getOutfitSlot(action.slot);
      const key = outfitKey(action.heroId, action.slot);
      if (!HERO_IDS.includes(action.heroId) || !slot || slot.cost === 0) return state;
      if (state.stars < slot.cost || state.unlockedOutfits.includes(key)) return state;
      return { ...state, unlockedOutfits: [...state.unlockedOutfits, key] };
    }
    case 'hydrate':
      return sanitizeStudent(action.student);
    case 'reset':
      return { ...DEFAULT_STUDENT, completedChallenges: [], claimedMissions: [], unlockedOutfits: [] };
    default:
      return state;
  }
}

const StudentContext = createContext(null);

/**
 * Provides `{ student, setNickname, setAvatar, addStars, completeChallenge,
 * chooseHero, claimMission, unlockOutfit, resetStudent }`.
 */
export function StudentProvider({ children }) {
  const [guest, dispatch] = useReducer(studentReducer, undefined, loadStudent);
  const { session, adapter, updateStudent, reportError, loading, authPending, authVersion, hasCredential } = useSaas();
  const [syncing, setSyncing] = useState(false);
  const account = useRef(null);
  const binding = session?.role === 'student' ? `${authVersion}:${session.userId}` : null;
  account.current = binding;
  const restoring = authPending || (hasCredential && !session);
  const queue = useRef(Promise.resolve());
  const imports = useRef(new Set());
  const local = useMemo(() => createLocalStorageAdapter({ sanitize: sanitizeStudent, reduce: studentReducer, initial: DEFAULT_STUDENT }), []);
  const schoolStudent = session?.role === 'student';
  const student = schoolStudent && session.student ? sanitizeStudent(session.student) : guest;
  const canEarn = !restoring && !syncing && (!schoolStudent || session.canEarn === true);
  // School state never writes the guest key; logout restores the unchanged guest.
  useEffect(() => { if (!restoring && !schoolStudent) local.save(guest); }, [guest, local, restoring, schoolStudent]);
  useEffect(() => {
    const sync = (event) => { if (event.key === STUDENT_STORAGE_KEY) dispatch({ type: 'hydrate', student: local.peek() }); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [local]);
  useEffect(() => { setSyncing(false); }, [binding]);
  useEffect(() => {
    if (!schoolStudent || session.imported || !session.canEarn || imports.current.has(binding)) return;
    const id = session.userId;
    const currentBinding = binding;
    const accessToken = readSession()?.accessToken;
    const current = () => account.current === currentBinding && readSession()?.accessToken === accessToken;
    imports.current.add(currentBinding);
    setSyncing(true);
    // Serialize first import with actions, including StrictMode's effect replay.
    queue.current = queue.current.catch(() => {}).then(async () => {
      if (!current()) return;
      try {
        const result = await adapter.import(local.peek(), { accessToken });
        if (current()) updateStudent(result, id, authVersion);
      } catch (failure) { if (current()) reportError(failure, authVersion); }
      finally { if (current()) setSyncing(false); }
    });
  }, [schoolStudent, session, binding, authVersion, adapter, local, updateStudent, reportError]);
  const actions = useMemo(() => {
    const perform = (action) => {
      if (restoring) return Promise.resolve(false);
      if (!schoolStudent) { dispatch(action); return Promise.resolve(true); }
      const id = session.userId;
      const currentBinding = binding;
      const accessToken = readSession()?.accessToken;
      const current = () => account.current === currentBinding && readSession()?.accessToken === accessToken;
      if (!session.canEarn) { reportError({ code: 'forbidden' }); return Promise.resolve(false); }
      const job = queue.current.catch(() => {}).then(async () => {
        if (!current()) return false;
        setSyncing(true);
        try {
          const result = await adapter.apply(action, { accessToken });
          if (!current()) return false;
          updateStudent(result, id, authVersion);
          return true;
        } catch (failure) { if (current()) reportError(failure, authVersion); return false; }
        finally { if (current()) setSyncing(false); }
      });
      queue.current = job;
      return job;
    };
    return {
      setNickname: (nickname) => perform({ type: 'setNickname', nickname }),
      setAvatar: (avatarId) => perform({ type: 'setAvatar', avatarId }),
      addStars: (amount) => perform({ type: 'addStars', amount }),
      completeChallenge: (experimentId) => perform({ type: 'completeChallenge', experimentId }),
      chooseHero: (heroId) => perform({ type: 'chooseHero', heroId }),
      claimMission: (missionId) => perform({ type: 'claimMission', missionId }),
      unlockOutfit: (heroId, slot) => perform({ type: 'unlockOutfit', heroId, slot }),
      resetStudent: () => perform({ type: 'reset' }),
    };
  }, [schoolStudent, session, restoring, binding, authVersion, adapter, updateStudent, reportError]);
  const value = useMemo(() => ({ student, ...actions, canEarn, syncing: restoring || (schoolStudent && (syncing || loading)), isSchoolStudent: schoolStudent }), [student, actions, canEarn, schoolStudent, syncing, loading, restoring]);
  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
}
/** Access the shared student profile and its actions. */
export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) throw new Error('useStudent must be used inside <StudentProvider>.');
  return context;
}
