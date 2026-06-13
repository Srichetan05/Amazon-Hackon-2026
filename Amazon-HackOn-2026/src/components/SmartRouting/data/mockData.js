// ─── Smart Routing — Mock Data ───────────────────────────────────────────────

export const PRICE_PER_KM_PER_KG = 10;       // ₹ per km per kg to ship
export const LOCAL_RESALE_WINDOW_DAYS = 3; // days a product sits at a resale hub
export const CURRENCY_SYMBOL = '₹';

/**
 * Damage level definitions.
 *
 * IRREPAIRABLE  — product cannot be fixed; never ship to warehouse → recycle directly
 * MAJOR         — significant damage
 * MINOR         — minor cosmetic damage
 * NONE          — no damage (used for NEW products)
 */
export const DAMAGE_LEVELS = {
  IRREPAIRABLE: 'IRREPAIRABLE',
  MAJOR: 'MAJOR',
  MINOR: 'MINOR',
  NONE: 'NONE',
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
  { id: 'dp-1', name: 'Andheri Resale Hub',       lat: 19.1136, lng: 72.8697, city: 'Mumbai',    capacityUnits: 20, currentLoad: 8,  acceptedGrades: ['NEW','DAMAGED'], isActive: true  },
  { id: 'dp-2', name: 'Powai Quick Sale',          lat: 19.1197, lng: 72.906,  city: 'Mumbai',    capacityUnits: 15, currentLoad: 14, acceptedGrades: ['NEW','DAMAGED'], isActive: true  },
  { id: 'dp-3', name: 'Koramangala Resale Point',  lat: 12.9352, lng: 77.6245, city: 'Bengaluru', capacityUnits: 25, currentLoad: 5,  acceptedGrades: ['NEW'],           isActive: true  },
  { id: 'dp-4', name: 'Indiranagar Outlet',        lat: 12.9784, lng: 77.6408, city: 'Bengaluru', capacityUnits: 10, currentLoad: 10, acceptedGrades: ['NEW'],                  isActive: false },
  { id: 'dp-5', name: 'Connaught Place Hub',       lat: 28.6315, lng: 77.2167, city: 'Delhi',     capacityUnits: 30, currentLoad: 12, acceptedGrades: ['NEW','DAMAGED'], isActive: true  },
  { id: 'dp-6', name: 'Lajpat Nagar Resale',       lat: 28.5686, lng: 77.2434, city: 'Delhi',     capacityUnits: 18, currentLoad: 3,  acceptedGrades: ['NEW'],           isActive: true  },
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
  { id: 'prod-001', name: 'Samsung Galaxy S22',          grade: 'NEW',    weight: 0.5,  originalPrice: 58000, category: '📱 Smartphones'  },
  { id: 'prod-002', name: 'Apple 20W USB-C Adapter',     grade: 'NEW',     weight: 0.1,  originalPrice: 1900,  category: '🔌 Accessories'     },
  { id: 'prod-003', name: 'Nike Revolution 6 Shoes',      grade: 'DAMAGED', weight: 0.8,  originalPrice: 3695,  category: '👟 Footwear',      damageLevel: DAMAGE_LEVELS.MINOR        },
  { id: 'prod-004', name: 'Amazon Basics HDMI Cable',     grade: 'NEW',    weight: 0.15, originalPrice: 399,   category: '🔌 Accessories'     },
  { id: 'prod-005', name: 'boAt Rockerz 450',             grade: 'NEW',     weight: 0.25, originalPrice: 1499,  category: '🎧 Audio'         },
  { id: 'prod-006', name: 'OnePlus Nord CE 3',            grade: 'DAMAGED', weight: 0.18, originalPrice: 24000, category: '📱 Smartphones',   damageLevel: DAMAGE_LEVELS.MAJOR        },
  { id: 'prod-007', name: 'Realme Smart TV 43"',          grade: 'DAMAGED', weight: 8.5,  originalPrice: 32000, category: '📺 TVs',           damageLevel: DAMAGE_LEVELS.IRREPAIRABLE },
  { id: 'prod-008', name: 'Puma Core Backpack',           grade: 'NEW',    weight: 0.4,  originalPrice: 1299,  category: '🎒 Bags'            },
  { id: 'prod-009', name: 'Dyson V12 Vacuum',             grade: 'NEW',    weight: 2.3,  originalPrice: 58900, category: '🏠 Appliances'    },
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
    grade: 'NEW',
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
    grade: 'NEW',
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
    grade: 'NEW',
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
