import { fail } from './security.mjs';
import { EXPERIMENTS } from '../src/data/experiments.js';
import { AVATARS, DEFAULT_AVATAR_ID } from '../src/data/avatars.js';
import { getMission, getMissionStatus, getOutfitSlot, outfitKey } from '../src/config/game.js';
// heroes.js is Vite-only (import.meta.env.BASE_URL); keep this explicit whitelist in parity tests.
export const HERO_IDS = Object.freeze(['lubna', 'shihab', 'nour', 'suhail', 'sharara']);
const experimentIds = new Set(EXPERIMENTS.map(x => x.id));
const avatarIds = new Set(AVATARS.map(x => x.id));
export const MAX_STARS = 28;
export function onlyKeys(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(key => !keys.includes(key))) fail('invalid_input');
}
export function nickname(value) {
  if (typeof value !== 'string') fail('invalid_input');
  const name = value.trim().normalize('NFC');
  if (name.length < 2 || name.length > 24 || !/^[\p{L}\p{M}\p{N} _.-]+$/u.test(name) || !/\p{L}/u.test(name)) fail('invalid_input');
  return name;
}
export function displayName(value) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 80 || /[\u0000-\u001f\u007f<>]/u.test(value)) fail('invalid_input');
  return value.trim();
}
export function pin(value) { if (typeof value !== 'string' || !/^\d{4}$/.test(value)) fail('invalid_input'); return value; }
export function classCode(value) { if (typeof value !== 'string' || !/^[A-Z0-9]{6,16}$/.test(value.trim().toUpperCase())) fail('invalid_input'); return value.trim().toUpperCase(); }
export function uuid(value) { if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) fail('invalid_input'); return value; }
export function defaults() { return { stars: 12, heroId: null, completedChallenges: [], claimedMissions: [], unlockedOutfits: [], avatarId: DEFAULT_AVATAR_ID }; }
export function importProgress(raw) {
  onlyKeys(raw, ['nickname', 'stars', 'heroId', 'completedChallenges', 'claimedMissions', 'unlockedOutfits', 'avatarId']);
  const out = defaults();
  if (raw.stars !== undefined) {
    if (!Number.isFinite(raw.stars) || raw.stars < 0) fail('invalid_input');
    out.stars = Math.min(MAX_STARS, Math.floor(raw.stars));
  }
  const ids = (value, test) => {
    if (value === undefined) return [];
    if (!Array.isArray(value) || value.length > 100 || value.some(id => typeof id !== 'string' || id.length > 64)) fail('invalid_input');
    return [...new Set(value)].filter(test);
  };
  out.completedChallenges = ids(raw.completedChallenges, id => experimentIds.has(id));
  out.claimedMissions = ids(raw.claimedMissions, id => { const m = getMission(id); return m && getMissionStatus(m, out).complete; });
  out.heroId = HERO_IDS.includes(raw.heroId) ? raw.heroId : null;
  out.avatarId = avatarIds.has(raw.avatarId) ? raw.avatarId : DEFAULT_AVATAR_ID;
  out.unlockedOutfits = ids(raw.unlockedOutfits, id => {
    const [hero, slotString] = id.split(':'); const slot = getOutfitSlot(Number(slotString));
    return HERO_IDS.includes(hero) && slot && slot.cost > 0 && slot.cost <= out.stars && id === outfitKey(hero, slot.slot);
  });
  return out;
}
export function validateAction(action) {
  const keys = { completeChallenge: ['type', 'experimentId'], claimMission: ['type', 'missionId'], unlockOutfit: ['type', 'heroId', 'slot'], chooseHero: ['type', 'heroId'], setAvatar: ['type', 'avatarId'] };
  if (!keys[action?.type]) fail('invalid_input');
  onlyKeys(action, keys[action.type]);
  if (action.type === 'completeChallenge' && !experimentIds.has(action.experimentId)) fail('invalid_input');
  if (action.type === 'claimMission' && !getMission(action.missionId)) fail('invalid_input');
  if (['chooseHero', 'unlockOutfit'].includes(action.type) && !HERO_IDS.includes(action.heroId)) fail('invalid_input');
  if (action.type === 'unlockOutfit' && (!Number.isInteger(action.slot) || !getOutfitSlot(action.slot))) fail('invalid_input');
  if (action.type === 'setAvatar' && !avatarIds.has(action.avatarId)) fail('invalid_input');
  return action;
}
export function applyAction(student, action) {
  validateAction(action);
  const out = structuredClone(student);
  switch (action.type) {
    case 'completeChallenge': if (!out.completedChallenges.includes(action.experimentId)) { out.completedChallenges.push(action.experimentId); out.stars = Math.min(MAX_STARS, out.stars + 1); } break;
    case 'claimMission': { const mission = getMission(action.missionId); const status = getMissionStatus(mission, out); if (status.complete && !status.claimed) { out.claimedMissions.push(mission.id); out.stars = Math.min(MAX_STARS, out.stars + mission.reward); } break; }
    case 'unlockOutfit': { const slot = getOutfitSlot(action.slot); const key = outfitKey(action.heroId, action.slot); if (slot.cost > 0 && out.stars >= slot.cost && !out.unlockedOutfits.includes(key)) out.unlockedOutfits.push(key); break; }
    case 'chooseHero': out.heroId = action.heroId; break;
    case 'setAvatar': out.avatarId = action.avatarId; break;
  }
  return out;
}
export function safeStudent(row) { return { id: row.id, nickname: row.nickname, stars: row.stars, heroId: row.heroId ?? row.hero_id ?? null, completedChallenges: row.completedChallenges ?? row.completed_challenges ?? [], claimedMissions: row.claimedMissions ?? row.claimed_missions ?? [], unlockedOutfits: row.unlockedOutfits ?? row.unlocked_outfits ?? [], avatarId: row.avatarId ?? row.avatar_id ?? DEFAULT_AVATAR_ID }; }
export function safeClass(row) { return { id: row.id, name: row.name, joinCode: row.joinCode ?? row.join_code, schoolId: row.schoolId ?? row.school_id, teacherId: row.teacherId ?? row.teacher_id }; }
