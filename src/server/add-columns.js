// Script to add missing columns to employees table
// Run this: node add-columns.js

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { Pool } = require('pg');

// Get password and decode if needed
let dbPassword = process.env.DB_PASS || process.env.DB_PASSWORD || '';
if (dbPassword) {
  dbPassword = String(dbPassword).trim();
  try {
    dbPassword = decodeURIComponent(dbPassword);
  } catch (e) {
    // Not URL encoded
  }
}

const pool = new Pool({
  user: process.env.DB_USER || 'bhushan',
  password: dbPassword,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'arithwise_hrms'
});

async function addColumns() {
  const client = await pool.connect();
  try {
    // Set search_path
    await client.query('SET search_path TO hrms_data, public');
    
    console.log('Adding missing columns to employees table...');
    console.log('');
    
    // Add columns one by one with error handling
    const columns = [
      { name: 'middle_name', type: 'VARCHAR(100)' },
      { name: 'employment_status', type: 'VARCHAR(50)' },
      { name: 'sub_unit', type: 'VARCHAR(100)' },
      { name: 'supervisor_name', type: 'VARCHAR(255)' }
    ];
    
    for (const col of columns) {
      try {
        // Check if column exists first
        const checkResult = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = 'hrms_data' 
          AND table_name = 'employees' 
          AND column_name = $1
        `, [col.name]);
        
        if (checkResult.rows.length > 0) {
          console.log(`  ✅ ${col.name} already exists`);
        } else {
          await client.query(`
            ALTER TABLE hrms_data.employees 
            ADD COLUMN ${col.name} ${col.type}
          `);
          console.log(`  ✅ Added ${col.name} column`);
        }
      } catch (error) {
        if (error.code === '42501') {
          console.log(`  ❌ Permission denied for ${col.name} - need to run as postgres user`);
        } else {
          console.log(`  ⚠️  Error adding ${col.name}: ${error.message}`);
        }
      }
    }
    
    console.log('');
    console.log('Verifying columns...');
    
    // List all columns
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'hrms_data' 
      AND table_name = 'employees'
      ORDER BY ordinal_position
    `);
    
    console.log('');
    console.log('Current employees table columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code === '42501') {
      console.error('');
      console.error('❌ Permission denied!');
      console.error('   You need to run this as postgres user, or grant ALTER privileges to bhushan');
      console.error('');
      console.error('   Run this SQL as postgres user:');
      console.error('   ALTER TABLE hrms_data.employees ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100);');
      console.error('   ALTER TABLE hrms_data.employees ADD COLUMN IF NOT EXISTS employment_status VARCHAR(50);');
      console.error('   ALTER TABLE hrms_data.employees ADD COLUMN IF NOT EXISTS sub_unit VARCHAR(100);');
      console.error('   ALTER TABLE hrms_data.employees ADD COLUMN IF NOT EXISTS supervisor_name VARCHAR(255);');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

addColumns();

