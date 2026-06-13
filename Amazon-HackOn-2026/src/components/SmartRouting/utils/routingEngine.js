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

export function calculateShippingCost(distanceKm, weightKg, PRICE_PER_KM_PER_KG) {
  return parseFloat((distanceKm * PRICE_PER_KM_PER_KG * weightKg).toFixed(2));
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

// ─── Dynamic Logic ─────────────────────────────────────────────────────────────

function getDynamicDiscountPct(category, damageLevel, DAMAGE_LEVELS) {
  if (damageLevel === DAMAGE_LEVELS.IRREPAIRABLE) return 100; // 100% off (recycle)
  if (damageLevel === DAMAGE_LEVELS.MAJOR) return 60; // 60% off

  const isElectronics = category.toLowerCase().includes('phone') || category.toLowerCase().includes('tablet') || category.toLowerCase().includes('laptop') || category.toLowerCase().includes('audio') || category.toLowerCase().includes('speaker');

  if (damageLevel === DAMAGE_LEVELS.MINOR) {
    return isElectronics ? 20 : 30; // 20% off for minor electronics, 30% for others
  }
  
  // NONE (New/Open box)
  return isElectronics ? 10 : 20; // 10% off for new electronics, 20% for others
}

export function calculateDynamicThreshold(currentResaleValue, damageLevel, DAMAGE_LEVELS) {
  let pct = 0.20; // NEW / Open box
  if (damageLevel === DAMAGE_LEVELS.MINOR) pct = 0.12;
  else if (damageLevel === DAMAGE_LEVELS.MAJOR) pct = 0.08;
  
  const rawThreshold = Math.round(currentResaleValue * pct);
  const floor = 50;
  const isFloorHit = rawThreshold < floor;
  
  return {
    threshold: Math.max(floor, rawThreshold),
    thresholdPct: Math.round(pct * 100),
    isFloorHit
  };
}

// ─── Core routing logic ───────────────────────────────────────────────────────

export function routeProduct({ userLat, userLng, userLabel, grade, damageLevel, product, warehouses, deliveryPoints, config }) {
  const { PRICE_PER_KM_PER_KG, LOCAL_RESALE_WINDOW_DAYS, CURRENCY_SYMBOL, DAMAGE_LEVELS } = config;

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

  // ── Step 1: Calculate discounts and value ──
  const discountPct = getDynamicDiscountPct(product.category, effectiveDamageLevel, DAMAGE_LEVELS);
  const discountedPrice = parseFloat((product.originalPrice * (1 - discountPct / 100)).toFixed(0));

  const nearestWarehouse = findNearestWarehouse(userLat, userLng, warehouses);
  const shippingCost     = calculateShippingCost(nearestWarehouse.distanceKm, product.weight, PRICE_PER_KM_PER_KG);
  const { threshold, thresholdPct, isFloorHit } = calculateDynamicThreshold(product.originalPrice, effectiveDamageLevel, DAMAGE_LEVELS);
  const isShippingFeasible = shippingCost < threshold;

  // ── Step 3: routing decision ──
  let decision, destination, justification;

  if (isShippingFeasible) {
    decision    = 'WAREHOUSE';
    destination = nearestWarehouse;
    justification =
      `Shipping cost ${CURRENCY_SYMBOL}${shippingCost.toLocaleString('en-IN')} is below the ` +
      `${CURRENCY_SYMBOL}${threshold.toLocaleString('en-IN')} threshold ` +
      `(${thresholdPct}% of original price ${CURRENCY_SYMBOL}${product.originalPrice.toLocaleString('en-IN')}). Product will be returned to the nearest warehouse.`;
  } else {
    decision    = 'LOCAL_RESALE';
    const cleanCity = userLabel ? userLabel.split(',')[0] : 'Current Hub';
    destination = {
      id: `dp-${Math.random().toString(36).substr(2, 9)}`,
      name: `${cleanCity} Delivery point`,
      city: cleanCity,
      lat: userLat,
      lng: userLng,
    };
    
    justification =
      `Shipping cost ${CURRENCY_SYMBOL}${shippingCost.toLocaleString('en-IN')} exceeds the ` +
      `${CURRENCY_SYMBOL}${threshold.toLocaleString('en-IN')} threshold. ` +
      `Product will be listed at "${destination.name}" for up to ${LOCAL_RESALE_WINDOW_DAYS} days ` +
      `at a ${discountPct}% discount.`;
  }

  return {
    decision,
    destination,
    nearestWarehouse,
    shippingCost,
    threshold,
    thresholdPct,
    isFloorHit,
    isShippingFeasible,
    justification,
    discountedPrice,
    discountPct,
    resaleWindowDays: LOCAL_RESALE_WINDOW_DAYS,
    product,
    grade,
    damageLevel: effectiveDamageLevel,
  };
}
