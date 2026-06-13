import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mapping of frontend IDs to seeded database UUIDs
const LOCATION_MAP = {
  'wh-1': '11111111-1111-1111-1111-111111111111',
  'wh-2': '11111111-1111-1111-1111-111111111112',
  'wh-3': '11111111-1111-1111-1111-111111111113',
  'wh-4': '11111111-1111-1111-1111-111111111114',
  'wh-5': '11111111-1111-1111-1111-111111111115',
  'wh-6': '11111111-1111-1111-1111-111111111116',
  
  'dp-1': '22222222-2222-2222-2222-222222222221',
  'dp-2': '22222222-2222-2222-2222-222222222222',
  'dp-3': '22222222-2222-2222-2222-222222222223',
  'dp-4': '22222222-2222-2222-2222-222222222224',
  'dp-5': '22222222-2222-2222-2222-222222222225',
  'dp-6': '22222222-2222-2222-2222-222222222226',
};

// Mapped product catalog (with IDs and original prices)
const PRODUCT_CATALOG = {
  'Samsung Galaxy S22': { id: '33333333-3333-3333-3333-333333333301', originalPrice: 58000 },
  'Apple 20W USB-C Adapter': { id: '33333333-3333-3333-3333-333333333302', originalPrice: 1900 },
  'Nike Revolution 6 Shoes': { id: '33333333-3333-3333-3333-333333333303', originalPrice: 3695 },
  'Amazon Basics HDMI Cable': { id: '33333333-3333-3333-3333-333333333304', originalPrice: 399 },
  'boAt Rockerz 450': { id: '33333333-3333-3333-3333-333333333305', originalPrice: 1499 },
  'OnePlus Nord CE 3': { id: '33333333-3333-3333-3333-333333333306', originalPrice: 24000 },
  'Realme Smart TV 43"': { id: '33333333-3333-3333-3333-333333333307', originalPrice: 32000 },
  'Puma Core Backpack': { id: '33333333-3333-3333-3333-333333333308', originalPrice: 1299 },
  'Dyson V12 Vacuum': { id: '33333333-3333-3333-3333-333333333309', originalPrice: 58900 },
  'JBL Flip 6 Speaker': { id: '33333333-3333-3333-3333-333333333310', originalPrice: 11999 },
  
  // Seeded / mock items
  'OnePlus 11 5G': { id: null, originalPrice: 61999 },
  'boAt Airdopes 141': { id: null, originalPrice: 1499 },
  'Kindle Paperwhite (10th Gen)': { id: null, originalPrice: 13999 },
  'Noise ColorFit Pro 4': { id: null, originalPrice: 4999 },
  'Apple AirPods (3rd Gen)': { id: null, originalPrice: 19900 }
};

