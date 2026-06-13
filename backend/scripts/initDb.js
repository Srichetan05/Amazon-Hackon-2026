import pool from '../db.js';

const DDL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Locations
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'warehouse', 'delivery_point', 'hub'
  address TEXT NOT NULL,
  latitude DECIMAL,
  longitude DECIMAL
);

-- 2. Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  manufacturer VARCHAR(255),
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Product Instances
CREATE TABLE IF NOT EXISTS product_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  serial_number VARCHAR(100),
  public_id VARCHAR(100) UNIQUE,
  packaging_date DATE,
  delivery_date DATE,
  current_status VARCHAR(50) NOT NULL, -- 'in_transit', 'delivered', 'returned', 'graded', 'routed', 'resold'
  current_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Product Events
CREATE TABLE IF NOT EXISTS product_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_instance_id UUID REFERENCES product_instances(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'delivered', 'returned', 'graded', 'routed', 'moved', 'resold'
  event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  from_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  to_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  reason TEXT,
  metadata JSONB
);

-- 5. Grading Results
CREATE TABLE IF NOT EXISTS grading_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_instance_id UUID REFERENCES product_instances(id) ON DELETE CASCADE,
  image_url TEXT,
  model_name VARCHAR(100),
  grade VARCHAR(50) NOT NULL, -- 'new', 'used', 'damaged'
  confidence FLOAT,
  description TEXT, -- Stores specific damageLevel like 'MAJOR', 'MINOR', 'NONE'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Routing Decisions
CREATE TABLE IF NOT EXISTS routing_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_instance_id UUID REFERENCES product_instances(id) ON DELETE CASCADE,
  decision VARCHAR(100) NOT NULL, -- 'local_delivery_point', 'warehouse', 'direct_recycle'
  local_cost DECIMAL DEFAULT 0,
  warehouse_cost DECIMAL DEFAULT 0,
  estimated_resale_value DECIMAL DEFAULT 0,
  savings DECIMAL DEFAULT 0,
  decided_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const WAREHOUSES = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Mumbai Warehouse', type: 'warehouse', address: 'Plot 4, Kalamboli, Mumbai', lat: 19.076, lng: 72.8777 },
  { id: '11111111-1111-1111-1111-111111111112', name: 'Delhi Warehouse', type: 'warehouse', address: 'Khasra 32, Okhla Phase 3, Delhi', lat: 28.6139, lng: 77.209 },
  { id: '11111111-1111-1111-1111-111111111113', name: 'Bengaluru Warehouse', type: 'warehouse', address: 'Survey 45, Whitefield, Bengaluru', lat: 12.9716, lng: 77.5946 },
  { id: '11111111-1111-1111-1111-111111111114', name: 'Hyderabad Warehouse', type: 'warehouse', address: 'Survey 109, Gachibowli, Hyderabad', lat: 17.385, lng: 78.4867 },
  { id: '11111111-1111-1111-1111-111111111115', name: 'Chennai Warehouse', type: 'warehouse', address: 'Plot 12, Sriperumbudur, Chennai', lat: 13.0827, lng: 80.2707 },
  { id: '11111111-1111-1111-1111-111111111116', name: 'Kolkata Warehouse', type: 'warehouse', address: 'NH-6, Howrah, Kolkata', lat: 22.5726, lng: 88.3639 }
];

const DELIVERY_POINTS = [
  { id: '22222222-2222-2222-2222-222222222221', name: 'Andheri Resale Hub', type: 'delivery_point', address: 'Metro Station, Andheri East, Mumbai', lat: 19.1136, lng: 72.8697 },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Powai Quick Sale', type: 'delivery_point', address: 'Hiranandani Gardens, Powai, Mumbai', lat: 19.1197, lng: 72.906 },
  { id: '22222222-2222-2222-2222-222222222223', name: 'Koramangala Resale Point', type: 'delivery_point', address: '80 Feet Rd, Koramangala, Bengaluru', lat: 12.9352, lng: 77.6245 },
  { id: '22222222-2222-2222-2222-222222222224', name: 'Indiranagar Outlet', type: 'delivery_point', address: '100 Feet Rd, Indiranagar, Bengaluru', lat: 12.9784, lng: 77.6408 },
  { id: '22222222-2222-2222-2222-222222222225', name: 'Connaught Place Hub', type: 'delivery_point', address: 'Inner Circle, Connaught Place, Delhi', lat: 28.6315, lng: 77.2167 },
  { id: '22222222-2222-2222-2222-222222222226', name: 'Lajpat Nagar Resale', type: 'delivery_point', address: 'Central Market, Lajpat Nagar, Delhi', lat: 28.5686, lng: 77.2434 }
];

