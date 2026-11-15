/**
 * <BrandMark /> — the مِسبار logotype.
 *
 * The mark is a four-point "probe" star (مِسبار = probe) with a reward-yellow
 * core, set in a soft-blue tile; the wordmark is Cairo ExtraBold.
 */
export default function BrandMark() {
  return (
    <div className="brand">
      <span className="brand__mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" focusable="false">
          <path
            d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z"
            style={{ fill: 'var(--accent-primary)', stroke: 'var(--accent-primary-soft-text)' }}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="3" style={{ fill: 'var(--accent-reward)' }} />
        </svg>
      </span>
      <span className="brand__word">مِسبار</span>
    </div>
  );
}
