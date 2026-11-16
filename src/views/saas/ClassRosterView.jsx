import Icon from '../../components/Icon.jsx';
import { getRank } from '../../config/game.js';
import { useI18n } from '../../i18n/index.jsx';
import { formatNumber } from '../../lib/arabic.js';
import { useSaas } from '../../state/saas.jsx';
import ClassCode from './ClassCode.jsx';
import { AccessBoundary, Field, MockBanner, Notice, PageHeading, ROUTES, STAFF_ROLES, SecretField, identityKey, pinValue, useRequest, useResource } from './shared.jsx';

function RosterBody({ classId, onNavigate }) {
  const { t } = useI18n();
  const { mode, session, api } = useSaas();
  const identity = identityKey(mode, session, classId);
  const allowed = STAFF_ROLES.includes(session?.role) && !!classId;
  // Fetch only the authorized roster. Never infer ownership from a route ID.
  const roster = useResource(identity, allowed, () => api.getRoster(classId), { students: [] });
  const classes = useResource(identity, allowed, () => api.getClasses(), { classes: [] });
  const enroll = useRequest(identity);
  const students = roster.data?.students || [];
  const selectedClass = classes.data?.classes?.find((item) => item.id === classId);
  function submit(event) {
    event.preventDefault();
    if (enroll.pending || !roster.loaded || roster.error || !classId) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const nickname = String(data.get('nickname') || '').trim();
    const pin = pinValue(data.get('pin'));
    form.elements.namedItem('pin').value = '';
    if (!nickname || !/^[0-9]{4}$/.test(pin)) return enroll.fail();
    enroll.run(() => api.createStudent(classId, { nickname, pin }), () => {
      form.reset();
      roster.reload();
      return 'roster.enrolled';
    });
  }
  return <div className="saas-page">
    <PageHeading title="roster.title" subtitle="roster.subtitle"><button type="button" className="btn btn--neutral" onClick={() => onNavigate(ROUTES.classes)}>{t('saas.common.back')}</button></PageHeading>
    <MockBanner />
    {!classId ? <p className="saas-notice saas-notice--error">{t('saas.roster.classMissing')}</p> : <div className="saas-workspace">
      <section className="card saas-panel saas-panel--list">
        <div className="saas-section-heading"><div><h2>{selectedClass ? <bdi>{selectedClass.name}</bdi> : t('saas.roster.listTitle')}</h2><p className="saas-muted">{t('saas.roster.count', { count: formatNumber(students.length) })}</p></div><button type="button" className="btn btn--neutral" disabled={roster.pending} onClick={roster.reload}>{t('saas.common.refresh')}</button></div>
        {selectedClass && !roster.error ? <ClassCode joinCode={selectedClass.joinCode} identity={identity} /> : null}
        <Notice error={roster.error || classes.error} pending={roster.pending} />
        <div className="saas-scroll" tabIndex={0} role="region" aria-label={t('saas.roster.listTitle')}>
          {roster.loaded && !students.length && !roster.error ? <div className="saas-empty"><h3>{t('saas.roster.emptyTitle')}</h3><p className="saas-muted">{t('saas.roster.emptyHint')}</p></div> : null}
          {students.length && !roster.error ? <table className="saas-roster-table"><thead><tr><th scope="col">{t('saas.roster.nickname')}</th><th scope="col">{t('saas.roster.stars')}</th><th scope="col">{t('saas.roster.rank')}</th></tr></thead><tbody>{students.map((student) => {
            const rank = getRank(student.stars);
            return <tr key={student.id}><th scope="row"><bdi>{student.nickname}</bdi></th><td><span className="saas-stars"><Icon name="star" filled size={18} />{formatNumber(student.stars)}</span></td><td><span className={`saas-rank saas-rank--${rank.tone}`}><Icon name={rank.icon} size={18} /><span>{t(`game.ranks.items.${rank.id}.name`)}</span></span></td></tr>;
          })}</tbody></table> : null}
        </div>
      </section>
      <section className="card saas-panel saas-panel--aside">
        <h2>{t('saas.roster.enrollTitle')}</h2>
        <p className="saas-muted">{t('saas.roster.privacy')}</p>
        <form key={identity} onSubmit={submit} noValidate aria-describedby="enrollment-notice">
          <fieldset className="saas-form" disabled={enroll.pending || !roster.loaded || !!roster.error}>
            <Field id="enrollment-nickname" label="login.nickname" hint="login.nicknameHint"><input id="enrollment-nickname" name="nickname" type="text" minLength={2} maxLength={24} required autoComplete="off" aria-describedby="enrollment-nickname-hint" aria-invalid={enroll.error ? true : undefined} /></Field>
            <SecretField id="enrollment-pin" enrollment invalid={!!enroll.error} />
            <button type="submit" className="btn btn--primary">{t('saas.roster.enroll')}</button>
          </fieldset>
          <Notice id="enrollment-notice" error={enroll.error} success={enroll.success} pending={enroll.pending} />
        </form>
      </section>
    </div>}
  </div>;
}

export function ClassRosterView(props) {
  return <AccessBoundary roles={STAFF_ROLES} onNavigate={props.onNavigate}><RosterBody {...props} /></AccessBoundary>;
}
