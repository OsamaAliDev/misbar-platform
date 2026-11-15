import { useEffect, useLayoutEffect, useRef } from 'react';

/**
 * Shared helpers for the Playground simulations.
 * ---------------------------------------------------------------------------
 * Simulations draw flat SVG. SVG presentation attributes cannot read CSS
 * variables, so colours are applied through `style` using `token()`, which
 * keeps every drawing inside the locked palette of src/index.css.
 */

/**
 * CSS variable reference for a locked palette token.
 * @param {string} name e.g. "accent-tools"
 * @returns {string} e.g. "var(--accent-tools)"
 */
export const token = (name) => `var(--${name})`;

/**
 * Inline SVG style from palette token names.
 * @param {string | null} fill        token name, or null for no fill
 * @param {string} [stroke]           token name
 * @param {number} [strokeWidth=2]
 * @returns {import('react').CSSProperties}
 * @example <rect style={paint('accent-tools-soft', 'accent-tools-text', 3)} />
 */
export function paint(fill, stroke, strokeWidth = 2) {
  const style = { fill: fill ? token(fill) : 'none' };
  if (stroke) {
    style.stroke = token(stroke);
    style.strokeWidth = strokeWidth;
  }
  return style;
}

/** Degrees → radians factor. */
export const DEG = Math.PI / 180;

/** Clamp `value` into [min, max]. */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/** Linear interpolation between `a` and `b`. */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/** Smooth 0 → 1 ramp between `edge0` and `edge1` (Hermite smoothstep). */
export function smoothstep(edge0, edge1, value) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Move `current` towards `target` by at most `maxDelta`. */
export function approach(current, target, maxDelta) {
  if (current < target) return Math.min(target, current + maxDelta);
  return Math.max(target, current - maxDelta);
}

/**
 * Snap a slider value to its step and drop floating-point noise
 * (1.2000000000000002 → 1.2).
 */
export function roundToStep(value, step) {
  const decimals = (String(step).split('.')[1] || '').length;
  return Number((Math.round(value / step) * step).toFixed(decimals));
}

/** Greatest common divisor of two non-negative integers. */
export function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x;
}

/**
 * Small deterministic pseudo-random generator (mulberry32), so particle
 * layouts and background stars are identical on every visit.
 * @param {number} seed
 * @returns {() => number} returns values in [0, 1)
 */
export function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Run `onFrame(dt)` on every animation frame while `active` is true.
 *
 * - `dt` is the elapsed time in seconds, capped at 50 ms so a background tab
 *   or a slow frame never makes the physics jump.
 * - The latest callback is always used, so it can read fresh props/state
 *   without restarting the loop.
 *
 * @param {(dt: number) => void} onFrame
 * @param {boolean} active
 */
export function useAnimationFrame(onFrame, active) {
  const callbackRef = useRef(onFrame);

  useLayoutEffect(() => {
    callbackRef.current = onFrame;
  });

  useEffect(() => {
    if (!active) return undefined;

    let frameId = 0;
    let previous = performance.now();

    const loop = (now) => {
      const dt = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      callbackRef.current(dt);
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [active]);
}
