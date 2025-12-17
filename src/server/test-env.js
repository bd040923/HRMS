// Quick test to verify .env file is being read correctly
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

console.log('Environment Variables Test:');
console.log('==========================');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASS exists:', !!process.env.DB_PASS);
console.log('DB_PASS length:', process.env.DB_PASS ? process.env.DB_PASS.length : 0);
console.log('DB_PASS type:', typeof process.env.DB_PASS);
if (process.env.DB_PASS) {
  console.log('DB_PASS first char:', process.env.DB_PASS[0]);
  console.log('DB_PASS last char:', process.env.DB_PASS[process.env.DB_PASS.length - 1]);
  console.log('DB_PASS value (first 2, last 2):', 
    process.env.DB_PASS.substring(0, 2) + '...' + 
    process.env.DB_PASS.substring(process.env.DB_PASS.length - 2));
}

// Test Pool creation
const { Pool } = require('pg');
const password = String(process.env.DB_PASS || '').trim();

console.log('\nTesting Pool creation:');
console.log('Password for pool:', password ? `*** (${password.length} chars)` : 'EMPTY');
console.log('Password type:', typeof password);

const testConfig = {
  user: process.env.DB_USER || 'bhushan',
  password: password,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'arithwise_hrms'
};

console.log('\nPool config:');
console.log('  user:', testConfig.user);
console.log('  password:', testConfig.password ? `*** (${testConfig.password.length} chars, type: ${typeof testConfig.password})` : 'EMPTY');
console.log('  host:', testConfig.host);
console.log('  port:', testConfig.port);
console.log('  database:', testConfig.database);

// Try to create pool (won't connect, just test config)
try {
  const pool = new Pool(testConfig);
  console.log('\n✅ Pool created successfully!');
  console.log('   Password was accepted by Pool constructor');
  pool.end();
} catch (error) {
  console.log('\n❌ Error creating pool:');
  console.log('   ', error.message);
}

