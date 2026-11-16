import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * Client-side navigation for مِسبار.
 * ---------------------------------------------------------------------------
 * Navigation is kept in the URL hash so that:
 *   • the browser back/forward buttons work,
 *   • a view can be deep-linked or refreshed,
 *   • the static build needs no server-side SPA rewrites.
 *
 * Hash format
 *   #/                              → catalog
 *   #/playground/<experimentId>     → playground (the lab)
 *   #/dashboard                     → dashboard  (placeholder)
 *   #/lobby                         → hero lobby     ┐
 *   #/heroes                        → hero select    │ game screens
 *   #/vault                         → outfit vault   │ (night by default)
 *   #/ranks                         → rank ladder    ┘
 */

/** Every top-level view of the platform. */
export const VIEWS = Object.freeze({
  STAFF_LOGIN: 'teacher-login',
  STUDENT_LOGIN: 'student-login',
  CLASSES: 'classes',
  ROSTER: 'class-roster',
  CATALOG: 'catalog',
  PLAYGROUND: 'playground',
  DASHBOARD: 'dashboard',
  LOBBY: 'lobby',
  HEROES: 'heroes',
  VAULT: 'vault',
  RANKS: 'ranks',
});

/** The game screens, night by default unless the visitor explicitly chooses light. */
export const GAME_VIEWS = Object.freeze([VIEWS.LOBBY, VIEWS.HEROES, VIEWS.VAULT, VIEWS.RANKS]);

const KNOWN_VIEWS = new Set(Object.values(VIEWS));

/**
 * Turn a location hash into a route object.
 * Unknown or malformed hashes fall back to the catalog.
 * @param {string} hash e.g. "#/playground/motion-acceleration"
 * @returns {{ view: string, params: Record<string, string> }}
 */
export function parseHash(hash) {
  const [view, id] = String(hash || '')
    .replace(/^#\/?/, '')
    .split('/')
    .filter(Boolean)
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    });

  if (!KNOWN_VIEWS.has(view)) return { view: VIEWS.CATALOG, params: {} };
  if (view === VIEWS.ROSTER) return { view, params: { classId: id ?? '' } };
  if (view === VIEWS.PLAYGROUND) return { view, params: { experimentId: id ?? '' } };
  return { view, params: {} };
}

/**
 * Build the hash for a route (inverse of `parseHash`).
 * @param {string} view
 * @param {Record<string, string>} [params]
 * @returns {string}
 */
export function buildHash(view, params = {}) {
  if (view === VIEWS.ROSTER) return `#/${VIEWS.ROSTER}/${encodeURIComponent(params.classId ?? '')}`;
  if (view === VIEWS.PLAYGROUND) {
    return `#/${VIEWS.PLAYGROUND}/${encodeURIComponent(params.experimentId ?? '')}`;
  }
  if (view !== VIEWS.CATALOG && KNOWN_VIEWS.has(view)) return `#/${view}`;
  return '#/';
}

const NavigationContext = createContext(null);

/**
 * Provides `{ view, params, navigate }` to the component tree and keeps it
 * in sync with `window.location.hash`.
 */
export function NavigationProvider({ children }) {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));

  // Follow browser back/forward and manual hash edits.
  useEffect(() => {
    const handleHashChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  /**
   * Switch to another view.
   * @param {string} view one of VIEWS
   * @param {Record<string, string>} [params] e.g. { experimentId }
   * @param {{ replace?: boolean }} [options] replace the current history entry
   */
  const navigate = useCallback((view, params = {}, { replace = false } = {}) => {
    const nextHash = buildHash(view, params);

    if (replace) {
      // Replace without adding a history entry (used for invalid deep links).
      window.history.replaceState(null, '', nextHash);
      setRoute(parseHash(nextHash));
    } else if (window.location.hash !== nextHash) {
      window.location.hash = nextHash; // fires `hashchange` → setRoute
    } else {
      setRoute(parseHash(nextHash));
    }
  }, []);

  const value = useMemo(
    () => ({ view: route.view, params: route.params, navigate }),
    [route, navigate],
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

/** Access the current route and the `navigate` function. */
export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useNavigation must be used inside <NavigationProvider>.');
  return context;
}
