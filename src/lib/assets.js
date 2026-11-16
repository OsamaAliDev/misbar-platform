/**
 * Static asset locations (files served from /public).
 *
 * Paths are built from Vite's BASE_URL so the build keeps working if the app
 * is ever deployed under a sub-path. No external image hosts are used.
 */
const BASE = import.meta.env.BASE_URL;

/** The original star mascot from the Stitch kit (transparent PNG). Retired from the
 *  guide role in Phase 2 — the chosen hero guides now — and kept only as a
 *  decorative picture on placeholder panels. */
export const NOUR_SRC = `${BASE}assets/nour.png`;
