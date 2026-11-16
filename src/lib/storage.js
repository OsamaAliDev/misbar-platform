/**
 * Tiny, defensive wrappers around `window.localStorage`.
 *
 * localStorage can throw (private mode, disabled storage, quota exceeded) or
 * contain hand-edited / corrupted JSON. These helpers never throw: reads fall
 * back to `null`, writes report success as a boolean.
 */

/**
 * Read and parse a JSON value.
 * @param {string} key
 * @returns {unknown | null} The parsed value, or `null` when missing/invalid.
 */
export function readJSON(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Serialise and store a JSON value.
 * @param {string} key
 * @param {unknown} value
 * @returns {boolean} `true` when the value was written.
 */
export function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
