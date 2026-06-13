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
