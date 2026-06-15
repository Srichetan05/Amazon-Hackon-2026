import styles from '../SmartRouting.module.css';
import { useConfig } from '../contexts/ConfigContext';

const DECISION_CONFIG = {
  WAREHOUSE:       { icon: '🏭', title: 'Return to Warehouse',   colorClass: styles.decisionWarehouse      },
  LOCAL_RESALE:    { icon: '🛍️', title: 'Local Resale',          colorClass: styles.decisionLocal          },
  RECYCLE_DONATE:  { icon: '♻️', title: 'Recycle / Donate',      colorClass: styles.decisionRecycle        },
  DIRECT_RECYCLE:  { icon: '🗑️', title: 'Direct Recycle',        colorClass: styles.decisionDirectRecycle  },
};

export default function RoutingDecisionCard({ routingResult }) {
  const { CURRENCY_SYMBOL } = useConfig();
  if (!routingResult || routingResult.decision === 'DIRECT_RECYCLE') return null;

  const {
    decision, destination, justification,
    shippingCost, threshold, discountedPrice,
    discountPct, resaleWindowDays, product, damageLevel,
  } = routingResult;

  const config = DECISION_CONFIG[decision];

  return (
    <div className={`${styles.card} ${styles.decisionCard} ${config.colorClass}`}>
      <div className={styles.decisionHeader}>
        <span className={styles.decisionIcon} aria-hidden="true">{config.icon}</span>
        <div>
          <p className={styles.decisionLabel}>Routing Decision</p>
          <h2 className={styles.decisionTitle}>{config.title}</h2>
        </div>
      </div>

      <p className={styles.decisionJustification}>{justification}</p>

      <div className={styles.decisionDetails}>
        {decision === 'WAREHOUSE' && destination && (
          <>
            <DetailRow label="Destination"    value={destination.name} />
            <DetailRow label="Distance"       value={`${destination.distanceKm} km`} />
            <DetailRow label="Shipping Cost"  value={`${CURRENCY_SYMBOL}${shippingCost.toLocaleString('en-IN')}`} />
          </>
        )}

        {decision === 'LOCAL_RESALE' && destination && (
          <>
            <DetailRow label="Delivery Hub"   value={destination.name} />
            <DetailRow label="City"           value={destination.city} />
            <DetailRow label="Distance"       value={`${destination.distanceKm} km`} />
            <DetailRow label="Resale Window"  value={`${resaleWindowDays} days`} />
            <DetailRow label="Damage Level"   value={damageLevel ?? '—'} />
            {discountedPrice !== null && (
              <DetailRow
                label="Listing Price"
                value={`${CURRENCY_SYMBOL}${discountedPrice.toLocaleString('en-IN')} (${discountPct}% off — was ${CURRENCY_SYMBOL}${product.originalPrice.toLocaleString('en-IN')})`}
                highlight
              />
            )}
          </>
        )}

        {decision === 'RECYCLE_DONATE' && (
          <>
            <DetailRow label="Shipping Cost" value={`${CURRENCY_SYMBOL}${shippingCost.toLocaleString('en-IN')} (over ${CURRENCY_SYMBOL}${threshold.toLocaleString('en-IN')} threshold)`} />
            <DetailRow label="Next Step"     value="Categorise for recycling or donation after holdout" />
          </>
        )}

        {decision === 'DIRECT_RECYCLE' && (
          <>
            <DetailRow label="Damage Level"  value="Irrepairable — cannot be refurbished" />
            <DetailRow label="Next Step"     value="Send directly to certified recycling facility" />
            <DetailRow label="Shipping"      value="No warehouse return needed" />
          </>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value, highlight }) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={`${styles.detailValue} ${highlight ? styles.detailHighlight : ''}`}>
        {value}
      </span>
    </div>
  );
}
