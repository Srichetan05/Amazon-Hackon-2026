import {
  PRICE_PER_KM,
  LOCAL_RESALE_WINDOW_DAYS,
  CURRENCY_SYMBOL,
  DAMAGE_LEVELS,
  DAMAGE_DISCOUNT,
  getShippingThreshold,
} from '../data/mockData';

// ─── Geo helpers ─────────────────────────────────────────────────────────────

export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) { return (deg * Math.PI) / 180; }

export function findNearestWarehouse(userLat, userLng, warehouses) {
  let nearest = null, minDist = Infinity;
  for (const wh of warehouses) {
    const dist = calculateDistance(userLat, userLng, wh.lat, wh.lng);
    if (dist < minDist) { minDist = dist; nearest = { ...wh, distanceKm: Math.round(dist) }; }
  }
  return nearest;
}

export function calculateShippingCost(distanceKm) {
  return parseFloat((distanceKm * PRICE_PER_KM).toFixed(2));
}

export function scoreDeliveryPoint(point, distanceKm) {
  const loadRatio = point.currentLoad / point.capacityUnits;
  return (1 - loadRatio) * 50 + Math.max(0, 50 - distanceKm * 0.5);
}

export function getEligibleDeliveryPoints(userLat, userLng, grade, deliveryPoints, radiusKm = 50) {
  return deliveryPoints
    .map(dp => ({ ...dp, distanceKm: parseFloat(calculateDistance(userLat, userLng, dp.lat, dp.lng).toFixed(1)) }))
    .filter(dp => dp.distanceKm <= radiusKm && dp.isActive && dp.currentLoad < dp.capacityUnits && dp.acceptedGrades.includes(grade))
    .map(dp => ({ ...dp, score: parseFloat(scoreDeliveryPoint(dp, dp.distanceKm).toFixed(1)) }))
    .sort((a, b) => b.score - a.score);
}

// ─── Core routing logic ───────────────────────────────────────────────────────

/**
 * routeProduct — dynamic threshold + damage-level awareness
 *
 * Decision tree:
 *
 * 1. DAMAGED + IRREPAIRABLE  → DIRECT_RECYCLE  (never ship, never resell)
 * 2. shipping cost < dynamic threshold (8 % of product price)
 *    → WAREHOUSE
 * 3. shipping cost ≥ threshold AND eligible local delivery points exist
 *    → LOCAL_RESALE  (discount depends on damage level)
 * 4. shipping cost ≥ threshold AND no eligible local delivery points
 *    → RECYCLE_DONATE
 */
export function routeProduct({ userLat, userLng, grade, damageLevel, product, warehouses, deliveryPoints }) {
  // ── Step 0: irrepairable damage → skip everything ──
  const effectiveDamageLevel = grade === 'DAMAGED' ? (damageLevel ?? DAMAGE_LEVELS.MINOR) : DAMAGE_LEVELS.NONE;

  if (effectiveDamageLevel === DAMAGE_LEVELS.IRREPAIRABLE) {
    return {
      decision: 'DIRECT_RECYCLE',
      destination: null,
      nearestWarehouse: findNearestWarehouse(userLat, userLng, warehouses),
      shippingCost: 0,
      threshold: 0,
      isShippingFeasible: false,
      eligibleDeliveryPoints: [],
      justification: `This product has irrepairable damage and cannot be refurbished or resold. It will be sent directly to a certified recycling facility — no warehouse return needed.`,
      discountedPrice: null,
      resaleWindowDays: LOCAL_RESALE_WINDOW_DAYS,
      product,
      grade,
      damageLevel: effectiveDamageLevel,
    };
  }

  // ── Step 1: calculate shipping cost & dynamic threshold ──
  const nearestWarehouse = findNearestWarehouse(userLat, userLng, warehouses);
  const shippingCost     = calculateShippingCost(nearestWarehouse.distanceKm);
  const threshold        = getShippingThreshold(product.originalPrice);
  const isShippingFeasible = shippingCost < threshold;

  const eligiblePoints = getEligibleDeliveryPoints(userLat, userLng, grade, deliveryPoints);

  // ── Step 2: routing decision ──
  let decision, destination, justification;

  if (isShippingFeasible) {
    decision    = 'WAREHOUSE';
    destination = nearestWarehouse;
    justification =
      `Shipping cost ${CURRENCY_SYMBOL}${shippingCost.toLocaleString('en-IN')} is below the ` +
      `${CURRENCY_SYMBOL}${threshold.toLocaleString('en-IN')} threshold ` +
      `(8 % of product value). Product will be returned to the nearest warehouse.`;
  } else if (eligiblePoints.length > 0) {
    decision    = 'LOCAL_RESALE';
    destination = eligiblePoints[0];
    const discountPct = Math.round((1 - DAMAGE_DISCOUNT[effectiveDamageLevel]) * 100);
    justification =
      `Shipping cost ${CURRENCY_SYMBOL}${shippingCost.toLocaleString('en-IN')} exceeds the ` +
      `${CURRENCY_SYMBOL}${threshold.toLocaleString('en-IN')} threshold. ` +
      `Product will be listed at "${eligiblePoints[0].name}" for up to ${LOCAL_RESALE_WINDOW_DAYS} days ` +
      `at a ${discountPct} % discount.`;
  } else {
    decision    = 'RECYCLE_DONATE';
    destination = null;
    justification =
      `Shipping cost exceeds threshold and no eligible local hub is available. ` +
      `Product will be categorised for recycling or donation.`;
  }

  // ── Step 3: discounted price ──
  const discountMultiplier = DAMAGE_DISCOUNT[effectiveDamageLevel];
  const discountedPrice    = decision === 'LOCAL_RESALE'
    ? parseFloat((product.originalPrice * discountMultiplier).toFixed(0))
    : null;

  const discountPct = Math.round((1 - discountMultiplier) * 100);

  return {
    decision,
    destination,
    nearestWarehouse,
    shippingCost,
    threshold,
    isShippingFeasible,
    eligibleDeliveryPoints: eligiblePoints,
    justification,
    discountedPrice,
    discountPct,
    resaleWindowDays: LOCAL_RESALE_WINDOW_DAYS,
    product,
    grade,
    damageLevel: effectiveDamageLevel,
  };
}
