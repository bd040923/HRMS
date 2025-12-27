// Debug script to check .env file parsing
const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '.env');

console.log('Checking .env file at:', envPath);
console.log('File exists:', fs.existsSync(envPath));
console.log('');

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  console.log('Raw file content:');
  console.log('-----------------');
  console.log(content);
  console.log('-----------------');
  console.log('');
  
  const lines = content.split('\n');
  console.log('Parsed lines:');
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    console.log(`Line ${i + 1}: "${trimmed}"`);
    if (trimmed.startsWith('DB_PASS')) {
      const parts = trimmed.split('=');
      console.log(`  -> Key: "${parts[0]}"`);
      console.log(`  -> Value: "${parts.slice(1).join('=')}"`);
      console.log(`  -> Value length: ${parts.slice(1).join('=').length}`);
    }
  });
  
  console.log('');
  console.log('Testing dotenv:');
  require('dotenv').config({ path: envPath });
  console.log('process.env.DB_PASS:', process.env.DB_PASS);
  console.log('process.env.DB_PASS type:', typeof process.env.DB_PASS);
  console.log('process.env.DB_PASS length:', process.env.DB_PASS ? process.env.DB_PASS.length : 0);
}



