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
  const { pastWindow: expired, updateDecision } = useInventory();

  // Nothing to show if no product has exceeded the holdout
  if (expired.length === 0) return null;

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>♻️ Recycle &amp; Donation Dispatch</h2>
      <p className={styles.cardSubtitle}>
        The following products have completed their {LOCAL_RESALE_WINDOW_DAYS}-day resale
        window without a buyer. They will now be dispatched to the appropriate
        recycling or donation facility.
      </p>

      {/* Products to dispatch */}
      <div className={styles.dispatchList}>
        {expired.map(item => {
          return (
            <div key={item.id} className={styles.dispatchRow}>
              <div className={styles.dispatchProduct}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className={styles.productName}>{item.name}</span>
                  <span className={`${styles.gradeBadge} ${styles[`grade${item.grade.charAt(0)}${item.grade.slice(1).toLowerCase()}`]}`}>
                    {item.grade}
                  </span>
                </div>
                {item.grade === 'DAMAGED' && item.damageLevel && (
                  <span className={styles.dispatchMeta} style={{ color: '#b91c1c', fontWeight: 500, marginBottom: '2px' }}>
                    ⚠️ Damage Severity: {item.damageLevel}
                  </span>
                )}
                <span className={styles.dispatchMeta}>
                  Listed {item.daysListed} days at {item.deliveryPointName}
                </span>
              </div>
              <div className={styles.dispatchArrow} aria-hidden="true" style={{ margin: '0 12px' }}>→</div>
              <div className={styles.dispatchFacility}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button 
                    type="button"
                    className={styles.amzBtnPrimary} 
                    onClick={() => updateDecision(item.id, 'DONATE')}
                  >
                    <span style={{ fontSize: '16px', marginRight: '4px' }}>❤️</span> Donate
                  </button>
                  <button 
                    type="button"
                    className={styles.amzBtnSecondary} 
                    onClick={() => updateDecision(item.id, 'RECYCLE')}
                  >
                    <span style={{ fontSize: '16px', marginRight: '4px' }}>♻️</span> Recycle
                  </button>
                </div>
              </div>
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
          Items will be evaluated and routed to either <strong>donation</strong> or <strong>certified recycling</strong> facilities.
          Donation / Recycling is never triggered before the holdout window closes.
        </span>
      </div>
    </div>
  );
}