const SMART_ROUTING_CONFIG = {
  PRICE_PER_KM_PER_KG: 10,
  LOCAL_RESALE_WINDOW_DAYS: 3,
  CURRENCY_SYMBOL: '₹',
  DAMAGE_LEVELS: {
    IRREPAIRABLE: 'IRREPAIRABLE',
    MAJOR: 'MAJOR',
    MINOR: 'MINOR',
    NONE: 'NONE',
  },
  warehouses: [
    { id: 'wh-1', name: 'Mumbai Warehouse',    lat: 19.076,  lng: 72.8777, city: 'Mumbai'    },
    { id: 'wh-2', name: 'Delhi Warehouse',     lat: 28.6139, lng: 77.209,  city: 'Delhi'     },
    { id: 'wh-3', name: 'Bengaluru Warehouse', lat: 12.9716, lng: 77.5946, city: 'Bengaluru' },
    { id: 'wh-4', name: 'Hyderabad Warehouse', lat: 17.385,  lng: 78.4867, city: 'Hyderabad' },
    { id: 'wh-5', name: 'Chennai Warehouse',   lat: 13.0827, lng: 80.2707, city: 'Chennai'   },
    { id: 'wh-6', name: 'Kolkata Warehouse',   lat: 22.5726, lng: 88.3639, city: 'Kolkata'   },
  ],
  deliveryPoints: [
    { id: 'dp-1', name: 'Andheri Resale Hub',       lat: 19.1136, lng: 72.8697, city: 'Mumbai',    capacityUnits: 20, currentLoad: 8,  acceptedGrades: ['NEW','DAMAGED'], isActive: true  },
    { id: 'dp-2', name: 'Powai Quick Sale',          lat: 19.1197, lng: 72.906,  city: 'Mumbai',    capacityUnits: 15, currentLoad: 14, acceptedGrades: ['NEW','DAMAGED'], isActive: true  },
    { id: 'dp-3', name: 'Koramangala Resale Point',  lat: 12.9352, lng: 77.6245, city: 'Bengaluru', capacityUnits: 25, currentLoad: 5,  acceptedGrades: ['NEW'],           isActive: true  },
    { id: 'dp-4', name: 'Indiranagar Outlet',        lat: 12.9784, lng: 77.6408, city: 'Bengaluru', capacityUnits: 10, currentLoad: 10, acceptedGrades: ['NEW'],                  isActive: false },
    { id: 'dp-5', name: 'Connaught Place Hub',       lat: 28.6315, lng: 77.2167, city: 'Delhi',     capacityUnits: 30, currentLoad: 12, acceptedGrades: ['NEW','DAMAGED'], isActive: true  },
    { id: 'dp-6', name: 'Lajpat Nagar Resale',       lat: 28.5686, lng: 77.2434, city: 'Delhi',     capacityUnits: 18, currentLoad: 3,  acceptedGrades: ['NEW'],           isActive: true  },
  ],
  recycleDonationBoxes: [
    { id: 'rb-1', name: 'GreenCycle Mumbai',    type: 'RECYCLE',  city: 'Mumbai',    address: 'Dharavi Recycling Center, Mumbai'    },
    { id: 'rb-2', name: 'Care Donation Mumbai', type: 'DONATION', city: 'Mumbai',    address: 'NGO Hub, Kurla, Mumbai'              },
    { id: 'rb-3', name: 'EcoSort Bengaluru',    type: 'RECYCLE',  city: 'Bengaluru', address: 'HSR Layout Recycling Depot, Bengaluru'},
    { id: 'rb-4', name: 'Helping Hands Delhi',  type: 'DONATION', city: 'Delhi',     address: 'Okhla Social Center, Delhi'          },
    { id: 'rb-5', name: 'RecycleRight Delhi',   type: 'RECYCLE',  city: 'Delhi',     address: 'Noida Recycling Hub, Delhi NCR'      },
  ],
  sampleProducts: [
    { id: 'prod-001', name: 'Samsung Galaxy S22',          grade: 'NEW',    weight: 0.5,  originalPrice: 58000, category: '📱 Smartphones'  },
    { id: 'prod-002', name: 'Apple 20W USB-C Adapter',     grade: 'NEW',     weight: 0.1,  originalPrice: 1900,  category: '🔌 Accessories'     },
    { id: 'prod-003', name: 'Nike Revolution 6 Shoes',      grade: 'DAMAGED', weight: 0.8,  originalPrice: 3695,  category: '👟 Footwear',      damageLevel: 'MINOR'        },
    { id: 'prod-004', name: 'Amazon Basics HDMI Cable',     grade: 'NEW',    weight: 0.15, originalPrice: 399,   category: '🔌 Accessories'     },
    { id: 'prod-005', name: 'boAt Rockerz 450',             grade: 'NEW',     weight: 0.25, originalPrice: 1499,  category: '🎧 Audio'         },
    { id: 'prod-006', name: 'OnePlus Nord CE 3',            grade: 'DAMAGED', weight: 0.18, originalPrice: 24000, category: '📱 Smartphones',   damageLevel: 'MAJOR'        },
    { id: 'prod-007', name: 'Realme Smart TV 43"',          grade: 'DAMAGED', weight: 8.5,  originalPrice: 32000, category: '📺 TVs',           damageLevel: 'IRREPAIRABLE' },
    { id: 'prod-008', name: 'Puma Core Backpack',           grade: 'NEW',    weight: 0.4,  originalPrice: 1299,  category: '🎒 Bags'            },
    { id: 'prod-009', name: 'Dyson V12 Vacuum',             grade: 'NEW',    weight: 2.3,  originalPrice: 58900, category: '🏠 Appliances'    },
    { id: 'prod-010', name: 'JBL Flip 6 Speaker',           grade: 'NEW',     weight: 0.55, originalPrice: 11999, category: '🔊 Speakers'      },
  ]
};

// Get configuration data
app.get('/api/config', (req, res) => {
  res.json(SMART_ROUTING_CONFIG);
});

// Get all inventory items
app.get('/api/inventory', async (req, res) => {
  try {
    const queryStr = `
      SELECT 
        pi.id,
        p.name,
        p.category,
        gr.grade,
        gr.description AS "damageLevel",
        rd.decision,
        rd.estimated_resale_value AS "discountedPrice",
        pi.created_at AS "listedAt",
        pi.current_location_id AS "deliveryPointId",
        l.name AS "deliveryPointName",
        l.address
      FROM product_instances pi
      JOIN products p ON pi.product_id = p.id
      LEFT JOIN grading_results gr ON gr.product_instance_id = pi.id
      LEFT JOIN routing_decisions rd ON rd.product_instance_id = pi.id
      LEFT JOIN locations l ON pi.current_location_id = l.id
      ORDER BY pi.created_at DESC
    `;
    const { rows } = await pool.query(queryStr);

    const items = rows.map(row => {
      // Map database routing decision back to frontend type
      let type = 'RESALE';
      if (row.decision === 'warehouse') {
        type = 'WAREHOUSE';
      } else if (row.decision === 'direct_recycle') {
        type = 'RECYCLE';
      }

      // Parse city from address (usually the last comma-separated value)
      let cityVal = '';
      if (row.address) {
        const parts = row.address.split(',');
        cityVal = parts[parts.length - 1].trim();
      }

      const originalPrice = PRODUCT_CATALOG[row.name]?.originalPrice || 0;

      return {
        id: row.id,
        name: row.name,
        grade: (row.grade || 'new').toUpperCase(),
        damageLevel: row.damageLevel || 'NONE',
        category: row.category || '',
        originalPrice: originalPrice,
        discountedPrice: row.discountedPrice ? parseFloat(row.discountedPrice) : 0,
        deliveryPointId: row.deliveryPointId,
        deliveryPointName: row.deliveryPointName || 'Unknown Hub',
        city: cityVal,
        listedAt: row.listedAt,
        type: type
      };
    });

    res.json(items);
  } catch (err) {
    console.error('Failed to query inventory:', err);
    res.status(500).json({ error: 'Failed to retrieve inventory from database.' });
  }
});

