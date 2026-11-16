import { useRef } from 'react';
import { useI18n } from '../../i18n/index.jsx';
import { Notice, useRequest } from './shared.jsx';

export default function ClassCode({ joinCode, identity }) {
  const { t } = useI18n();
  const input = useRef(null);
  const request = useRequest(`${identity}:${joinCode}`);
  async function copy() {
    if (request.pending || !joinCode) return;
    request.run(async () => {
      try {
        if (!navigator.clipboard?.writeText) throw new Error('clipboard_unavailable');
        await navigator.clipboard.writeText(joinCode);
        return true;
      } catch {
        return false;
      }
    }, (copied) => {
      if (copied) return 'classes.copied';
      input.current?.focus();
      input.current?.select();
      return 'classes.copyFallback';
    });
  }
  return <div className="saas-code">
    <label className="saas-field__label"><span>{t('saas.classes.code')}</span><input ref={input} className="saas-code__value" type="text" value={joinCode || ''} readOnly dir="ltr" autoComplete="off" /></label>
    <button type="button" className="btn btn--neutral" disabled={!joinCode || request.pending} onClick={copy}>{t('saas.classes.copy')}</button>
    <Notice success={request.success} />
  </div>;
}