const MOCK_PRODUCTS = [
  { id: '33333333-3333-3333-3333-333333333301', sku: 'SKU-S22', name: 'Samsung Galaxy S22', manufacturer: 'Samsung', category: '📱 Smartphones' },
  { id: '33333333-3333-3333-3333-333333333302', sku: 'SKU-20W', name: 'Apple 20W USB-C Adapter', manufacturer: 'Apple', category: '🔌 Accessories' },
  { id: '33333333-3333-3333-3333-333333333303', sku: 'SKU-REV6', name: 'Nike Revolution 6 Shoes', manufacturer: 'Nike', category: '👟 Footwear' },
  { id: '33333333-3333-3333-3333-333333333304', sku: 'SKU-HDMI', name: 'Amazon Basics HDMI Cable', manufacturer: 'Amazon', category: '🔌 Accessories' },
  { id: '33333333-3333-3333-3333-333333333305', sku: 'SKU-BOAT450', name: 'boAt Rockerz 450', manufacturer: 'boAt', category: '🎧 Audio' },
  { id: '33333333-3333-3333-3333-333333333306', sku: 'SKU-NORD3', name: 'OnePlus Nord CE 3', manufacturer: 'OnePlus', category: '📱 Smartphones' },
  { id: '33333333-3333-3333-3333-333333333307', sku: 'SKU-TV43', name: 'Realme Smart TV 43"', manufacturer: 'Realme', category: '📺 TVs' },
  { id: '33333333-3333-3333-3333-333333333308', sku: 'SKU-PUMABP', name: 'Puma Core Backpack', manufacturer: 'Puma', category: '🎒 Bags' },
  { id: '33333333-3333-3333-3333-333333333309', sku: 'SKU-DYSONV12', name: 'Dyson V12 Vacuum', manufacturer: 'Dyson', category: '🏠 Appliances' },
  { id: '33333333-3333-3333-3333-333333333310', sku: 'SKU-JBL6', name: 'JBL Flip 6 Speaker', manufacturer: 'JBL', category: '🔊 Speakers' }
];

