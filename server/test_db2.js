const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function test() {
  try {
    const email = 'test@example.com';
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    console.log('Query success! Existing users:', existing.rows);
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    pool.end();
  }
}
test();
