import pool from '../db.js';

async function verify() {
  try {
    // Get all product instances
    const res = await pool.query(`SELECT id FROM product_instances ORDER BY created_at ASC`);
    const items = res.rows;

    console.log(`Found ${items.length} items in the database.`);

    // Make exactly 2 items 4 days old (Recycle), the rest 1 day old (Resale)
    for (let i = 0; i < items.length; i++) {
      const daysOld = i < 2 ? 4 : 1;
      const newDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
      
      await pool.query(`UPDATE product_instances SET created_at = $1 WHERE id = $2`, [newDate, items[i].id]);
    }

    console.log('Successfully updated the dates!');

    // Verify
    const updated = await pool.query(`
      SELECT pi.id, p.name, pi.created_at, EXTRACT(DAY FROM NOW() - pi.created_at) as days_listed
      FROM product_instances pi
      JOIN products p ON pi.product_id = p.id
    `);
    console.table(updated.rows.map(row => ({
      name: row.name,
      days_listed: Math.floor((Date.now() - new Date(row.created_at).getTime()) / (1000 * 60 * 60 * 24)),
      status: Math.floor((Date.now() - new Date(row.created_at).getTime()) / (1000 * 60 * 60 * 24)) > 3 ? 'Recycle/Donate' : 'Resale'
    })));

  } catch (err) {
    console.error('Error querying database:', err);
  } finally {
    await pool.end();
  }
}

verify();
