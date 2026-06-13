import styles from '../SmartRouting.module.css';

const PAGES = [
  { id: 'route',     label: '🚚 Route a Return',        },
  { id: 'resale',    label: '🛍️ Local Resale',          },
  { id: 'recycle',   label: '♻️ Recycle & Donate',      },
];

export default function NavBar({ currentPage, onNavigate, expiredCount, activeCount }) {
  return (
    <nav className={styles.nav} aria-label="Main navigation">
      {PAGES.map(page => {
        const isActive = currentPage === page.id;
        let badge = null;
        if (page.id === 'resale' && activeCount > 0) badge = activeCount;
        if (page.id === 'recycle' && expiredCount > 0) badge = expiredCount;

        return (
          <button
            key={page.id}
            type="button"
            className={`${styles.navBtn} ${isActive ? styles.navBtnActive : ''}`}
            onClick={() => onNavigate(page.id)}
            aria-current={isActive ? 'page' : undefined}
          >
            {page.label}
            {badge !== null && (
              <span className={`${styles.navBadge} ${page.id === 'recycle' ? styles.navBadgeAlert : ''}`}>
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
