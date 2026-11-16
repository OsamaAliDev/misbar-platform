import { useI18n } from '../../i18n/index.jsx';
import { formatNumber } from '../../lib/arabic.js';
import { useSaas } from '../../state/saas.jsx';
import ClassCode from './ClassCode.jsx';
import { AccessBoundary, Field, MockBanner, Notice, PageHeading, ROUTES, STAFF_ROLES, identityKey, useRequest, useResource } from './shared.jsx';

function ClassesBody({ onNavigate }) {
  const { t } = useI18n();
  const { mode, session, api } = useSaas();
  const identity = identityKey(mode, session);
  const allowed = STAFF_ROLES.includes(session?.role);
  const list = useResource(identity, allowed, () => api.getClasses(), { classes: [] });
  const create = useRequest(identity);
  const classes = list.error ? [] : list.data?.classes || [];
  function submit(event) {
    event.preventDefault();
    if (create.pending) return;
    const form = event.currentTarget;
    const name = String(new FormData(form).get('name') || '').trim();
    if (!name) return create.fail();
    create.run(() => api.createClass({ name }), () => {
      form.reset();
      list.reload();
      return 'classes.created';
    });
  }
  return <div className="saas-page">
    <PageHeading title="classes.title" subtitle="classes.subtitle"><button type="button" className="btn btn--neutral" disabled={list.pending} onClick={list.reload}>{t('saas.common.refresh')}</button></PageHeading>
    <MockBanner />
    <div className="saas-workspace">
      <section className="card saas-panel saas-panel--list">
        <div className="saas-section-heading"><h2>{t('saas.classes.listTitle')}</h2><span className="badge badge--info">{t('saas.classes.count', { count: formatNumber(classes.length) })}</span></div>
        <Notice error={list.error} pending={list.pending} />
        <div className="saas-scroll" tabIndex={0} role="region" aria-label={t('saas.classes.listTitle')}>
          {list.loaded && !list.error && !classes.length ? <div className="saas-empty"><h3>{t('saas.classes.emptyTitle')}</h3><p className="saas-muted">{t('saas.classes.emptyHint')}</p></div> : null}
          <ul className="saas-list">{classes.map((item) => <li key={item.id} className="saas-class-row"><div className="saas-section-heading"><h3><bdi>{item.name}</bdi></h3><button type="button" className="btn btn--primary" onClick={() => onNavigate(ROUTES.roster, { classId: item.id })}>{t('saas.classes.open')}</button></div><ClassCode joinCode={item.joinCode} identity={`${identity}:${item.id}`} /></li>)}</ul>
        </div>
      </section>
      <section className="card saas-panel saas-panel--aside">
        <h2>{t('saas.classes.createTitle')}</h2>
        <form key={identity} onSubmit={submit} noValidate aria-describedby="class-create-notice">
          <fieldset className="saas-form" disabled={create.pending}>
            <Field id="class-name" label="classes.name" hint="classes.nameHint"><input id="class-name" name="name" type="text" maxLength={80} required autoComplete="off" aria-describedby="class-name-hint" aria-invalid={create.error ? true : undefined} /></Field>
            <button className="btn btn--primary" type="submit">{t('saas.classes.create')}</button>
          </fieldset>
          <Notice id="class-create-notice" error={create.error} success={create.success} pending={create.pending} />
        </form>
        <p className="saas-muted">{t('saas.classes.teacherScope')}</p>
      </section>
    </div>
  </div>;
}

export function ClassesView(props) {
  return <AccessBoundary roles={STAFF_ROLES} onNavigate={props.onNavigate}><ClassesBody {...props} /></AccessBoundary>;
}
