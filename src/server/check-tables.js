// Script to check if tables exist in the database
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'bhushan',
  password: (process.env.DB_PASS || process.env.DB_PASSWORD || '').replace(/%40/g, '@'),
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'arithwise_hrms'
});

async function checkTables() {
  const client = await pool.connect();
  try {
    // Set search_path
    await client.query('SET search_path TO hrms_data, public');
    
    // Check if schema exists
    const schemaCheck = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'hrms_data'
    `);
    
    console.log('Schema check:');
    console.log('  hrms_data exists:', schemaCheck.rows.length > 0);
    console.log('');
    
    // Check tables
    const tables = ['job_titles', 'vacancies', 'candidates', 'employees', 'candidate_vacancies'];
    
    console.log('Table check:');
    for (const table of tables) {
      try {
        const result = await client.query(`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_schema = 'hrms_data' 
          AND table_name = $1
        `, [table]);
        
        const exists = parseInt(result.rows[0].count) > 0;
        console.log(`  ${table}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
        
        if (exists) {
          // Get row count
          const countResult = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
          console.log(`    Rows: ${countResult.rows[0].count}`);
        }
      } catch (err) {
        console.log(`  ${table}: ❌ ERROR - ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkTables();