// Add a new routed item to inventory
app.post('/api/inventory', async (req, res) => {
  const client = await pool.connect();
  try {
    const newItem = req.body;
    if (!newItem.name || !newItem.grade) {
      return res.status(400).json({ error: 'Product name and grade are required.' });
    }

    await client.query('BEGIN');

    // 1. Find or insert product
    let productId = PRODUCT_CATALOG[newItem.name]?.id;
    if (!productId) {
      const prodRes = await client.query('SELECT id FROM products WHERE name = $1 LIMIT 1', [newItem.name]);
      if (prodRes.rows.length > 0) {
        productId = prodRes.rows[0].id;
      } else {
        const sku = `SKU-${Date.now()}`;
        const insProdRes = await client.query(`
          INSERT INTO products (sku, name, category)
          VALUES ($1, $2, $3)
          RETURNING id
        `, [sku, newItem.name, newItem.category || '📦 Others']);
        productId = insProdRes.rows[0].id;
      }
    }

    // 2. Find or insert location
    let locationId = LOCATION_MAP[newItem.deliveryPointId];
    if (!locationId && newItem.deliveryPointId) {
      const locRes = await client.query('SELECT id FROM locations WHERE id = $1 OR name = $2 LIMIT 1', [
        newItem.deliveryPointId,
        newItem.deliveryPointName
      ]);
      if (locRes.rows.length > 0) {
        locationId = locRes.rows[0].id;
      } else {
        const insLocRes = await client.query(`
          INSERT INTO locations (name, type, address, latitude, longitude)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
        `, [
          newItem.deliveryPointName || 'Dynamic Hub',
          newItem.type === 'WAREHOUSE' ? 'warehouse' : 'delivery_point',
          newItem.city || 'India',
          newItem.latitude || null,
          newItem.longitude || null
        ]);
        locationId = insLocRes.rows[0].id;
      }
    }

    // 3. Create product instance
    const status = newItem.type === 'WAREHOUSE' ? 'returned' : 
                   (newItem.type === 'RECYCLE' ? 'routed' : 'routed');
    const createdDate = new Date();
    const instRes = await client.query(`
      INSERT INTO product_instances (product_id, current_status, current_location_id, created_at)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [productId, status, locationId, createdDate]);
    const instanceId = instRes.rows[0].id;

    // 4. Create grading result
    const dbGrade = newItem.grade.toLowerCase();
    await client.query(`
      INSERT INTO grading_results (product_instance_id, grade, confidence, description, created_at)
      VALUES ($1, $2, $3, $4, $5)
    `, [instanceId, dbGrade, 0.95, newItem.damageLevel || 'NONE', createdDate]);

    // 5. Create routing decision
    let decisionVal = 'local_delivery_point';
    if (newItem.type === 'WAREHOUSE') {
      decisionVal = 'warehouse';
    } else if (newItem.type === 'RECYCLE') {
      decisionVal = 'direct_recycle';
    }

    await client.query(`
      INSERT INTO routing_decisions (product_instance_id, decision, estimated_resale_value, decided_at)
      VALUES ($1, $2, $3, $4)
    `, [instanceId, decisionVal, newItem.discountedPrice || 0, createdDate]);

    // 6. Create event log
    await client.query(`
      INSERT INTO product_events (product_instance_id, event_type, event_time, to_location_id, reason)
      VALUES ($1, $2, $3, $4, $5)
    `, [instanceId, 'routed', createdDate, locationId, 'Smart routing confirmed']);

    await client.query('COMMIT');

    // Return the inserted item formatted for the frontend
    const entry = {
      id: instanceId,
      name: newItem.name,
      grade: newItem.grade,
      damageLevel: newItem.damageLevel || 'NONE',
      category: newItem.category || '',
      discountedPrice: newItem.discountedPrice || 0,
      deliveryPointId: newItem.deliveryPointId,
      deliveryPointName: newItem.deliveryPointName || 'Unknown Hub',
      city: newItem.city || '',
      listedAt: createdDate.toISOString(),
      type: newItem.type || 'RESALE'
    };

    res.status(201).json(entry);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding inventory item:', err);
    res.status(500).json({ error: 'Failed to save inventory item to database.' });
  } finally {
    client.release();
  }
});

// Root endpoint welcome message
app.get('/', (req, res) => {
  res.send('Amazon HackOn 2026 Smart Routing API Server is running successfully!');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'postgresql', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
