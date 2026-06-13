import styles from '../SmartRouting.module.css';
import { PRICE_PER_KM_PER_KG, CURRENCY_SYMBOL } from '../data/mockData';

export default function ShippingCostBreakdown({ routingResult }) {
  const { nearestWarehouse, shippingCost, threshold, thresholdPct, isShippingFeasible, product, discountedPrice, isFloorHit } = routingResult;

  // Don't show for direct-recycle (irrepairable) — there's no shipping calculation
  if (routingResult.decision === 'DIRECT_RECYCLE') return null;

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
          <span className={styles.costLabel}>Logistics Rate</span>
          <span className={styles.costValue}>
            {nearestWarehouse.distanceKm} km × {product.weight} kg × {CURRENCY_SYMBOL}{PRICE_PER_KM_PER_KG}
          </span>
        </div>
        <div className={`${styles.costRow} ${styles.costRowTotal}`}>
          <span className={styles.costLabel}>Estimated Shipping Cost</span>
          <span className={`${styles.costValue} ${isShippingFeasible ? styles.costGreen : styles.costRed}`}>
            {CURRENCY_SYMBOL}{shippingCost.toLocaleString('en-IN')}
          </span>
        </div>
        <div className={styles.costRow}>
          <span className={styles.costLabel}>
            Dynamic Threshold
            <span style={{ fontSize: 12, color: '#767676', marginLeft: 6 }}>({thresholdPct}% of Original Price)</span>
          </span>
          <span className={styles.costValue}>{CURRENCY_SYMBOL}{threshold.toLocaleString('en-IN')}</span>
        </div>
        <div className={styles.thresholdNote}>
          💡 Threshold is dynamic — set at <strong>{thresholdPct}% of original price</strong>
          {isFloorHit ? (
            <> (Hit minimum absolute floor of {CURRENCY_SYMBOL}50).</>
          ) : (
            <> ({CURRENCY_SYMBOL}{product.originalPrice.toLocaleString('en-IN')} × {thresholdPct}% = {CURRENCY_SYMBOL}{threshold.toLocaleString('en-IN')}).</>
          )}
          {' '}Shipping this product costs {isShippingFeasible ? 'less' : 'more'} than {CURRENCY_SYMBOL}{threshold.toLocaleString('en-IN')}
          {' '}to return — so {isShippingFeasible ? 'warehouse return' : 'local resale'} is triggered.
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
            : <><strong>Not worth shipping back.</strong> Cost exceeds {thresholdPct}% of the product's remaining value — exploring local alternatives.</>
          }
        </span>
      </div>
    </div>
  );
}