const INITIAL_INVENTORY = [
  {
    id: '44444444-4444-4444-4444-444444444401',
    productId: '33333333-3333-3333-3333-333333333306', // OnePlus Nord CE 3
    name: 'OnePlus 11 5G',
    grade: 'new',
    damageLevel: 'NONE',
    originalPrice: 61999,
    discountedPrice: 24800,
    daysListed: 4,
    deliveryPointId: '22222222-2222-2222-2222-222222222221', // Andheri Resale Hub
    city: 'Mumbai',
    category: '📱 Smartphones',
    serial: 'SN-OP11-8982',
    publicId: 'PASS-OP11-8982',
    packagingDate: -10,
    deliveryDate: -8,
    returnDate: -5,
    returnReason: 'Wrong device color shipped',
    events: [
      { type: 'delivered', offsetDays: -10, to: '11111111-1111-1111-1111-111111111111', reason: 'Received from manufacturing plant' }, // WH Mumbai
      { type: 'moved', offsetDays: -8, from: '11111111-1111-1111-1111-111111111111', to: '22222222-2222-2222-2222-222222222221', reason: 'Dispatched to local Resale Hub' },
      { type: 'delivered', offsetDays: -6, to: '22222222-2222-2222-2222-222222222221', reason: 'Delivered to Andheri Hub storage node' },
      { type: 'returned', offsetDays: -4, reason: 'Customer returns item at node' },
      { type: 'graded', offsetDays: -3, reason: 'AI scanner graded cosmetic status as New' },
      { type: 'routed', offsetDays: -1, to: '22222222-2222-2222-2222-222222222221', reason: 'Classified for Local Resale to avoid carbon footprints' }
    ]
  },
  {
    id: '44444444-4444-4444-4444-444444444402',
    productId: '33333333-3333-3333-3333-333333333305', // boAt Rockerz 450
    name: 'boAt Airdopes 141',
    grade: 'new',
    damageLevel: 'NONE',
    originalPrice: 1499,
    discountedPrice: 600,
    daysListed: 1,
    deliveryPointId: '22222222-2222-2222-2222-222222222221', // Andheri Resale Hub
    city: 'Mumbai',
    category: '🎧 Audio',
    serial: 'SN-BOAT-0294',
    publicId: 'PASS-BOAT-0294',
    packagingDate: -4,
    deliveryDate: -3,
    returnDate: -2,
    returnReason: 'Changed mind, packaging unopened',
    events: [
      { type: 'delivered', offsetDays: -4, to: '11111111-1111-1111-1111-111111111111', reason: 'Stocked at Mumbai warehouse' },
      { type: 'returned', offsetDays: -2, reason: 'Customer dropped package at returns desk' },
      { type: 'graded', offsetDays: -1.5, reason: 'AI scanner inspection completed' },
      { type: 'routed', offsetDays: -1, to: '22222222-2222-2222-2222-222222222221', reason: 'Routed for local quick sale listing' }
    ]
  },
  {
    id: '44444444-4444-4444-4444-444444444403',
    productId: '33333333-3333-3333-3333-333333333302', // Apple adapter
    name: 'Kindle Paperwhite (10th Gen)',
    grade: 'new',
    damageLevel: 'NONE',
    originalPrice: 13999,
    discountedPrice: 5600,
    daysListed: 1,
    deliveryPointId: '22222222-2222-2222-2222-222222222222', // Powai Quick Sale
    city: 'Mumbai',
    category: '📖 E-Readers',
    serial: 'SN-KNDL-9081',
    publicId: 'PASS-KNDL-9081',
    packagingDate: -5,
    deliveryDate: -4,
    returnDate: -2,
    returnReason: 'Gift recipient already had one',
    events: [
      { type: 'delivered', offsetDays: -5, to: '11111111-1111-1111-1111-111111111111', reason: 'Packed in Mumbai central node' },
      { type: 'returned', offsetDays: -2, reason: 'Returned in box' },
      { type: 'graded', offsetDays: -1.2, reason: 'Cosmetics verify as pristine open-box' },
      { type: 'routed', offsetDays: -1, to: '22222222-2222-2222-2222-222222222222', reason: 'Forwarded to Powai hub' }
    ]
  },
  {
    id: '44444444-4444-4444-4444-444444444404',
    productId: '33333333-3333-3333-3333-333333333306', // OnePlus Nord CE 3
    name: 'Noise ColorFit Pro 4',
    grade: 'damaged',
    damageLevel: 'MAJOR',
    originalPrice: 4999,
    discountedPrice: 1250,
    daysListed: 5,
    deliveryPointId: '22222222-2222-2222-2222-222222222225', // Connaught Place
    city: 'Delhi',
    category: '⌚ Wearables',
    serial: 'SN-NOIS-3401',
    publicId: 'PASS-NOIS-3401',
    packagingDate: -12,
    deliveryDate: -10,
    returnDate: -7,
    returnReason: 'Damaged screen during transport',
    events: [
      { type: 'delivered', offsetDays: -12, to: '11111111-1111-1111-1111-111111111112', reason: 'Logged at Delhi Warehouse' },
      { type: 'returned', offsetDays: -7, reason: 'Returned by customer (scratched face)' },
      { type: 'graded', offsetDays: -6, reason: 'AI detection: Major display scratches' },
      { type: 'routed', offsetDays: -5, to: '22222222-2222-2222-2222-222222222225', reason: 'Routed to outlet for component grade sales' }
    ]
  },
  {
    id: '44444444-4444-4444-4444-444444444405',
    productId: '33333333-3333-3333-3333-333333333305', // boAt
    name: 'Apple AirPods (3rd Gen)',
    grade: 'new',
    damageLevel: 'NONE',
    originalPrice: 19900,
    discountedPrice: 7960,
    daysListed: 2,
    deliveryPointId: '22222222-2222-2222-2222-222222222226', // Lajpat Nagar
    city: 'Delhi',
    category: '🎧 Audio',
    serial: 'SN-APOD-7811',
    publicId: 'PASS-APOD-7811',
    packagingDate: -6,
    deliveryDate: -5,
    returnDate: -3,
    returnReason: 'No longer needed',
    events: [
      { type: 'delivered', offsetDays: -6, to: '11111111-1111-1111-1111-111111111112', reason: 'Received in stock' },
      { type: 'returned', offsetDays: -3, reason: 'Returned to Lajpat node' },
      { type: 'graded', offsetDays: -2.5, reason: 'Grading status: New' },
      { type: 'routed', offsetDays: -2, to: '22222222-2222-2222-2222-222222222226', reason: 'Listed for local resale to save shipping emissions' }
    ]
  }
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Creating database schema if not exists...');
    await client.query(DDL);
    console.log('Schema created successfully.');

    // Truncate tables to allow clean re-seeding
    console.log('Truncating tables for fresh re-seed...');
    await client.query('TRUNCATE TABLE routing_decisions, grading_results, product_events, product_instances CASCADE;');

    // Seed Locations
    console.log('Seeding locations...');
    for (const loc of [...WAREHOUSES, ...DELIVERY_POINTS]) {
      await client.query(`
        INSERT INTO locations (id, name, type, address, latitude, longitude)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING
      `, [loc.id, loc.name, loc.type, loc.address, loc.lat, loc.lng]);
    }

    // Seed Products
    console.log('Seeding products...');
    for (const prod of MOCK_PRODUCTS) {
      await client.query(`
        INSERT INTO products (id, sku, name, manufacturer, category)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING
      `, [prod.id, prod.sku, prod.name, prod.manufacturer, prod.category]);
    }

    console.log('Seeding initial inventory items and history timelines...');
    for (const item of INITIAL_INVENTORY) {
      const pDate = new Date(Date.now() + item.packagingDate * 24 * 60 * 60 * 1000);
      const dDate = new Date(Date.now() + item.deliveryDate * 24 * 60 * 60 * 1000);
      const rDate = new Date(Date.now() + item.returnDate * 24 * 60 * 60 * 1000);
      
      // 1. Create product instance
      await client.query(`
        INSERT INTO product_instances (id, product_id, serial_number, public_id, packaging_date, delivery_date, current_status, current_location_id, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        item.id,
        item.productId,
        item.serial,
        item.publicId,
        pDate,
        dDate,
        'routed',
        item.deliveryPointId,
        pDate
      ]);

      // 2. Create grading results
      await client.query(`
        INSERT INTO grading_results (product_instance_id, grade, confidence, description, created_at)
        VALUES ($1, $2, $3, $4, $5)
      `, [item.id, item.grade, 0.95, item.damageLevel, rDate]);

      // 3. Create routing decision
      await client.query(`
        INSERT INTO routing_decisions (product_instance_id, decision, estimated_resale_value, decided_at)
        VALUES ($1, $2, $3, $4)
      `, [item.id, 'local_delivery_point', item.discountedPrice, rDate]);

      // 4. Create historical events
      for (const ev of item.events) {
        const evTime = new Date(Date.now() + ev.offsetDays * 24 * 60 * 60 * 1000);
        await client.query(`
          INSERT INTO product_events (product_instance_id, event_type, event_time, from_location_id, to_location_id, reason)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          item.id,
          ev.type,
          evTime,
          ev.from || null,
          ev.to || null,
          ev.reason || item.returnReason
        ]);
      }
    }
    console.log('Seeding initial inventory items and history timelines completed.');
    console.log('Database initialization completed successfully!');
  } catch (err) {
    console.error('Error during database initialization:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
