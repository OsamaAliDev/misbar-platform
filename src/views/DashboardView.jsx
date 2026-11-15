import PlaceholderPanel from '../components/PlaceholderPanel.jsx';

/**
 * <DashboardView /> — placeholder for the teacher & parent dashboard.
 * Batch 3 replaces the panel with the real progress dashboard.
 *
 * @param {object}   props
 * @param {Function} props.onBack  returns to the catalog
 */
export default function DashboardView({ onBack }) {
  return (
    <PlaceholderPanel
      eyebrowIcon="insights"
      eyebrow="لوحة المتابعة"
      title="لوحة المعلم وولي الأمر"
      message="هنا هتتابع قريباً تقدّم الأبطال في التجارب والنجوم اللي جمعوها، من غير أي بيانات شخصية."
      onBack={onBack}
    />
  );
}
