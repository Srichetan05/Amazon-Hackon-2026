import pool from '../db.js';

async function verify() {
  try {
    const res = await pool.query(`
      SELECT pi.id, p.name, gr.grade, rd.decision, rd.estimated_resale_value AS "resale_value"
      FROM product_instances pi
      JOIN products p ON pi.product_id = p.id
      LEFT JOIN grading_results gr ON gr.product_instance_id = pi.id
      LEFT JOIN routing_decisions rd ON rd.product_instance_id = pi.id
      LIMIT 5
    `);
    console.log('--- Current Inventory in PostgreSQL ---');
    console.table(res.rows);
  } catch (err) {
    console.error('Error querying database:', err);
  } finally {
    await pool.end();
  }
}

verify();
