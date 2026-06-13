import styles from '../SmartRouting.module.css';
import { recycleDonationBoxes, LOCAL_RESALE_WINDOW_DAYS } from '../data/mockData';

const GRADE_COLOR = { NEW: styles.gradeNew, USED: styles.gradeUsed, DAMAGED: styles.gradeDamaged };

const TYPE_CONFIG = {
  RECYCLE:  { icon: '♻️', label: 'Recycling', color: styles.recycleTag },
  DONATION: { icon: '❤️', label: 'Donation',  color: styles.donationTag },
};

export default function RecyclePage({ pastWindow }) {
  if (pastWindow.length === 0) {
    return (
      <div>
        <div className={styles.pageIntro}>
          <h2 className={styles.pageTitle}>♻️ Recycle &amp; Donate</h2>
          <p className={styles.pageSubtitle}>
            Products that complete their {LOCAL_RESALE_WINDOW_DAYS}-day resale window
            without a buyer are dispatched here.
          </p>
        </div>
        <div className={styles.card}>
          <p className={styles.emptyState}>
            🎉 No products are ready for recycling or donation yet. All items are
            still within their {LOCAL_RESALE_WINDOW_DAYS}-day resale window.
          </p>
        </div>
        <FacilityDirectory />
      </div>
    );
  }

  return (
    <div>
      <div className={styles.pageIntro}>
        <h2 className={styles.pageTitle}>♻️ Recycle &amp; Donate</h2>
        <p className={styles.pageSubtitle}>
          The following products completed their {LOCAL_RESALE_WINDOW_DAYS}-day resale
          window without a buyer. They are dispatched to the appropriate facility based
          on their condition — DAMAGED items go to recycling, others go to donation.
        </p>
      </div>

      {/* Dispatch list */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>
          📦 Ready to Dispatch
          <span className={styles.sectionCount} style={{ marginLeft: 8 }}>
            {pastWindow.length}
          </span>
        </h3>

        <div className={styles.dispatchList}>
          {pastWindow.map(item => {
            const facility =
              item.grade === 'DAMAGED'
                ? recycleDonationBoxes.find(b => b.type === 'RECYCLE' && b.city === item.city) ??
                  recycleDonationBoxes.find(b => b.type === 'RECYCLE')
                : recycleDonationBoxes.find(b => b.type === 'DONATION' && b.city === item.city) ??
                  recycleDonationBoxes.find(b => b.type === 'DONATION');

            const facilityConfig = TYPE_CONFIG[facility?.type ?? 'RECYCLE'];
            const overBy = item.daysListed - LOCAL_RESALE_WINDOW_DAYS;

            return (
              <div key={item.id} className={styles.dispatchRow}>
                {/* Product info */}
                <div className={styles.dispatchProduct}>
                  <span className={styles.productName}>{item.name}</span>
                  <span className={`${styles.gradeBadge} ${GRADE_COLOR[item.grade]}`}>
                    {item.grade}
                  </span>
                  <span className={styles.dispatchMeta}>
                    Listed {item.daysListed} days at {item.deliveryPointName}
                    {' — '}{overBy} day{overBy !== 1 ? 's' : ''} over window
                  </span>
                  <span className={styles.dispatchMeta}>
                    Added:{' '}
                    {new Date(item.listedAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>

                <div className={styles.dispatchArrow} aria-hidden="true">→</div>

                {/* Facility */}
                {facility ? (
                  <div className={styles.dispatchFacility}>
                    <span className={`${styles.rbTag} ${facilityConfig.color}`}>
                      {facilityConfig.icon} {facilityConfig.label}
                    </span>
                    <span className={styles.rbName}>{facility.name}</span>
                    <span className={styles.rbAddress}>{facility.address}</span>
                  </div>
                ) : (
                  <div className={styles.dispatchFacility}>
                    <span className={styles.rbName}>No facility found</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <FacilityDirectory />

      <div className={styles.card}>
        <div className={styles.infoBanner}>
          <span aria-hidden="true">ℹ️</span>
          <span>
            Functional items (NEW / USED) are routed to <strong>donation</strong>
            centres. Non-functional or DAMAGED items go to{' '}
            <strong>certified recycling</strong> facilities. Recycle / Donate is
            never triggered before the {LOCAL_RESALE_WINDOW_DAYS}-day holdout window closes.
          </span>
        </div>
      </div>
    </div>
  );
}

function FacilityDirectory() {
  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>🏢 Registered Facilities</h3>
      <div className={styles.rbGrid}>
        {recycleDonationBoxes.map(box => {
          const config = TYPE_CONFIG[box.type];
          return (
            <div key={box.id} className={styles.rbCard}>
              <div className={styles.rbIcon} aria-hidden="true">{config.icon}</div>
              <div className={styles.rbBody}>
                <span className={`${styles.rbTag} ${config.color}`}>{config.label}</span>
                <p className={styles.rbName}>{box.name}</p>
                <p className={styles.rbAddress}>{box.address}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
