import { useState, useMemo } from 'react';
import styles from '../SmartRouting.module.css';
import { warehouses, deliveryPoints, recycleDonationBoxes, CURRENCY_SYMBOL, DAMAGE_LEVELS } from '../data/mockData';
import { routeProduct } from '../utils/routingEngine';

import UserLocationInput from '../components/UserLocationInput';
import ProductSelector from '../components/ProductSelector';
import ShippingCostBreakdown from '../components/ShippingCostBreakdown';
import RoutingDecisionCard from '../components/RoutingDecisionCard';
import WarehouseMap from '../components/WarehouseMap';

export default function RoutePage({ onAddToResale, onAddToRecycle, onAddToWarehouse, onNavigate }) {
  const [userLocation, setUserLocation]           = useState(null);
  const [selectedProduct, setSelectedProduct]     = useState(null);
  const [selectedGrade, setSelectedGrade]         = useState('NEW');
  const [selectedDamageLevel, setSelectedDamageLevel] = useState(null);
  const [added, setAdded]                         = useState(false);

  const routingResult = useMemo(() => {
    if (!selectedProduct) return null;
    // Irrepairable doesn't need a location — route immediately
    if (selectedGrade === 'DAMAGED' && selectedDamageLevel === DAMAGE_LEVELS.IRREPAIRABLE) {
      return routeProduct({
        userLat: 0, userLng: 0,   // unused for DIRECT_RECYCLE
        grade: selectedGrade,
        damageLevel: selectedDamageLevel,
        product: selectedProduct,
        warehouses,
        deliveryPoints,
      });
    }
    if (!userLocation) return null;
    if (selectedGrade === 'DAMAGED' && !selectedDamageLevel) return null;
    return routeProduct({
      userLat: userLocation.lat,
      userLng: userLocation.lng,
      userLabel: userLocation.label,
      grade: selectedGrade,
      damageLevel: selectedDamageLevel,
      product: selectedProduct,
      warehouses,
      deliveryPoints,
    });
  }, [userLocation, selectedProduct, selectedGrade, selectedDamageLevel]);

  function handleProductChange(p)  { setSelectedProduct(p); setAdded(false); setSelectedDamageLevel(null); }
  function handleGradeChange(g)    { setSelectedGrade(g);   setAdded(false); setSelectedDamageLevel(null); }
  function handleDamageChange(d)   { setSelectedDamageLevel(d); setAdded(false); }
  function handleLocationSet(loc)  { setUserLocation(loc);  setAdded(false); }

  function handleAdd() {
    if (!routingResult) return;
    const { decision, destination, discountedPrice, product, grade, damageLevel } = routingResult;
    
    if (decision === 'LOCAL_RESALE') {
      onAddToResale({
        name: product.name,
        grade,
        damageLevel: damageLevel ?? DAMAGE_LEVELS.NONE,
        originalPrice: product.originalPrice,
        discountedPrice: discountedPrice ?? Math.round(product.originalPrice * 0.4),
        deliveryPointId: destination?.id ?? 'dp-1',
        deliveryPointName: destination?.name ?? 'Unknown Hub',
        city: destination?.city ?? '',
        category: product.category ?? '',
      });
    } else if (decision === 'DIRECT_RECYCLE') {
      const facility = recycleDonationBoxes.find(b => b.type === 'RECYCLE') ?? null;
      onAddToRecycle({
        name: product.name,
        grade,
        damageLevel: damageLevel ?? DAMAGE_LEVELS.IRREPAIRABLE,
        originalPrice: product.originalPrice,
        deliveryPointName: facility?.name ?? 'Recycling Facility',
        city: facility?.city ?? '',
        category: product.category ?? '',
      });
    } else if (decision === 'WAREHOUSE') {
      onAddToWarehouse({
        name: product.name,
        grade,
        damageLevel: damageLevel ?? DAMAGE_LEVELS.NONE,
        originalPrice: product.originalPrice,
        deliveryPointName: destination?.name ?? 'Amazon Warehouse',
        city: destination?.city ?? '',
        category: product.category ?? '',
      });
    }
    setAdded(true);
  }

  function handleReset() {
    setSelectedProduct(null);
    setSelectedGrade('NEW');
    setSelectedDamageLevel(null);
    setUserLocation(null);
    setAdded(false);
  }

  const isDirectRecycle   = routingResult?.decision === 'DIRECT_RECYCLE';
  const isLocalResale     = routingResult?.decision === 'LOCAL_RESALE';
  const needsLocation     = selectedProduct && !isDirectRecycle && !userLocation;
  const needsDamageLevel  = selectedGrade === 'DAMAGED' && !selectedDamageLevel;
  const showMap           = routingResult && !isDirectRecycle;

  // Pick a recycle facility for direct-recycle case
  const directRecycleFacility = isDirectRecycle
    ? recycleDonationBoxes.find(b => b.type === 'RECYCLE') ?? null
    : null;

  return (
    <div>
      {/* ── Step 1: Product first ── */}
      <ProductSelector
        selectedProduct={selectedProduct}
        selectedGrade={selectedGrade}
        selectedDamageLevel={selectedDamageLevel}
        onProductChange={handleProductChange}
        onGradeChange={handleGradeChange}
        onDamageLevelChange={handleDamageChange}
      />

      {/* ── Direct Recycle: show immediately after irrepairable is selected ── */}
      {isDirectRecycle && (
        <div className={`${styles.card} ${styles.directRecycleCard}`}>
          <div className={styles.decisionHeader}>
            <span className={styles.decisionIcon}>🗑️</span>
            <div>
              <p className={styles.decisionLabel}>Routing Decision</p>
              <h2 className={styles.decisionTitle}>Direct Recycle</h2>
            </div>
          </div>
          <p className={styles.decisionJustification}>
            This product has <strong>irrepairable damage</strong> and cannot be
            refurbished, resold, or returned to a warehouse. It will be sent
            directly to a certified recycling facility — no shipping cost incurred.
          </p>

          {directRecycleFacility && (
            <div className={styles.recycleFacilityBox}>
              <span className={styles.recycleFacilityIcon}>♻️</span>
              <div>
                <p className={styles.recycleFacilityName}>{directRecycleFacility.name}</p>
                <p className={styles.recycleFacilityAddress}>{directRecycleFacility.address}</p>
              </div>
              <button
                type="button"
                className={styles.viewRecycleBtn}
                onClick={() => onNavigate('recycle')}
              >
                View All Facilities →
              </button>
            </div>
          )}

          {added ? (
            <div className={styles.addedConfirmation} style={{ marginTop: 16 }}>
              <span>✅</span>
              <span>
                Added to Recycle List!{' '}
                <button type="button" className={styles.linkBtn} onClick={() => onNavigate('recycle')}>
                  View in Recycle & Donate →
                </button>
              </span>
            </div>
          ) : (
            <button type="button" className={styles.addBtn} style={{ marginTop: 16 }} onClick={handleAdd}>
              + Confirm &amp; Route to Recycle
            </button>
          )}

          <button type="button" className={styles.resetBtn} onClick={handleReset}>
            ← Route another product
          </button>
        </div>
      )}

      {/* ── Step 2: Location (only for non-irrepairable products) ── */}
      {!isDirectRecycle && selectedProduct && (
        <UserLocationInput onLocationSet={handleLocationSet} />
      )}

      {/* Prompt for damage level */}
      {selectedProduct && userLocation && needsDamageLevel && (
        <div className={styles.promptCard}>
          <span className={styles.promptIcon}>⬆️</span>
          <span>Please select a <strong>damage level</strong> above to see the routing decision.</span>
        </div>
      )}

      {/* ── Results ── */}
      {routingResult && !isDirectRecycle && (
        <>
          {/* ── LOCAL_RESALE: Add to marketplace FIRST ── */}
          {isLocalResale && (
            <div className={`${styles.card} ${styles.resalePrimaryCard}`}>
              <div className={styles.resalePrimaryHeader}>
                <span className={styles.resalePrimaryIcon}>🛍️</span>
                <div>
                  <h2 className={styles.resalePrimaryTitle}>Add to Local Resale Marketplace</h2>
                  <p className={styles.resalePrimarySubtitle}>
                    Shipping this back costs more than it's worth.
                    List it locally — buyers near {routingResult.destination?.city} can grab it at a great price.
                  </p>
                </div>
              </div>

              <div className={styles.addSummary}>
                <div className={styles.addRow}>
                  <span className={styles.addLabel}>Product</span>
                  <span className={styles.addValue}>{routingResult.product.name}</span>
                </div>
                <div className={styles.addRow}>
                  <span className={styles.addLabel}>Condition</span>
                  <span className={styles.addValue}>
                    {selectedGrade}{selectedDamageLevel ? ` — ${selectedDamageLevel}` : ''}
                  </span>
                </div>
                <div className={styles.addRow}>
                  <span className={styles.addLabel}>Storage Hub</span>
                  <span className={styles.addValue}>{routingResult.destination?.name}, {routingResult.destination?.city}</span>
                </div>
                <div className={styles.addRow}>
                  <span className={styles.addLabel}>Listing Price</span>
                  <span className={`${styles.addValue} ${styles.addPriceHighlight}`}>
                    {CURRENCY_SYMBOL}{(routingResult.discountedPrice ?? 0).toLocaleString('en-IN')}
                    <span className={styles.addPriceSub}>
                      {' '}({routingResult.discountPct}% off — was {CURRENCY_SYMBOL}{routingResult.product.originalPrice.toLocaleString('en-IN')})
                    </span>
                  </span>
                </div>
                <div className={styles.addRow}>
                  <span className={styles.addLabel}>Clock starts</span>
                  <span className={styles.addValue}>
                    {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
              </div>

              {added ? (
                <>
                  <div className={styles.addedConfirmation}>
                    <span>✅</span>
                    <span>
                      Listed on the marketplace!{' '}
                      <button type="button" className={styles.linkBtn} onClick={() => onNavigate('resale')}>
                        View in Local Resale →
                      </button>
                    </span>
                  </div>

                  {/* Preview card of newly listed item */}
                  <div className={styles.productCard} style={{ marginTop: 14 }}>
                    <div className={styles.productCardHeader}>
                      <div>
                        <div className={styles.productCardName}>{routingResult.product.name}</div>
                        <div className={styles.productCardCategory}>{routingResult.product.category}</div>
                      </div>
                    </div>
                    <div className={styles.productCardPricing}>
                      <span className={styles.productCardPrice}>
                        {CURRENCY_SYMBOL}{(routingResult.discountedPrice ?? 0).toLocaleString('en-IN')}
                      </span>
                      <span className={styles.productCardWas}>
                        {CURRENCY_SYMBOL}{routingResult.product.originalPrice.toLocaleString('en-IN')}
                      </span>
                      <span className={styles.productCardDiscount}>
                        {routingResult.discountPct}% off
                      </span>
                    </div>
                    <div className={styles.productCardMeta}>
                      <div className={styles.productCardMetaRow}>
                        <span className={styles.productCardMetaIcon}>📦</span>
                        <span>
                          {selectedGrade}{selectedDamageLevel ? ` — ${selectedDamageLevel}` : ''}
                        </span>
                      </div>
                      <div className={styles.productCardMetaRow}>
                        <span className={styles.productCardMetaIcon}>🏪</span>
                        <span>{routingResult.destination?.name}, {routingResult.destination?.city}</span>
                      </div>
                    </div>
                    <div className={styles.productCardFooter}>
                      <span className={styles.statusActive}>Just listed • 0 days</span>
                    </div>
                  </div>
                </>
              ) : (
                <button type="button" className={styles.addBtn} onClick={handleAdd}>
                  + Confirm &amp; List on Local Marketplace
                </button>
              )}
            </div>
          )}

          {/* Map + cost breakdown + decision card (supporting detail) */}
          {showMap && (
            <WarehouseMap
              userLocation={userLocation}
              nearestWarehouseId={routingResult.nearestWarehouse.id}
            />
          )}
          <ShippingCostBreakdown routingResult={routingResult} />
          <RoutingDecisionCard routingResult={routingResult} />

          {routingResult.decision === 'WAREHOUSE' && !added && (
            <button type="button" className={styles.addBtn} style={{ marginTop: 16 }} onClick={handleAdd}>
              + Confirm &amp; Route to Warehouse
            </button>
          )}
          {routingResult.decision === 'WAREHOUSE' && added && (
            <div className={styles.addedConfirmation} style={{ marginTop: 16 }}>
              <span>✅</span>
              <span>Successfully added to Returns List!</span>
            </div>
          )}

          <button type="button" className={styles.resetBtn} onClick={handleReset}>
            ← Route another product
          </button>
        </>
      )}
    </div>
  );
}
