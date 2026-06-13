import styles from '../SmartRouting.module.css';
import { useConfig } from '../contexts/ConfigContext';
import { useInventory } from '../hooks/useInventory';

const GRADE_COLOR = { NEW: styles.gradeNew, USED: styles.gradeUsed, DAMAGED: styles.gradeDamaged };

/**
 * Shows a table of products currently sitting at local resale / temporary
 * storage points near the user.
 *
 * - Products within the holdout window  → "Available" (buyers can purchase)
 * - Products past the holdout window    → "Pending Recycle/Donate"
 *
 * Recycle/Donate is NOT an option until the holdout period has fully elapsed.
 */
export default function LocalResalePanel({ routingResult }) {
  const { LOCAL_RESALE_WINDOW_DAYS, CURRENCY_SYMBOL } = useConfig();
  const { decision, destination, discountedPrice, product, grade, eligibleDeliveryPoints } = routingResult;

  const { withinWindow, pastWindow } = useInventory();

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>🛍️ Local Resale Marketplace</h2>
      <p className={styles.cardSubtitle}>
        Since shipping cost exceeds the threshold, this product will be placed at a
        nearby temporary storage point for up to <strong>{LOCAL_RESALE_WINDOW_DAYS} days</strong>.
        Amazon users nearby can purchase it at a discounted price.
        Recycle / Donate only becomes an option once the full holdout period has elapsed.
      </p>

      {/* New product being routed — show where it will be listed */}
      {decision === 'LOCAL_RESALE' && destination && discountedPrice !== null && (
        <div className={styles.newListingBanner}>
          <div className={styles.newListingLeft}>
            <span className={styles.newListingTag}>New listing</span>
            <span className={styles.newListingName}>{product.name}</span>
            <span className={`${styles.gradeBadge} ${GRADE_COLOR[grade]}`}>{grade}</span>
          </div>
          <div className={styles.newListingRight}>
            <span className={styles.newListingPrice}>
              {CURRENCY_SYMBOL}{discountedPrice.toLocaleString('en-IN')}
            </span>
            <span className={styles.newListingOriginal}>
              was {CURRENCY_SYMBOL}{product.originalPrice.toLocaleString('en-IN')}
            </span>
            <span className={styles.newListingPoint}>📍 {destination.name}</span>
          </div>
        </div>
      )}

      {/* ── Active listings — within holdout window ── */}
      <h3 className={styles.sectionHeading}>
        ✅ Active Listings
        <span className={styles.sectionCount}>{withinWindow.length} product{withinWindow.length !== 1 ? 's' : ''}</span>
      </h3>
      <p className={styles.sectionNote}>
        These products are within the {LOCAL_RESALE_WINDOW_DAYS}-day holdout window.
        Nearby Amazon users can buy them at discounted prices.
      </p>

      {withinWindow.length > 0 ? (
        <div className={styles.tableWrapper}>
          <table className={styles.resaleTable}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Grade</th>
                <th>Storage Point</th>
                <th>Days Listed</th>
                <th>Discounted Price</th>
                <th>Nearby Buyers</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {withinWindow.map(item => {
                const daysLeft = LOCAL_RESALE_WINDOW_DAYS - item.daysListed;
                return (
                  <tr key={item.id}>
                    <td>
                      <span className={styles.productName}>{item.name}</span>
                      {item.interestedUsers.length > 0 && (
                        <span className={styles.interestedHint}>
                          👀 {item.interestedUsers.slice(0, 2).join(', ')}
                          {item.interestedUsers.length > 2 && ` +${item.interestedUsers.length - 2} more`}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`${styles.gradeBadge} ${GRADE_COLOR[item.grade]}`}>
                        {item.grade}
                      </span>
                    </td>
                    <td>
                      <span className={styles.pointName}>{item.deliveryPointName}</span>
                      <span className={styles.pointCity}>{item.city}</span>
                    </td>
                    <td>
                      <DaysBar days={item.daysListed} max={LOCAL_RESALE_WINDOW_DAYS} />
                    </td>
                    <td>
                      <span className={styles.discPrice}>
                        {CURRENCY_SYMBOL}{item.discountedPrice.toLocaleString('en-IN')}
                      </span>
                      <span className={styles.origPrice}>
                        {CURRENCY_SYMBOL}{item.originalPrice.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td>
                      <span className={styles.buyerCount}>{item.nearbyBuyers}</span>
                      <span className={styles.buyerLabel}> within 10 km</span>
                    </td>
                    <td>
                      <span className={styles.statusActive}>
                        ⏳ {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className={styles.emptyState}>No active listings at this time.</p>
      )}

      {/* ── Past holdout window — eligible for recycle/donate ── */}
      {pastWindow.length > 0 && (
        <>
          <h3 className={`${styles.sectionHeading} ${styles.sectionHeadingAlert}`}>
            ⚠️ Holdout Period Expired
            <span className={styles.sectionCount}>{pastWindow.length} product{pastWindow.length !== 1 ? 's' : ''}</span>
          </h3>
          <p className={styles.sectionNote}>
            These products were not sold within the {LOCAL_RESALE_WINDOW_DAYS}-day window.
            They are now eligible to be moved to recycling or donation facilities.
          </p>

          <div className={styles.tableWrapper}>
            <table className={styles.resaleTable}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Grade</th>
                  <th>Storage Point</th>
                  <th>Days Listed</th>
                  <th>Original Price</th>
                  <th>Nearby Buyers</th>
                  <th>Next Action</th>
                </tr>
              </thead>
              <tbody>
                {pastWindow.map(item => {
                  const overBy = item.daysListed - LOCAL_RESALE_WINDOW_DAYS;
                  const nextAction = item.grade === 'DAMAGED' ? '♻️ Recycle' : '❤️ Donate';
                  return (
                    <tr key={item.id} className={styles.expiredRow}>
                      <td>
                        <span className={styles.productName}>{item.name}</span>
                      </td>
                      <td>
                        <span className={`${styles.gradeBadge} ${GRADE_COLOR[item.grade]}`}>
                          {item.grade}
                        </span>
                      </td>
                      <td>
                        <span className={styles.pointName}>{item.deliveryPointName}</span>
                        <span className={styles.pointCity}>{item.city}</span>
                      </td>
                      <td>
                        <DaysBar days={item.daysListed} max={LOCAL_RESALE_WINDOW_DAYS} exceeded />
                      </td>
                      <td>
                        <span className={styles.origPrice}>
                          {CURRENCY_SYMBOL}{item.originalPrice.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td>
                        <span className={styles.buyerCount}>{item.nearbyBuyers}</span>
                        <span className={styles.buyerLabel}> within 10 km</span>
                      </td>
                      <td>
                        <span className={styles.statusExpired}>
                          {nextAction}
                          <span className={styles.overByLabel}> ({overBy}d over)</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/** Small inline day-progress bar */
function DaysBar({ days, max, exceeded }) {
  const pct = Math.min((days / max) * 100, 100);
  const color = exceeded ? '#ef4444' : pct >= 66 ? '#f59e0b' : '#22c55e';
  return (
    <div className={styles.daysBarWrapper}>
      <span className={styles.daysBarLabel}>{days}/{max} days</span>
      <div className={styles.daysBarTrack}>
        <div
          className={styles.daysBarFill}
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
