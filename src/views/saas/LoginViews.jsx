import { useI18n } from '../../i18n/index.jsx';
import { useSaas } from '../../state/saas.jsx';
import { Field, MockBanner, Notice, PageHeading, ROUTES, SecretField, STAFF_ROLES, pinValue, useRequest } from './shared.jsx';

function LoginView({ onNavigate, student = false }) {
  const { t } = useI18n();
  const { mode, session, loading, error, loginStaff, loginStudent, logout } = useSaas();
  // Login may legitimately change the guest identity. The request itself is
  // scoped to this mounted login screen and its current backend mode.
  const request = useRequest(`${mode}:${student ? 'student' : 'staff'}`);
  const logoutRequest = useRequest(`${mode}:${session?.userId || ''}`);
  const busy = request.pending || logoutRequest.pending || loading || mode === 'loading';
  const prefix = student ? 'student-login' : 'staff-login';
  const destination = (next) => STAFF_ROLES.includes(next?.role) ? ROUTES.classes : 'catalog';
  function submit(event) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const secret = student ? pinValue(data.get('pin')) : String(data.get('password') || '');
    // Uncontrolled secret inputs are cleared immediately, including when a
    // request fails. They never enter React state, URLs, or browser storage.
    form.elements.namedItem(student ? 'pin' : 'password').value = '';
    if (student) {
      const classCode = String(data.get('classCode') || '').trim();
      const nickname = String(data.get('nickname') || '').trim();
      if (!classCode || !nickname || !/^[0-9]{4}$/.test(secret)) return request.fail();
      request.run(() => loginStudent({ classCode, nickname, pin: secret }), (next) => { if (next?.role) onNavigate(destination(next)); });
    } else {
      const email = String(data.get('email') || '').trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !secret) return request.fail();
      request.run(() => loginStaff({ email, password: secret }), (next) => { if (next?.role) onNavigate(destination(next)); });
    }
  }
  return <div className="saas-page saas-page--login">
    <PageHeading title={session ? 'login.signedIn' : student ? 'login.studentTitle' : 'login.staffTitle'} subtitle={session ? 'login.sessionHint' : student ? 'login.studentSubtitle' : 'login.staffSubtitle'} />
    <div className="saas-login-layout">
      <section className="card saas-panel saas-login-card">
        {session ? <>
          <p><strong>{t(`saas.roles.${session.role}`)}</strong></p>
          <button type="button" className="btn btn--primary" disabled={busy} onClick={() => onNavigate(destination(session))}>{t('saas.common.continue')}</button>
          <button type="button" className="btn btn--neutral" disabled={busy} onClick={() => logoutRequest.run(logout)}>{t('saas.common.signOut')}</button>
          <Notice error={logoutRequest.error} pending={logoutRequest.pending} />
        </> : <form key={`${mode}:${prefix}`} onSubmit={submit} noValidate aria-describedby={`${prefix}-notice`}>
          <fieldset className="saas-form" disabled={busy}>
            {student ? <>
              <Field id={`${prefix}-code`} label="login.classCode"><input id={`${prefix}-code`} name="classCode" type="text" autoComplete="off" autoCapitalize="characters" spellCheck={false} minLength={6} maxLength={16} required dir="ltr" aria-invalid={request.error ? true : undefined} /></Field>
              <Field id={`${prefix}-nickname`} label="login.nickname" hint="login.nicknameHint"><input id={`${prefix}-nickname`} name="nickname" type="text" autoComplete="off" minLength={2} maxLength={24} required aria-describedby={`${prefix}-nickname-hint`} aria-invalid={request.error ? true : undefined} /></Field>
              <SecretField id={`${prefix}-pin`} invalid={!!request.error} />
            </> : <>
              <Field id={`${prefix}-email`} label="login.email"><input id={`${prefix}-email`} name="email" type="email" inputMode="email" autoComplete="username" spellCheck={false} required dir="ltr" aria-invalid={request.error ? true : undefined} /></Field>
              <Field id={`${prefix}-password`} label="login.password"><input id={`${prefix}-password`} name="password" type="password" autoComplete="current-password" required aria-invalid={request.error ? true : undefined} /></Field>
            </>}
            <button className="btn btn--primary btn--block" type="submit">{t('saas.login.submit')}</button>
          </fieldset>
          <Notice id={`${prefix}-notice`} error={request.error || error} pending={busy} />
        </form>}
        <button type="button" className="btn btn--neutral" onClick={() => onNavigate(student ? ROUTES.staff : ROUTES.student)}>{t(student ? 'saas.login.toStaff' : 'saas.login.toStudent')}</button>
        <p className="saas-muted">{t(student ? 'saas.login.noStudentDemo' : 'saas.login.noSignup')}</p>
      </section>
      <div className="saas-login-aside"><MockBanner credentials={!student} /></div>
    </div>
  </div>;
}

export function TeacherLoginView(props) { return <LoginView {...props} />; }
export function StudentLoginView(props) { return <LoginView {...props} student />; }
