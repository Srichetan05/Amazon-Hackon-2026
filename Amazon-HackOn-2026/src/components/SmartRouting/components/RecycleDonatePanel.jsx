import styles from '../SmartRouting.module.css';
import { useConfig } from '../contexts/ConfigContext';
import { useInventory } from '../hooks/useInventory';

const TYPE_CONFIG = {
  RECYCLE: { icon: '♻️', label: 'Recycling', color: styles.recycleTag },
  DONATION: { icon: '❤️', label: 'Donation', color: styles.donationTag },
};

/**
 * RecycleDonatePanel
 *
 * Only renders for products that have EXCEEDED the holdout window.
 * Products still within the resale window are NOT shown here —
 * recycle / donate is not an option until the holdout period is done.
 */
export default function RecycleDonatePanel() {
  const { recycleDonationBoxes, LOCAL_RESALE_WINDOW_DAYS } = useConfig();
  const { pastWindow: expired } = useInventory();

  // Nothing to show if no product has exceeded the holdout
  if (expired.length === 0) return null;

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>♻️ Recycle &amp; Donation Dispatch</h2>
      <p className={styles.cardSubtitle}>
        The following products have completed their {LOCAL_RESALE_WINDOW_DAYS}-day resale
        window without a buyer. They will now be dispatched to the appropriate
        recycling or donation facility based on their condition.
      </p>

      {/* Products to dispatch */}
      <div className={styles.dispatchList}>
        {expired.map(item => {
          const facility = item.grade === 'DAMAGED'
            ? recycleDonationBoxes.find(b => b.type === 'RECYCLE' && b.city === item.city)
              ?? recycleDonationBoxes.find(b => b.type === 'RECYCLE')
            : recycleDonationBoxes.find(b => b.type === 'DONATION' && b.city === item.city)
              ?? recycleDonationBoxes.find(b => b.type === 'DONATION');

          const facilityConfig = TYPE_CONFIG[facility?.type ?? 'RECYCLE'];

          return (
            <div key={item.id} className={styles.dispatchRow}>
              <div className={styles.dispatchProduct}>
                <span className={styles.productName}>{item.name}</span>
                <span className={`${styles.gradeBadge} ${styles[`grade${item.grade.charAt(0)}${item.grade.slice(1).toLowerCase()}`]}`}>
                  {item.grade}
                </span>
                <span className={styles.dispatchMeta}>
                  Listed {item.daysListed} days at {item.deliveryPointName}
                </span>
              </div>
              <div className={styles.dispatchArrow} aria-hidden="true">→</div>
              {facility ? (
                <div className={styles.dispatchFacility}>
                  <span className={`${styles.rbTag} ${facilityConfig.color}`}>
                    {facilityConfig.icon} {facilityConfig.label}
                  </span>
                  <span className={styles.rbName}>{facility.name}</span>
                  <span className={styles.rbAddress}>{facility.address}</span>
                </div>
              ) : (
                <span className={styles.dispatchFacility}>No facility found</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Facility directory */}
      <h3 className={styles.sectionHeading} style={{ marginTop: '24px' }}>
        Registered Facilities
      </h3>
      <div className={styles.rbGrid}>
        {recycleDonationBoxes.map((box) => {
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

      <div className={styles.infoBanner}>
        <span aria-hidden="true">ℹ️</span>
        <span>
          Functional items (NEW / USED) go to <strong>donation</strong>;
          non-functional or DAMAGED items go to <strong>certified recycling</strong>.
          Recycle/Donate is never triggered before the holdout window closes.
        </span>
      </div>
    </div>
  );
}
