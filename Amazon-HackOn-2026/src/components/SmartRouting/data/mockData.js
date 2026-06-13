// ─── Smart Routing — Mock Data ───────────────────────────────────────────────

export const PRICE_PER_KM = 8;            // ₹ per km to ship to warehouse
export const LOCAL_RESALE_WINDOW_DAYS = 3; // days a product sits at a resale hub
export const CURRENCY_SYMBOL = '₹';

/**
 * Dynamic shipping threshold — based on product selling price.
 * Rule: shipping it back is worth it only if the cost is ≤ 8 % of
 * the product's original price.  (e.g. ₹60 000 phone → threshold ₹4 800)
 * Minimum floor of ₹500 so cheap items still have a sensible threshold.
 */
export function getShippingThreshold(originalPrice) {
  return Math.max(500, Math.round(originalPrice * 0.08));
}

/**
 * Damage level definitions.
 *
 * IRREPAIRABLE  — product cannot be fixed; never ship to warehouse → recycle directly
 * MAJOR         — significant damage; local resale at heavy discount (25 % of price)
 * MINOR         — minor cosmetic damage; local resale at moderate discount (50 %)
 * NONE          — no damage (used for NEW / USED products)
 */
export const DAMAGE_LEVELS = {
  IRREPAIRABLE: 'IRREPAIRABLE',
  MAJOR: 'MAJOR',
  MINOR: 'MINOR',
  NONE: 'NONE',
};

/** Discount multiplier by damage level */
export const DAMAGE_DISCOUNT = {
  IRREPAIRABLE: 0,      // never resold
  MAJOR: 0.25,
  MINOR: 0.50,
  NONE: 0.40,           // default for USED / NEW
};

export const warehouses = [
  { id: 'wh-1', name: 'Mumbai Warehouse',    lat: 19.076,  lng: 72.8777, city: 'Mumbai'    },
  { id: 'wh-2', name: 'Delhi Warehouse',     lat: 28.6139, lng: 77.209,  city: 'Delhi'     },
  { id: 'wh-3', name: 'Bengaluru Warehouse', lat: 12.9716, lng: 77.5946, city: 'Bengaluru' },
  { id: 'wh-4', name: 'Hyderabad Warehouse', lat: 17.385,  lng: 78.4867, city: 'Hyderabad' },
  { id: 'wh-5', name: 'Chennai Warehouse',   lat: 13.0827, lng: 80.2707, city: 'Chennai'   },
  { id: 'wh-6', name: 'Kolkata Warehouse',   lat: 22.5726, lng: 88.3639, city: 'Kolkata'   },
];

export const deliveryPoints = [
  { id: 'dp-1', name: 'Andheri Resale Hub',       lat: 19.1136, lng: 72.8697, city: 'Mumbai',    capacityUnits: 20, currentLoad: 8,  acceptedGrades: ['NEW','USED','DAMAGED'], isActive: true  },
  { id: 'dp-2', name: 'Powai Quick Sale',          lat: 19.1197, lng: 72.906,  city: 'Mumbai',    capacityUnits: 15, currentLoad: 14, acceptedGrades: ['NEW','USED','DAMAGED'], isActive: true  },
  { id: 'dp-3', name: 'Koramangala Resale Point',  lat: 12.9352, lng: 77.6245, city: 'Bengaluru', capacityUnits: 25, currentLoad: 5,  acceptedGrades: ['NEW','USED'],           isActive: true  },
  { id: 'dp-4', name: 'Indiranagar Outlet',        lat: 12.9784, lng: 77.6408, city: 'Bengaluru', capacityUnits: 10, currentLoad: 10, acceptedGrades: ['NEW'],                  isActive: false },
  { id: 'dp-5', name: 'Connaught Place Hub',       lat: 28.6315, lng: 77.2167, city: 'Delhi',     capacityUnits: 30, currentLoad: 12, acceptedGrades: ['NEW','USED','DAMAGED'], isActive: true  },
  { id: 'dp-6', name: 'Lajpat Nagar Resale',       lat: 28.5686, lng: 77.2434, city: 'Delhi',     capacityUnits: 18, currentLoad: 3,  acceptedGrades: ['NEW','USED'],           isActive: true  },
];

export const recycleDonationBoxes = [
  { id: 'rb-1', name: 'GreenCycle Mumbai',    type: 'RECYCLE',  city: 'Mumbai',    address: 'Dharavi Recycling Center, Mumbai'    },
  { id: 'rb-2', name: 'Care Donation Mumbai', type: 'DONATION', city: 'Mumbai',    address: 'NGO Hub, Kurla, Mumbai'              },
  { id: 'rb-3', name: 'EcoSort Bengaluru',    type: 'RECYCLE',  city: 'Bengaluru', address: 'HSR Layout Recycling Depot, Bengaluru'},
  { id: 'rb-4', name: 'Helping Hands Delhi',  type: 'DONATION', city: 'Delhi',     address: 'Okhla Social Center, Delhi'          },
  { id: 'rb-5', name: 'RecycleRight Delhi',   type: 'RECYCLE',  city: 'Delhi',     address: 'Noida Recycling Hub, Delhi NCR'      },
];

