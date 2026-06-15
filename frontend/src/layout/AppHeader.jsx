import appStyles from './AppShell.module.css';

/**
 * AppHeader — Amazon-style global top bar.
 *
 * Contains:
 *  - Amazon logo / brand
 *  - Primary site navigation (one tab per feature)
 *  - Right-side utility area (placeholder for cart/account — ready for teammates)
 *
 * Props:
 *  currentFeature  — active feature key
 *  onNavigate      — (featureKey: string) => void
 *  features        — array of { key, label, icon }
 */
export default function AppHeader({ currentFeature, onNavigate, features }) {
  return (
    <header className={appStyles.appHeader} role="banner">
      {/* Brand */}
      <div className={appStyles.headerBrand} onClick={() => onNavigate(features[0]?.key)} role="button" tabIndex={0} aria-label="Go to home">
        <span className={appStyles.brandBox}>
          <span className={appStyles.brandAmazon}>amazon</span>
          <span className={appStyles.brandDot}>.in</span>
        </span>
        <span className={appStyles.brandTagline}>HackOn 2026</span>
      </div>

      {/* Feature navigation */}
      <nav className={appStyles.headerNav} aria-label="Feature navigation">
        {features.map(f => (
          <button
            key={f.key}
            type="button"
            className={`${appStyles.headerNavBtn} ${currentFeature === f.key ? appStyles.headerNavBtnActive : ''}`}
            onClick={() => onNavigate(f.key)}
            aria-current={currentFeature === f.key ? 'page' : undefined}
          >
            <span className={appStyles.headerNavIcon} aria-hidden="true">{f.icon}</span>
            {f.label}
          </button>
        ))}
      </nav>

      {/* Right utility area — ready for teammates to add account / cart */}
      <div className={appStyles.headerUtils}>
        <button type="button" className={appStyles.utilBtn} aria-label="Account">
          👤 <span className={appStyles.utilLabel}>Account</span>
        </button>
        <button type="button" className={appStyles.utilBtn} aria-label="Cart">
          🛒 <span className={appStyles.utilLabel}>Cart</span>
        </button>
      </div>
    </header>
  );
}
