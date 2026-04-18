import pool from './backend/db.js';
import { initDatabase } from './backend/initDb.js';

async function test() {
  try {
    console.log("Starting DB test...");
    await initDatabase();
    const [rows]: any = await pool.execute('SHOW TABLES');
    console.log("Tables in DB:", rows);
    
    // Check users table structure
    const [columns]: any = await pool.execute('DESCRIBE users');
    console.log("Users table columns:", columns);
    
    process.exit(0);
  } catch (err) {
    console.error("DB Test failed:", err);
    process.exit(1);
  }
}

test();
