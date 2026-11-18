import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState, useEffect } from 'react';
import { readJSON, writeJSON } from '../lib/storage.js';

export const THEME_STORAGE_KEY = 'misbar:theme:v1';
export const DEFAULT_THEME = 'light';
const valid = value => value === 'light' || value === 'night';
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = readJSON(THEME_STORAGE_KEY);
    return valid(saved) ? saved : DEFAULT_THEME;
  });

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    const colour = getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim();
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', colour);
  }, [theme]);

  useEffect(() => {
    const sync = event => {
      if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
      const saved = readJSON(THEME_STORAGE_KEY);
      setTheme(valid(saved) ? saved : DEFAULT_THEME);
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === 'night' ? 'light' : 'night';
    writeJSON(THEME_STORAGE_KEY, next);
    document.documentElement.dataset.theme = next;
    setTheme(next);
  }, [theme]);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('ThemeProvider is required.');
  return value;
}
