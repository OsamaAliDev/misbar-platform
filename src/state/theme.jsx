import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState, useEffect } from 'react';
import { readJSON, writeJSON } from '../lib/storage.js';
import { GAME_VIEWS, VIEWS, useNavigation } from './navigation.jsx';
import { useStudent } from './student.jsx';

export const THEME_STORAGE_KEY = 'misbar:theme:v1';
const valid = value => value === 'light' || value === 'night';
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { view } = useNavigation();
  const { student } = useStudent();
  const [choice, setChoice] = useState(() => {
    const saved = readJSON(THEME_STORAGE_KEY);
    return valid(saved) ? saved : null;
  });
  const redirected = !student.heroId && [VIEWS.CATALOG, VIEWS.LOBBY, VIEWS.VAULT, VIEWS.RANKS].includes(view);
  const theme = choice ?? (redirected || GAME_VIEWS.includes(view) ? 'night' : 'light');
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    const colour = getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim();
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', colour);
  }, [theme]);
  useEffect(() => {
    const sync = event => {
      if (event.key !== THEME_STORAGE_KEY) return;
      const saved = readJSON(THEME_STORAGE_KEY);
      setChoice(valid(saved) ? saved : null);
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  const toggleTheme = useCallback(() => {
    const next = theme === 'night' ? 'light' : 'night';
    writeJSON(THEME_STORAGE_KEY, next);
    document.documentElement.dataset.theme = next;
    setChoice(next);
  }, [theme]);
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('ThemeProvider is required.');
  return value;
}
