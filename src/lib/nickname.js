import arCommon from '../i18n/locales/ar/common.js';

export function displayNickname(nickname, t) {
  return nickname === arCommon.defaultNickname ? t('common.defaultNickname') : nickname;
}
