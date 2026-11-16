import { useI18n } from '../i18n/index.jsx';
import PlaceholderPanel from '../components/PlaceholderPanel.jsx';

/**
 * <DashboardView /> — placeholder for the teacher & parent dashboard.
 * Batch 3 replaces the panel with the real progress dashboard.
 *
 * @param {object}   props
 * @param {Function} props.onBack  returns to the catalog
 */
export default function DashboardView({ onBack }) {
  const { t } = useI18n();
  return (
    <PlaceholderPanel
      eyebrowIcon="insights"
      eyebrow={t('app.dashboardEyebrow')}
      title={t('app.dashboardTitle')}
      message={t('app.dashboardMessage')}
      onBack={onBack}
    />
  );
}
