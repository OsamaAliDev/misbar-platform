import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createSupabaseAdapter, readSession, request, schoolApi, storeSession } from '../lib/data-access.js';

const SaasContext = createContext(null);
export function SaasProvider({ children }) {
  const [mode, setMode] = useState('loading');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const identity = useRef(0);
  const adapter = useMemo(() => createSupabaseAdapter(), []);
  const reportError = useCallback((failure) => {
    const code = failure?.code || failure?.message || 'unavailable';
    setError(code);
    if (failure?.status === 401 || code === 'session_expired') {
      identity.current += 1;
      storeSession(null);
      setSession(null);
    }
  }, []);
  const refreshSession = useCallback(async () => {
    if (!readSession()) { setSession(null); return null; }
    const version = identity.current;
    try {
      const current = await adapter.read();
      if (version === identity.current) setSession(current);
      return current;
    } catch (failure) { reportError(failure); throw failure; }
  }, [adapter, reportError]);
  useEffect(() => {
    let alive = true;
    const configuration = request('/config', { authenticated: false }).then((config) => {
      if (alive) setMode(config.mode);
    }).catch(() => { if (alive) setMode('unavailable'); });
    const restore = readSession() ? refreshSession().catch(() => {}) : Promise.resolve();
    Promise.all([configuration, restore]).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [refreshSession]);
  const login = useCallback(async (route, credentials) => {
    const version = ++identity.current;
    setError(null); setLoading(true);
    try {
      const result = await request(route, { method: 'POST', body: credentials, authenticated: false });
      if (version !== identity.current) return null;
      storeSession(result);
      const current = await adapter.read();
      if (version === identity.current) setSession(current);
      return current;
    } catch (failure) {
      if (version === identity.current) { storeSession(null); setSession(null); reportError(failure); }
      throw failure;
    } finally { if (version === identity.current) setLoading(false); }
  }, [adapter, reportError]);
  const loginStaff = useCallback((values, password) => login('/staff/login', typeof values === 'string' ? { email: values, password } : values), [login]);
  const loginStudent = useCallback((values) => login('/student/login', values), [login]);
  const logout = useCallback(async () => {
    identity.current += 1;
    try { if (readSession()) await request('/logout', { method: 'POST' }); }
    catch { /* Local logout still removes the credential when the network is unavailable. */ }
    finally { storeSession(null); setSession(null); setError(null); setLoading(false); }
  }, []);
  const updateStudent = useCallback((result, userId) => {
    setSession((current) => current?.userId === userId ? { ...current, ...result } : current);
  }, []);
  const value = useMemo(() => ({ mode, session, loading, error, api: schoolApi, loginStaff, loginStudent, logout, refreshSession, adapter, updateStudent, reportError, clearError: () => setError(null) }), [mode, session, loading, error, loginStaff, loginStudent, logout, refreshSession, adapter, updateStudent, reportError]);
  return <SaasContext.Provider value={value}>{children}</SaasContext.Provider>;
}
export function useSaas() {
  const value = useContext(SaasContext);
  if (!value) throw new Error('SaasProvider is required');
  return value;
}
