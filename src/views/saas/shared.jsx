import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { useI18n } from '../../i18n/index.jsx';
import { useSaas } from '../../state/saas.jsx';

export const ROUTES = Object.freeze({ staff: 'teacher-login', student: 'student-login', classes: 'classes', roster: 'class-roster' });
export const STAFF_ROLES = ['teacher', 'school_admin'];
const ERROR_CODES = new Set(['invalid_credentials', 'rate_limited', 'forbidden', 'duplicate_nickname', 'invalid_input', 'unavailable', 'session_expired', 'not_found']);

export function errorCode(error) {
  const code = typeof error === 'string' ? error : error?.code || error?.error || error?.message;
  return ERROR_CODES.has(code) ? code : 'unavailable';
}

export function identityKey(mode, session, extra = '') {
  return [mode, session?.userId, session?.role, session?.schoolId, extra].join(':');
}

/** Ignore results from an old identity, superseded request, or unmounted screen.
 * Methods do not assume that the provider accepts an AbortSignal. */
export function useRequest(identity) {
  const identityRef = useRef(identity);
  identityRef.current = identity;
  const mounted = useRef(false);
  const sequence = useRef(0);
  const [state, setState] = useState({ identity, pending: false, error: '', success: '' });
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; sequence.current += 1; };
  }, []);
  const run = useCallback(async (task, onSuccess) => {
    const currentIdentity = identityRef.current;
    const request = ++sequence.current;
    const current = () => mounted.current && identityRef.current === currentIdentity && sequence.current === request;
    setState({ identity: currentIdentity, pending: true, error: '', success: '' });
    try {
      const result = await task();
      if (!current()) return;
      const success = onSuccess?.(result) || '';
      if (current()) setState({ identity: currentIdentity, pending: false, error: '', success });
      return result;
    } catch (error) {
      if (!current()) return;
      setState({ identity: currentIdentity, pending: false, error: error?.name === 'AbortError' ? '' : errorCode(error), success: '' });
    }
  }, []);
  const fail = useCallback((code = 'invalid_input') => {
    sequence.current += 1;
    setState({ identity: identityRef.current, pending: false, error: code, success: '' });
  }, []);
  const clear = useCallback(() => {
    sequence.current += 1;
    setState({ identity: identityRef.current, pending: false, error: '', success: '' });
  }, []);
  return { ...(state.identity === identity ? state : { pending: false, error: '', success: '' }), run, fail, clear };
}

export function useResource(identity, enabled, loader, emptyValue) {
  const [record, setRecord] = useState({ identity: '', data: emptyValue, loaded: false });
  const request = useRequest(identity);
  const loadRef = useRef(loader);
  loadRef.current = loader;
  const reload = useCallback(() => request.run(() => loadRef.current(), (data) => {
    setRecord({ identity, data, loaded: true });
  }), [identity, request.run]);
  useEffect(() => {
    if (enabled) reload();
    return request.clear;
  }, [enabled, identity, reload, request.clear]);
  return { ...request, data: record.identity === identity ? record.data : emptyValue, loaded: record.identity === identity && record.loaded, reload };
}

export function Notice({ error, success, pending = false, id }) {
  const { t } = useI18n();
  return <div id={id} className="saas-notices" aria-live="polite" aria-atomic="true">
    {error ? <p className="saas-notice saas-notice--error"><Icon name="info" />{t(`saas.errors.${errorCode(error)}`)}</p> : null}
    {success ? <p className="saas-notice saas-notice--success"><Icon name="check_circle" />{t(`saas.${success}`)}</p> : null}
    {pending ? <p className="saas-muted">{t('saas.common.working')}</p> : null}
  </div>;
}

