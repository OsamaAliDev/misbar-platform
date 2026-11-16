import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createSupabaseAdapter, readSession, request, schoolApi, storeSession } from '../lib/data-access.js';

const SaasContext = createContext(null);
export function SaasProvider({ children }) {
  const [mode, setMode] = useState('loading');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authPending, setAuthPending] = useState(() => !!readSession());
  const [authVersion, setAuthVersion] = useState(0);
  const [error, setError] = useState(null);
  const identity = useRef(0);
  const advance = useCallback(() => { const version = ++identity.current; setAuthVersion(version); return version; }, []);
  const adapter = useMemo(() => createSupabaseAdapter(), []);
  const reportError = useCallback((failure, version = identity.current) => {
    if (version !== identity.current) return;
    const code = failure?.code || failure?.message || 'unavailable';
    setError(code);
    if (failure?.status === 401 || code === 'session_expired') {
      advance(); storeSession(null); setSession(null); setAuthPending(false); setLoading(false);
    }
  }, [advance]);
  const refreshSession = useCallback(async () => {
    const accessToken = readSession()?.accessToken;
    if (!accessToken) { setSession(null); return null; }
    const version = identity.current;
    const currentIdentity = () => version === identity.current && readSession()?.accessToken === accessToken;
    try {
      const current = await adapter.read({ accessToken });
      if (!currentIdentity()) return null;
      setSession(current); setAuthPending(false);
      return current;
    } catch (failure) {
      if (currentIdentity()) { setAuthPending(false); reportError(failure, version); }
      throw failure;
    }
  }, [adapter, reportError]);
  useEffect(() => {
    let alive = true;
    const version = identity.current;
    const configuration = request('/config', { authenticated: false }).then((config) => {
      if (alive) setMode(config.mode);
    }).catch(() => { if (alive) setMode('unavailable'); });
    const restore = readSession() ? refreshSession().catch(() => {}) : Promise.resolve();
    Promise.all([configuration, restore]).finally(() => { if (alive && version === identity.current) setLoading(false); });
    return () => { alive = false; };
  }, [refreshSession]);
  const login = useCallback(async (route, credentials) => {
    const version = advance();
    storeSession(null); setSession(null); setError(null); setLoading(true); setAuthPending(true);
    try {
      const result = await request(route, { method: 'POST', body: credentials, authenticated: false });
      if (version !== identity.current) return null;
      storeSession(result);
      const current = await adapter.read({ accessToken: result.accessToken });
      if (version !== identity.current) return null;
      setSession(current);
      return current;
    } catch (failure) {
      if (version === identity.current) { storeSession(null); setSession(null); reportError(failure, version); }
      throw failure;
    } finally {
      if (version === identity.current) { setLoading(false); setAuthPending(false); }
    }
  }, [adapter, advance, reportError]);
  const loginStaff = useCallback((values, password) => login('/staff/login', typeof values === 'string' ? { email: values, password } : values), [login]);
  const loginStudent = useCallback((values) => login('/student/login', values), [login]);
  const logout = useCallback(async () => {
    const accessToken = readSession()?.accessToken;
    advance(); storeSession(null); setSession(null); setError(null); setLoading(false); setAuthPending(false);
    // Revocation is for the captured credential only. Late completion never mutates local auth.
    try { if (accessToken) await request('/logout', { method: 'POST', accessToken }); }
    catch { /* Offline logout still removes the local credential immediately. */ }
  }, [advance]);
  const updateStudent = useCallback((result, userId, version) => {
    if (version !== identity.current) return;
    setSession((current) => current?.userId === userId ? { ...current, ...result } : current);
  }, []);
  const hasCredential = !!readSession();
  const value = useMemo(() => ({ mode, session, loading, authPending, authVersion, hasCredential, error, api: schoolApi, loginStaff, loginStudent, logout, refreshSession, adapter, updateStudent, reportError, clearError: () => setError(null) }), [mode, session, loading, authPending, authVersion, hasCredential, error, loginStaff, loginStudent, logout, refreshSession, adapter, updateStudent, reportError]);
  return <SaasContext.Provider value={value}>{children}</SaasContext.Provider>;
}
export function useSaas() {
  const value = useContext(SaasContext);
  if (!value) throw new Error('SaasProvider is required');
  return value;
}
