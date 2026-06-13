import styles from '../SmartRouting.module.css';

const PAGES = [
  { id: 'route',   emoji: '🚚', label: 'Route a Return'   },
  { id: 'resale',  emoji: '🛍️', label: 'Local Resale'     },
  { id: 'recycle', emoji: '♻️', label: 'Recycle & Donate' },
];

export default function NavBar({ currentPage, onNavigate, expiredCount, activeCount }) {
  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav} aria-label="Returns Centre navigation">
        <p className={styles.navSectionLabel}>Returns Centre</p>
        {PAGES.map(page => {
          const isActive = currentPage === page.id;
          let badge = null;
          if (page.id === 'resale'  && activeCount  > 0) badge = { count: activeCount,  alert: false };
          if (page.id === 'recycle' && expiredCount > 0) badge = { count: expiredCount, alert: true  };

          return (
            <button
              key={page.id}
              type="button"
              className={`${styles.navBtn} ${isActive ? styles.navBtnActive : ''}`}
              onClick={() => onNavigate(page.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={styles.navBtnInner}>
                <span>{page.emoji}</span>
                <span className={styles.navBtnText}>{page.label}</span>
              </span>
              {badge !== null && (
                <span className={`${styles.navBadge} ${badge.alert ? styles.navBadgeAlert : ''}`}>
                  {badge.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
