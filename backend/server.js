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
      } else if (row.decision === 'donate') {
        type = 'DONATED';
      } else if (row.decision === 'recycle') {
        type = 'RECYCLED';
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
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(newItem.deliveryPointId);
      let locRes;
      if (isUuid) {
        locRes = await client.query('SELECT id FROM locations WHERE id = $1 OR name = $2 LIMIT 1', [
          newItem.deliveryPointId,
          newItem.deliveryPointName
        ]);
      } else {
        locRes = await client.query('SELECT id FROM locations WHERE name = $1 LIMIT 1', [
          newItem.deliveryPointName
        ]);
      }
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

        // 6. Create complete historical event timeline logs for the demo flow
    const pkgOffset = new Date(createdDate.getTime() - 6 * 24 * 60 * 60 * 1000);
    const delOffset = new Date(createdDate.getTime() - 4 * 24 * 60 * 60 * 1000);
    const retOffset = new Date(createdDate.getTime() - 2 * 24 * 60 * 60 * 1000);
    const grdOffset = new Date(createdDate.getTime() - 1 * 24 * 60 * 60 * 1000);

    // 6.1 packed event
    await client.query(`
      INSERT INTO product_events (product_instance_id, event_type, event_time, reason)
      VALUES ($1, $2, $3, $4)
    `, [instanceId, 'packed', pkgOffset, 'Item packed and sealed at central warehouse node']);

    // 6.2 delivered event
    await client.query(`
      INSERT INTO product_events (product_instance_id, event_type, event_time, reason)
      VALUES ($1, $2, $3, $4)
    `, [instanceId, 'delivered', delOffset, 'Delivered to customer doorstep']);

    // 6.3 returned event
    await client.query(`
      INSERT INTO product_events (product_instance_id, event_type, event_time, reason)
      VALUES ($1, $2, $3, $4)
    `, [instanceId, 'returned', retOffset, newItem.returnReason || `Customer returns: Defect or cosmetic issue (${newItem.damageLevel || 'NONE'})`]);

    // 6.4 graded event
    await client.query(`
      INSERT INTO product_events (product_instance_id, event_type, event_time, reason)
      VALUES ($1, $2, $3, $4)
    `, [instanceId, 'graded', grdOffset, `AI inspector graded cosmetic status as ${newItem.grade}`]);

    // 6.5 routed event
    await client.query(`
      INSERT INTO product_events (product_instance_id, event_type, event_time, to_location_id, reason)
      VALUES ($1, $2, $3, $4, $5)
    `, [instanceId, 'routed', createdDate, locationId, `Routed for optimized recovery decision: ${decisionVal.replace('_', ' ').toUpperCase()}`]);

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

// Update the routing decision for a product instance (Donate vs Recycle)
app.put('/api/inventory/:id/decision', async (req, res) => {
  const { id } = req.params;
  const { decision } = req.body; // e.g. 'DONATE' or 'RECYCLE'
  
  if (!['DONATE', 'RECYCLE'].includes(decision)) {
    return res.status(400).json({ error: 'Invalid decision' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Update the routing decision
    await client.query(`
      UPDATE routing_decisions
      SET decision = $1, decided_at = CURRENT_TIMESTAMP
      WHERE product_instance_id = $2
    `, [decision.toLowerCase(), id]);
    
    // Also record this as an event
    await client.query(`
      INSERT INTO product_events (product_instance_id, event_type, reason)
      VALUES ($1, $2, $3)
    `, [id, 'routed', `Manually assigned to ${decision} facility by operator`]);

    // Update current status
    await client.query(`
      UPDATE product_instances
      SET current_status = $1
      WHERE id = $2
    `, [decision.toLowerCase(), id]);

    await client.query('COMMIT');
    res.json({ success: true, message: `Successfully assigned to ${decision}` });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to update decision:', err);
    res.status(500).json({ error: 'Failed to update decision' });
  } finally {
    client.release();
  }
});

// Get all product instances for the selector
app.get('/api/lifecycle', async (req, res) => {
  try {
    const queryStr = `
      SELECT 
        pi.id,
        p.name,
        gr.grade,
        pi.current_status AS status
      FROM product_instances pi
      JOIN products p ON pi.product_id = p.id
      LEFT JOIN grading_results gr ON gr.product_instance_id = pi.id
      ORDER BY pi.created_at DESC
    `;
    const { rows } = await pool.query(queryStr);
    res.json(rows);
  } catch (err) {
    console.error('Failed to query lifecycle list:', err);
    res.status(500).json({ error: 'Failed to retrieve lifecycle list.' });
  }
});

// Get deep details for a single lifecycle passport
app.get('/api/lifecycle/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const instanceQuery = `
      SELECT 
        pi.id,
        pi.serial_number AS "serialNumber",
        pi.public_id AS "publicId",
        pi.packaging_date AS "packagingDate",
        pi.delivery_date AS "deliveryDate",
        pi.current_status AS "currentStatus",
        pi.created_at AS "createdAt",
        p.name,
        p.sku,
        p.manufacturer,
        p.category,
        gr.grade,
        gr.confidence,
        gr.description AS "damageLevel",
        rd.decision,
        rd.local_cost AS "localCost",
        rd.warehouse_cost AS "warehouseCost",
        rd.estimated_resale_value AS "discountedPrice",
        rd.savings,
        l.name AS "currentLocationName",
        l.address AS "currentLocationAddress"
      FROM product_instances pi
      JOIN products p ON pi.product_id = p.id
      LEFT JOIN grading_results gr ON gr.product_instance_id = pi.id
      LEFT JOIN routing_decisions rd ON rd.product_instance_id = pi.id
      LEFT JOIN locations l ON pi.current_location_id = l.id
      WHERE pi.id = $1
    `;
    const instanceRes = await pool.query(instanceQuery, [id]);
    if (instanceRes.rows.length === 0) {
      return res.status(404).json({ error: 'Product instance not found.' });
    }

    const eventsQuery = `
      SELECT 
        pe.id,
        pe.event_type AS "type",
        pe.event_time AS "time",
        pe.reason,
        pe.metadata,
        lf.name AS "fromLocationName",
        lf.address AS "fromLocationAddress",
        lt.name AS "toLocationName",
        lt.address AS "toLocationAddress"
      FROM product_events pe
      LEFT JOIN locations lf ON pe.from_location_id = lf.id
      LEFT JOIN locations lt ON pe.to_location_id = lt.id
      WHERE pe.product_instance_id = $1
      ORDER BY pe.event_time ASC
    `;
    const eventsRes = await pool.query(eventsQuery, [id]);

    const item = instanceRes.rows[0];
    const originalPrice = PRODUCT_CATALOG[item.name]?.originalPrice || 0;

    res.json({
      ...item,
      originalPrice,
      events: eventsRes.rows
    });
  } catch (err) {
    console.error('Failed to query lifecycle details:', err);
    res.status(500).json({ error: 'Failed to retrieve product passport.' });
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