export function MockBanner({ credentials = false }) {
  const { mode } = useSaas();
  const { t } = useI18n();
  if (mode !== 'mock') return null;
  return <aside className="saas-mock" aria-label={t('saas.mock.title')}>
    <div className="saas-inline"><Icon name="code" /><strong>{t('saas.mock.title')}</strong></div>
    <p>{t('saas.mock.description')}</p>
    {credentials ? <details className="saas-credentials">
      <summary>{t('saas.mock.credentials')}</summary>
      <ul>
        {[['platform_admin', 'admin@misbar.test', 'MockAdmin!2026'], ['teacher', 'teacher@misbar.test', 'MockTeacher!2026'], ['school_admin', 'schooladmin@misbar.test', 'MockSchool!2026'], ['otherTeacher', 'other@misbar.test', 'MockOther!2026']].map(([role, email, password]) => <li key={email}><strong>{t(`saas.roles.${role}`)}</strong><span><bdi dir="ltr">{email}</bdi><span className="saas-muted">{t('saas.login.password')}: </span><bdi dir="ltr">{password}</bdi></span></li>)}
      </ul>
    </details> : null}
  </aside>;
}

export function PageHeading({ title, subtitle, children }) {
  const { t } = useI18n();
  return <div className="saas-heading"><div><h1 id="view-heading" tabIndex={-1}>{t(`saas.${title}`)}</h1>{subtitle ? <p className="saas-muted">{t(`saas.${subtitle}`)}</p> : null}</div>{children}</div>;
}

export function AccessEntries({ onNavigate, compact = false }) {
  const { t } = useI18n();
  return <div className={`saas-entries${compact ? ' saas-entries--compact' : ''}`}>
    <section className="card saas-entry"><Icon name="supervisor_account" size={28} /><h2>{t('saas.login.staffEntry')}</h2><p className="saas-muted">{t('saas.login.staffEntryHint')}</p><button type="button" className="btn btn--primary" onClick={() => onNavigate(ROUTES.staff)}>{t('saas.login.staffTitle')}</button></section>
    <section className="card saas-entry"><Icon name="groups" size={28} /><h2>{t('saas.login.studentEntry')}</h2><p className="saas-muted">{t('saas.login.studentEntryHint')}</p><button type="button" className="btn btn--neutral" onClick={() => onNavigate(ROUTES.student)}>{t('saas.login.studentTitle')}</button></section>
  </div>;
}

export function AccessBoundary({ roles, onNavigate, children }) {
  const { session, loading, error } = useSaas();
  const { t } = useI18n();
  if (loading && !session) return <div className="saas-page"><PageHeading title="common.loading" /><Notice pending /></div>;
  if (!session) return <div className="saas-page"><PageHeading title="login.accessTitle" subtitle="login.accessHint" /><MockBanner credentials /><Notice error={error} /><AccessEntries onNavigate={onNavigate} /></div>;
  if (!roles.includes(session.role)) return <div className="saas-page"><PageHeading title="access.deniedTitle" subtitle="access.deniedHint" /><MockBanner /><Notice error="forbidden" /><button type="button" className="btn btn--neutral saas-fit" onClick={() => onNavigate(STAFF_ROLES.includes(session.role) ? ROUTES.classes : 'catalog')}>{t('saas.access.correctArea')}</button></div>;
  return children;
}

export function Field({ label, hint, id, children }) {
  const { t } = useI18n();
  return <div className="saas-field"><label htmlFor={id}>{t(`saas.${label}`)}</label>{children}{hint ? <p id={`${id}-hint`} className="saas-field__hint">{t(`saas.${hint}`)}</p> : null}</div>;
}

export function pinValue(value) {
  return String(value || '').replace(/[\u0660-\u0669\u06f0-\u06f9]/g, (digit) => String(digit.charCodeAt(0) & 15));
}

export function SecretField({ id, enrollment = false, invalid = false }) {
  return <Field id={id} label="login.pin" hint="login.pinHint"><input id={id} name="pin" type="password" inputMode="numeric" autoComplete={enrollment ? 'new-password' : 'off'} minLength={4} maxLength={4} pattern="[0-9٠-٩۰-۹]{4}" required aria-describedby={`${id}-hint`} aria-invalid={invalid || undefined} dir="ltr" /></Field>;
}
