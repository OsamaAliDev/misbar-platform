/**
 * Static asset locations (files served from /public).
 *
 * Paths are built from Vite's BASE_URL so the build keeps working if the app
 * is ever deployed under a sub-path. No external image hosts are used.
 */
const BASE = import.meta.env.BASE_URL;

/** «نُور» — the platform mascot, a transparent PNG extracted from the Stitch kit. */
export const NOUR_SRC = `${BASE}assets/nour.png`;