/**
 * sampleProducts — now includes optional `damageLevel` for DAMAGED items.
 */
export const sampleProducts = [
  { id: 'prod-001', name: 'Samsung Galaxy S22',          grade: 'USED',    weight: 0.5,  originalPrice: 58000, category: '📱 Smartphones'  },
  { id: 'prod-002', name: 'Sony WH-1000XM5 Headphones',  grade: 'NEW',     weight: 0.3,  originalPrice: 28000, category: '🎧 Audio'         },
  { id: 'prod-003', name: 'Apple iPad Air',               grade: 'DAMAGED', weight: 0.46, originalPrice: 52000, category: '💻 Tablets',       damageLevel: DAMAGE_LEVELS.MINOR        },
  { id: 'prod-004', name: 'Kindle Paperwhite',            grade: 'USED',    weight: 0.2,  originalPrice: 11000, category: '📖 E-Readers'     },
  { id: 'prod-005', name: 'boAt Rockerz 450',             grade: 'NEW',     weight: 0.25, originalPrice: 4000,  category: '🎧 Audio'         },
  { id: 'prod-006', name: 'OnePlus Nord CE 3',            grade: 'DAMAGED', weight: 0.18, originalPrice: 24000, category: '📱 Smartphones',   damageLevel: DAMAGE_LEVELS.MAJOR        },
  { id: 'prod-007', name: 'Realme Smart TV 43"',          grade: 'DAMAGED', weight: 8.5,  originalPrice: 32000, category: '📺 TVs',           damageLevel: DAMAGE_LEVELS.IRREPAIRABLE },
  { id: 'prod-008', name: 'Apple MacBook Air M2',         grade: 'USED',    weight: 1.24, originalPrice: 114900, category: '💻 Laptops'       },
  { id: 'prod-009', name: 'Dyson V12 Vacuum',             grade: 'USED',    weight: 2.3,  originalPrice: 58900, category: '🏠 Appliances'    },
  { id: 'prod-010', name: 'JBL Flip 6 Speaker',           grade: 'NEW',     weight: 0.55, originalPrice: 11999, category: '🔊 Speakers'      },
];

/**
 * Seed inventory — daysListed is used by useInventory to synthesise
 * a past timestamp so the live day counter works correctly.
 */
export const resaleInventory = [
  {
    id: 'inv-001',
    name: 'OnePlus 11 5G',
    grade: 'USED',
    damageLevel: DAMAGE_LEVELS.NONE,
    originalPrice: 61999,
    discountedPrice: 24800,
    daysListed: 4,
    deliveryPointId: 'dp-1',
    deliveryPointName: 'Andheri Resale Hub',
    city: 'Mumbai',
    nearbyBuyers: 14,
    interestedUsers: ['Rahul M.', 'Priya S.', 'Amit K.'],
    category: '📱 Smartphones',
  },
  {
    id: 'inv-002',
    name: 'boAt Airdopes 141',
    grade: 'NEW',
    damageLevel: DAMAGE_LEVELS.NONE,
    originalPrice: 1499,
    discountedPrice: 600,
    daysListed: 1,
    deliveryPointId: 'dp-1',
    deliveryPointName: 'Andheri Resale Hub',
    city: 'Mumbai',
    nearbyBuyers: 31,
    interestedUsers: ['Sneha P.', 'Rohit V.'],
    category: '🎧 Audio',
  },
  {
    id: 'inv-003',
    name: 'Kindle Paperwhite (10th Gen)',
    grade: 'USED',
    damageLevel: DAMAGE_LEVELS.NONE,
    originalPrice: 13999,
    discountedPrice: 5600,
    daysListed: 1,
    deliveryPointId: 'dp-2',
    deliveryPointName: 'Powai Quick Sale',
    city: 'Mumbai',
    nearbyBuyers: 9,
    interestedUsers: ['Deepa R.'],
    category: '📖 E-Readers',
  },
  {
    id: 'inv-004',
    name: 'Noise ColorFit Pro 4',
    grade: 'DAMAGED',
    damageLevel: DAMAGE_LEVELS.MAJOR,
    originalPrice: 4999,
    discountedPrice: 1250,
    daysListed: 5,
    deliveryPointId: 'dp-5',
    deliveryPointName: 'Connaught Place Hub',
    city: 'Delhi',
    nearbyBuyers: 6,
    interestedUsers: [],
    category: '⌚ Wearables',
  },
  {
    id: 'inv-005',
    name: 'Apple AirPods (3rd Gen)',
    grade: 'USED',
    damageLevel: DAMAGE_LEVELS.NONE,
    originalPrice: 19900,
    discountedPrice: 7960,
    daysListed: 2,
    deliveryPointId: 'dp-6',
    deliveryPointName: 'Lajpat Nagar Resale',
    city: 'Delhi',
    nearbyBuyers: 22,
    interestedUsers: ['Kavya T.', 'Manish G.', 'Neha B.'],
    category: '🎧 Audio',
  },
];
