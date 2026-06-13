import styles from '../SmartRouting.module.css';
import { PRICE_PER_KM, CURRENCY_SYMBOL } from '../data/mockData';

export default function ShippingCostBreakdown({ routingResult }) {
  const { nearestWarehouse, shippingCost, threshold, isShippingFeasible, product } = routingResult;

  // Don't show for direct-recycle (irrepairable) — there's no shipping calculation
  if (routingResult.decision === 'DIRECT_RECYCLE') return null;

  const thresholdPct = Math.round((threshold / product.originalPrice) * 100);

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>
        <span className={styles.stepBadge}>3</span> Shipping Cost Analysis
      </h2>

      <div className={styles.costTable}>
        <div className={styles.costRow}>
          <span className={styles.costLabel}>Nearest Warehouse</span>
          <span className={styles.costValue}>{nearestWarehouse.name}</span>
        </div>
        <div className={styles.costRow}>
          <span className={styles.costLabel}>Distance</span>
          <span className={styles.costValue}>{nearestWarehouse.distanceKm} km</span>
        </div>
        <div className={styles.costRow}>
          <span className={styles.costLabel}>Shipping Rate</span>
          <span className={styles.costValue}>{CURRENCY_SYMBOL}{PRICE_PER_KM} / km</span>
        </div>
        <div className={`${styles.costRow} ${styles.costRowTotal}`}>
          <span className={styles.costLabel}>Estimated Shipping Cost</span>
          <span className={`${styles.costValue} ${isShippingFeasible ? styles.costGreen : styles.costRed}`}>
            {CURRENCY_SYMBOL}{shippingCost.toLocaleString('en-IN')}
          </span>
        </div>
        <div className={styles.costRow}>
          <span className={styles.costLabel}>
            Shipping Threshold
            <span style={{ fontSize: 12, color: '#767676', marginLeft: 6 }}>({thresholdPct}% of product value)</span>
          </span>
          <span className={styles.costValue}>{CURRENCY_SYMBOL}{threshold.toLocaleString('en-IN')}</span>
        </div>
        <div className={styles.thresholdNote}>
          💡 Threshold is dynamic — set at <strong>8% of product value</strong>
          ({CURRENCY_SYMBOL}{product.originalPrice.toLocaleString('en-IN')} × 8% = {CURRENCY_SYMBOL}{threshold.toLocaleString('en-IN')}).
          Shipping a {CURRENCY_SYMBOL}{product.originalPrice.toLocaleString('en-IN')} product costs more than {CURRENCY_SYMBOL}{threshold.toLocaleString('en-IN')}
          {' '}to return — so local resale is triggered.
        </div>
      </div>

      <div
        className={`${styles.feasibilityBanner} ${isShippingFeasible ? styles.feasibleBanner : styles.infeasibleBanner}`}
        role="status"
      >
        <span className={styles.bannerIcon}>{isShippingFeasible ? '✅' : '⚠️'}</span>
        <span>
          {isShippingFeasible
            ? <><strong>Cost-effective to ship.</strong> Shipping cost is within the {thresholdPct}% threshold — product will be returned to the warehouse.</>
            : <><strong>Not worth shipping back.</strong> Cost exceeds the {thresholdPct}% threshold for this product's value — exploring local alternatives.</>
          }
        </span>
      </div>
    </div>
  );
}
