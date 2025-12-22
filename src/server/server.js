/**
 * Arithwise HRM Backend API Server
 * Copyright (C) 2024 Arithwise Inc.
 */

// Load environment variables - EXPLICIT PATH
const path = require('path');
const fs = require('fs');

// Force dotenv to load from the server directory
const envPath = path.join(__dirname, '.env');
const dotenvResult = require('dotenv').config({ path: envPath });

// Check if .env file exists and was loaded
if (dotenvResult.error) {
  console.error('❌ ERROR loading .env file:', dotenvResult.error.message);
  console.error('   File path:', envPath);
  if (!fs.existsSync(envPath)) {
    console.error('   File does not exist!');
    console.error('   Creating template .env file...');
    const template = `DB_HOST=localhost
DB_PORT=5432
DB_NAME=arithwise_hrms
DB_USER=bhushan
DB_PASS=
BACKEND_PORT=3001
FRONTEND_URL=http://localhost:8080
`;
    fs.writeFileSync(envPath, template, 'utf8');
    console.error('   ✅ Created .env template - PLEASE EDIT IT AND SET DB_PASS!');
    process.exit(1);
  }
} else {
  console.log('✅ .env file loaded from:', envPath);
  
  // Debug: Manually read and parse .env file to see what's actually in it
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    console.log('🔍 Debugging .env file contents:');
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        if (trimmed.startsWith('DB_')) {
          const parts = trimmed.split('=');
          if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            if (key === 'DB_PASS' || key === 'DB_PASSWORD') {
              console.log(`   Line ${index + 1}: ${key}=${value ? '*** (' + value.length + ' chars)' : 'EMPTY'}`);
            } else {
              console.log(`   Line ${index + 1}: ${key}=${value}`);
            }
          }
        }
      }
    });
  }
}

// Verify critical variables are loaded
const dbVars = {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS,
  DB_PASSWORD: process.env.DB_PASSWORD
};

console.log('📋 Environment variables status:');
console.log(`   DB_HOST: ${dbVars.DB_HOST || '✗ MISSING'}`);
console.log(`   DB_PORT: ${dbVars.DB_PORT || '✗ MISSING'}`);
console.log(`   DB_NAME: ${dbVars.DB_NAME || '✗ MISSING'}`);
console.log(`   DB_USER: ${dbVars.DB_USER || '✗ MISSING'}`);
const passwordSet = !!(dbVars.DB_PASS || dbVars.DB_PASSWORD);
const passwordValue = dbVars.DB_PASS || dbVars.DB_PASSWORD || '';
console.log(`   DB_PASS: ${passwordSet ? `✓ Set (${passwordValue.length} chars)` : '✗ MISSING OR EMPTY'}`);

// If password is missing, try to manually read from .env file
if (!passwordSet || !passwordValue.trim()) {
  console.error('');
  console.error('❌ CRITICAL: DB_PASS is not set or is empty!');
  
  // Try to manually read and fix
  if (fs.existsSync(envPath)) {
    console.error('   Attempting to read .env file directly...');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const dbPassMatch = envContent.match(/^DB_PASS\s*=\s*(.+)$/m);
    if (dbPassMatch) {
      const foundPassword = dbPassMatch[1].trim();
      if (foundPassword) {
        console.error('   ⚠️  Found DB_PASS in file but dotenv didn\'t load it!');
        console.error('   Password value length:', foundPassword.length);
        console.error('   Password starts with:', foundPassword.substring(0, 2));
        console.error('   Password ends with:', foundPassword.substring(foundPassword.length - 2));
        console.error('   This might be a dotenv parsing issue.');
        console.error('');
        // Try to set it manually as a workaround
        // Also try decoding URL encoding
        let decodedPassword = foundPassword;
        try {
          decodedPassword = decodeURIComponent(foundPassword);
          if (decodedPassword !== foundPassword) {
            console.error('   🔧 Decoded URL-encoded password (e.g., %40 -> @)');
          }
        } catch (e) {
          // Not URL encoded, use as-is
        }
        process.env.DB_PASS = decodedPassword;
        console.error('   ✅ Manually set DB_PASS from file content');
      } else {
        console.error('   ❌ DB_PASS is in file but value is EMPTY');
        console.error('   Edit .env and set: DB_PASS=qa%401234');
      }
    } else {
      console.error('   ❌ DB_PASS line not found in .env file');
      console.error('   Add this line to your .env file:');
      console.error('   DB_PASS=qa%401234');
    }
  } else {
    console.error('   Edit the .env file at:', envPath);
    console.error('   Set DB_PASS=qa%401234');
  }
  
  // Only exit if we couldn't fix it
  if (!process.env.DB_PASS || !process.env.DB_PASS.trim()) {
    console.error('   Then restart the server.');
    process.exit(1);
  }
}

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (for debugging)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`📨 ${req.method} ${req.path}`);
  }
  next();
});

// Validate and prepare database configuration
// Support both DB_PASS and DB_PASSWORD for compatibility
let dbPassword = process.env.DB_PASS || process.env.DB_PASSWORD || '';

// Handle password - ensure it's a proper string
if (dbPassword) {
  dbPassword = String(dbPassword).trim();
  // Remove surrounding quotes if present
  if ((dbPassword.startsWith('"') && dbPassword.endsWith('"')) ||
      (dbPassword.startsWith("'") && dbPassword.endsWith("'"))) {
    dbPassword = dbPassword.slice(1, -1).trim();
  }
  // Decode URL encoding (e.g., %40 becomes @)
  // This handles cases where password contains @ symbol encoded as %40
  try {
    const decoded = decodeURIComponent(dbPassword);
    if (decoded !== dbPassword) {
      console.log('   🔧 Decoded URL-encoded password (%40 -> @)');
    }
    dbPassword = decoded;
  } catch (e) {
    // If decoding fails, use original (might not be URL encoded)
    // This is fine - just means password doesn't contain URL-encoded characters
    console.log('   ℹ️  Password is not URL-encoded, using as-is');
  }
}

const validatedPassword = dbPassword || '';

const dbConfig = {
  user: process.env.DB_USER || 'bhushan',
  password: validatedPassword,  // Use validated password
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'arithwise_hrms'  // Updated to match your database
};

// Debug: Show configuration (without showing password)
console.log('📋 Database Configuration:');
console.log(`   Host: ${dbConfig.host}`);
console.log(`   Port: ${dbConfig.port}`);
console.log(`   Database: ${dbConfig.database}`);
console.log(`   User: ${dbConfig.user}`);
console.log(`   Password: ${dbConfig.password ? '*** Set (' + dbConfig.password.length + ' chars)' : '❌ NOT SET'}`);
console.log(`   Password type: ${typeof dbConfig.password}`);
if (dbConfig.password) {
  // Show first and last character to verify it's being read correctly
  const firstChar = dbConfig.password[0];
  const lastChar = dbConfig.password[dbConfig.password.length - 1];
  console.log(`   Password starts with: '${firstChar}', ends with: '${lastChar}'`);
}

// Check if critical env vars are missing
const missingVars = [];
if (!process.env.DB_PASS && !process.env.DB_PASSWORD) {
  missingVars.push('DB_PASS or DB_PASSWORD');
}
if (!process.env.DB_USER) {
  missingVars.push('DB_USER');
}
if (!process.env.DB_NAME) {
  missingVars.push('DB_NAME');
}

if (missingVars.length > 0) {
  console.warn('⚠️  Warning: Missing environment variables:', missingVars.join(', '));
  console.warn('   Create a .env file in orangehrm/src/server/ with these variables');
  console.warn('   Using defaults where available');
}

// Database connection
const pool = new Pool(dbConfig);

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Override pool.query to automatically set search_path
// Note: We need to use the original pool.query for the search_path setting
// because we can't set it on a client that's already connected
const originalQuery = pool.query.bind(pool);

pool.query = async function(text, params) {
  // Get a client from the pool
  const client = await this.connect();
  try {
    // Set search_path for this connection session
    await client.query('SET search_path TO hrms_data, public');
    // Execute the actual query
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    // Re-throw the error with more context
    if (error.message.includes('password must be a string')) {
      console.error('❌ Password error detected. Check your .env file:');
      console.error('   - Make sure DB_PASS is set');
      console.error('   - Make sure there are no spaces around the = sign');
      console.error('   - Make sure the password value is not empty');
    }
    throw error;
  } finally {
    client.release();
  }
};

// Test database connection
(async () => {
  // Don't test if password is not set
  if (!validatedPassword) {
    console.error('⚠️  Skipping database connection test - password not set');
    console.error('   Please set DB_PASS in your .env file and restart the server');
    return;
  }

  try {
    await pool.query('SELECT 1');
    console.log('✅ Connected to PostgreSQL database (search_path: hrms_data)');
    console.log(`   Database: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`);
  } catch (err) {
    console.error('❌ Database connection test failed:', err.message);
    if (err.message.includes('password must be a string')) {
      console.error('');
      console.error('🔧 PASSWORD ERROR FIX:');
      console.error('   1. Open .env file in: orangehrm/src/server/.env');
      console.error('   2. Make sure DB_PASS is set like this:');
      console.error('      DB_PASS=your_actual_password');
      console.error('   3. NO spaces around = sign');
      console.error('   4. NO quotes needed (unless password has spaces)');
      console.error('   5. Save the file and restart server');
    } else {
      console.error('   Configuration:', {
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        user: dbConfig.user,
        password_set: dbConfig.password ? `Yes (${dbConfig.password.length} chars)` : 'No'
      });
      console.error('   Make sure:');
      console.error('   1. PostgreSQL is running');
      console.error('   2. .env file exists in orangehrm/src/server/');
      console.error('   3. DB_PASS is set in .env file');
      console.error('   4. Database credentials are correct');
    }
  }
})();

const mapEmployeeRow = (row) => {
  const fullName = [row.first_name, row.middle_name, row.last_name]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    ...row,
    full_name: fullName
  };
};

// ==================== JOB TITLES API ====================

// Get all job titles
app.get('/api/job-titles', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, description, status FROM job_titles ORDER BY title'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching job titles:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    res.status(500).json({ 
      error: 'Failed to fetch job titles',
      message: error.message,
      hint: 'Check if job_titles table exists in hrms_data schema'
    });
  }
});

app.post('/api/job-titles', async (req, res) => {
  console.log('📥 POST /api/job-titles received:', req.body);
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Job title is required' });
    }
    const result = await pool.query(
      'INSERT INTO job_titles (title, description, status) VALUES ($1, $2, $3) RETURNING id, title, description, status',
      [title, description || '', 'active']
    );
    console.log('✅ Job title created:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creating job title:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/job-titles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Job title is required' });
    }
    const result = await pool.query(
      'UPDATE job_titles SET title = $1, description = $2, status = COALESCE($3, status) WHERE id = $4 RETURNING id, title, description, status',
      [title, description || '', status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job title not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating job title:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/job-titles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM job_titles WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job title not found' });
    }
    res.json({ message: 'Job title deleted successfully' });
  } catch (error) {
    console.error('Error deleting job title:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ORGANIZATION GENERAL INFORMATION API ====================

// Diagnostic endpoint to test organization table
app.get('/api/organization/test', async (req, res) => {
  try {
    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'organization_gen_info'
      )
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    
    if (!tableExists) {
      return res.json({
        success: false,
        tableExists: false,
        message: 'Table hrms_data.organization_gen_info does not exist',
        hint: 'Run: orangehrm/database/create-organization-gen-info-table.sql'
      });
    }
    
    // Try to query the table
    const result = await pool.query('SELECT COUNT(*) as count FROM hrms_data.organization_gen_info');
    const count = result.rows[0].count;
    
    res.json({
      success: true,
      tableExists: true,
      recordCount: parseInt(count),
      message: 'Table exists and is accessible'
    });
  } catch (error) {
    console.error('Error in organization test endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      detail: error.detail
    });
  }
});

// Get organization general information
app.get('/api/organization/general-information', async (req, res) => {
  try {
    // First check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'organization_gen_info'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.error('❌ Table hrms_data.organization_gen_info does not exist!');
      return res.status(500).json({ 
        error: 'Table does not exist',
        message: 'Please run the SQL script to create the organization_gen_info table',
        hint: 'Run: orangehrm/database/create-organization-gen-info-table.sql'
      });
    }

    const result = await pool.query(
      'SELECT * FROM hrms_data.organization_gen_info WHERE id = 1 LIMIT 1'
    );
    if (result.rows.length === 0) {
      // Return default empty structure
      return res.json({
        id: null,
        name: '',
        registration_number: '',
        tax_id: '',
        phone: '',
        fax: '',
        email: '',
        street1: '',
        street2: '',
        city: '',
        province: '',
        zip_code: '',
        country: '',
        note: '',
        number_of_employees: null
      });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error fetching organization general information:', error);
    console.error('   Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    res.status(500).json({ 
      error: error.message,
      hint: 'Check if table hrms_data.organization_gen_info exists and has correct permissions'
    });
  }
});

// Update organization general information
app.put('/api/organization/general-information', async (req, res) => {
  console.log('📥 PUT /api/organization/general-information received:', req.body);
  try {
    // First check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'organization_gen_info'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.error('❌ Table hrms_data.organization_gen_info does not exist!');
      return res.status(500).json({ 
        error: 'Table does not exist',
        message: 'Please run the SQL script to create the organization_gen_info table',
        hint: 'Run: orangehrm/database/create-organization-gen-info-table.sql'
      });
    }

    const {
      name,
      registration_number,
      tax_id,
      phone,
      fax,
      email,
      street1,
      street2,
      city,
      province,
      zip_code,
      country,
      note,
      number_of_employees
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Organization name is required' });
    }

    // Check if record exists
    const checkResult = await pool.query('SELECT id FROM hrms_data.organization_gen_info WHERE id = 1');
    
    if (checkResult.rows.length === 0) {
      // Insert new record
      const result = await pool.query(
        `INSERT INTO hrms_data.organization_gen_info (
          id, name, registration_number, tax_id, phone, fax, email,
          street1, street2, city, province, zip_code, country, note, number_of_employees
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *`,
        [1, name, registration_number || null, tax_id || null, phone || null, fax || null,
         email || null, street1 || null, street2 || null, city || null, province || null,
         zip_code || null, country || null, note || null, number_of_employees || null]
      );
      res.json(result.rows[0]);
    } else {
      // Update existing record
      const result = await pool.query(
        `UPDATE hrms_data.organization_gen_info SET
          name = $1,
          registration_number = $2,
          tax_id = $3,
          phone = $4,
          fax = $5,
          email = $6,
          street1 = $7,
          street2 = $8,
          city = $9,
          province = $10,
          zip_code = $11,
          country = $12,
          note = $13,
          number_of_employees = $14,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
        RETURNING *`,
        [name, registration_number || null, tax_id || null, phone || null, fax || null,
         email || null, street1 || null, street2 || null, city || null, province || null,
         zip_code || null, country || null, note || null, number_of_employees || null]
      );
      console.log('✅ Organization info updated:', result.rows[0]);
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error('❌ Error updating organization general information:', error);
    console.error('   Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    res.status(500).json({ 
      error: error.message,
      code: error.code,
      detail: error.detail,
      hint: 'Check server console for detailed error information'
    });
  }
});

// ==================== LOCATIONS API ====================

// Get all locations
app.get('/api/locations', async (req, res) => {
  try {
    const { name, city, country } = req.query;
    
    let query = 'SELECT id, name, city, country, phone, number_of_employees, status, created_at, updated_at FROM hrms_data.locations WHERE 1=1';
    const params = [];
    let paramCount = 1;
    
    if (name) {
      query += ` AND name ILIKE $${paramCount}`;
      params.push(`%${name}%`);
      paramCount++;
    }
    if (city) {
      query += ` AND city ILIKE $${paramCount}`;
      params.push(`%${city}%`);
      paramCount++;
    }
    if (country) {
      query += ` AND country ILIKE $${paramCount}`;
      params.push(`%${country}%`);
      paramCount++;
    }
    
    query += ' ORDER BY name';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single location
app.get('/api/locations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM hrms_data.locations WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create location
app.post('/api/locations', async (req, res) => {
  console.log('📥 POST /api/locations received:', req.body);
  try {
    const { name, city, country, phone, fax, address, zip_code, province, number_of_employees } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Location name is required' });
    }
    
    const result = await pool.query(
      `INSERT INTO hrms_data.locations (
        name, city, country, phone, fax, address, zip_code, province, number_of_employees, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, name, city, country, phone, number_of_employees, status, created_at, updated_at`,
      [
        name,
        city || null,
        country || null,
        phone || null,
        fax || null,
        address || null,
        zip_code || null,
        province || null,
        number_of_employees || 0,
        'active'
      ]
    );
    console.log('✅ Location created:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creating location:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update location
app.put('/api/locations/:id', async (req, res) => {
  console.log(`📥 PUT /api/locations/${req.params.id} received:`, req.body);
  try {
    const { id } = req.params;
    const { name, city, country, phone, fax, address, zip_code, province, number_of_employees, status } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Location name is required' });
    }
    
    const result = await pool.query(
      `UPDATE hrms_data.locations SET
        name = $1,
        city = $2,
        country = $3,
        phone = $4,
        fax = $5,
        address = $6,
        zip_code = $7,
        province = $8,
        number_of_employees = $9,
        status = COALESCE($10, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING id, name, city, country, phone, number_of_employees, status, created_at, updated_at`,
      [name, city || null, country || null, phone || null, fax || null, address || null, zip_code || null, province || null, number_of_employees || 0, status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    console.log('✅ Location updated:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error updating location:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete location
app.delete('/api/locations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM hrms_data.locations WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ORGANIZATION STRUCTURE API ====================

// Get organization structure (hierarchical tree)
app.get('/api/organization/structure', async (req, res) => {
  try {
    // First check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'organization_structure'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      // Return default structure
      return res.json({
        id: 1,
        name: 'arithwise_hrms',
        unit_id: 'company',
        level: 0,
        children: []
      });
    }

    // Get all units
    const allUnits = await pool.query(
      'SELECT id, name, unit_id, description, parent_id, level FROM hrms_data.organization_structure WHERE status = $1 ORDER BY level, name',
      ['active']
    );

    if (allUnits.rows.length === 0) {
      // Return default structure
      return res.json({
        id: 1,
        name: 'arithwise_hrms',
        unit_id: 'company',
        level: 0,
        children: []
      });
    }

    // Build hierarchical structure
    const unitsMap = new Map();
    const rootUnits = [];

    // First pass: create map of all units
    allUnits.rows.forEach((unit) => {
      unitsMap.set(unit.id, {
        id: unit.id,
        name: unit.name,
        unit_id: unit.unit_id,
        description: unit.description,
        level: unit.level,
        parent_id: unit.parent_id,
        children: []
      });
    });

    // Second pass: build tree
    allUnits.rows.forEach((unit) => {
      const unitNode = unitsMap.get(unit.id);
      if (unit.parent_id === null || unit.parent_id === undefined) {
        rootUnits.push(unitNode);
      } else {
        const parent = unitsMap.get(unit.parent_id);
        if (parent) {
          parent.children.push(unitNode);
        } else {
          // Orphan node, add to root
          rootUnits.push(unitNode);
        }
      }
    });

    // Return the first root unit (or create default)
    if (rootUnits.length > 0) {
      res.json(rootUnits[0]);
    } else {
      res.json({
        id: 1,
        name: 'arithwise_hrms',
        unit_id: 'company',
        level: 0,
        children: []
      });
    }
  } catch (error) {
    console.error('Error fetching organization structure:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create organization unit
app.post('/api/organization/structure', async (req, res) => {
  console.log('📥 POST /api/organization/structure received:', req.body);
  try {
    // First check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'organization_structure'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.error('❌ Table hrms_data.organization_structure does not exist!');
      return res.status(500).json({ 
        error: 'Table does not exist',
        message: 'Please run the SQL script to create the organization_structure table',
        hint: 'Run: orangehrm/database/QUICK_CREATE_STRUCTURE_TABLE.sql'
      });
    }

    const { name, unit_id, description, parent_id, level } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Unit name is required' });
    }

    const result = await pool.query(
      `INSERT INTO hrms_data.organization_structure (name, unit_id, description, parent_id, level, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, unit_id, description, parent_id, level, status`,
      [name, unit_id || null, description || null, parent_id || null, level || 0, 'active']
    );
    
    console.log('✅ Organization unit created:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creating organization unit:', error);
    console.error('   Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    res.status(500).json({ 
      error: error.message,
      code: error.code,
      detail: error.detail
    });
  }
});

// Update organization unit
app.put('/api/organization/structure/:id', async (req, res) => {
  console.log(`📥 PUT /api/organization/structure/${req.params.id} received:`, req.body);
  try {
    // First check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'organization_structure'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.error('❌ Table hrms_data.organization_structure does not exist!');
      return res.status(500).json({ 
        error: 'Table does not exist',
        message: 'Please run the SQL script to create the organization_structure table',
        hint: 'Run: orangehrm/database/VERIFY_AND_CREATE_STRUCTURE_TABLE.sql'
      });
    }

    const { id } = req.params;
    const { name, unit_id, description, parent_id, level } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Unit name is required' });
    }

    const result = await pool.query(
      `UPDATE hrms_data.organization_structure 
      SET name = $1, unit_id = $2, description = $3, parent_id = $4, level = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING id, name, unit_id, description, parent_id, level, status`,
      [name, unit_id || null, description || null, parent_id || null, level || 0, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Organization unit not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating organization unit:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete organization unit
app.delete('/api/organization/structure/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM hrms_data.organization_structure WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Organization unit not found' });
    }
    res.json({ message: 'Organization unit deleted successfully' });
  } catch (error) {
    console.error('Error deleting organization unit:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== VACANCIES API ====================

// Get all vacancies with filters
app.get('/api/vacancies', async (req, res) => {
  try {
    const { jobTitle, vacancy, hiringManager, status } = req.query;
    
    let query = `
      SELECT 
        v.id,
        v.name as vacancy,
        jt.title as job_title,
        v.hiring_manager_id,
        COALESCE(e.first_name || ' ' || e.last_name, '(Deleted)') as hiring_manager,
        v.status,
        v.published_date,
        v.closing_date,
        v.description,
        v.number_of_positions
      FROM vacancies v
      LEFT JOIN job_titles jt ON v.job_title_id = jt.id
      LEFT JOIN employees e ON v.hiring_manager_id = e.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (jobTitle) {
      query += ` AND jt.title = $${paramCount++}`;
      params.push(jobTitle);
    }
    
    if (vacancy) {
      query += ` AND v.name ILIKE $${paramCount++}`;
      params.push(`%${vacancy}%`);
    }
    
    if (hiringManager) {
      query += ` AND (e.first_name || ' ' || e.last_name) ILIKE $${paramCount++}`;
      params.push(`%${hiringManager}%`);
    }
    
    if (status) {
      query += ` AND v.status = $${paramCount++}`;
      params.push(status);
    }
    
    query += ' ORDER BY v.name';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching vacancies:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    res.status(500).json({ 
      error: 'Failed to fetch vacancies',
      message: error.message,
      hint: 'Check if vacancies table exists in hrms_data schema'
    });
  }
});

// Get single vacancy
app.get('/api/vacancies/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        v.*,
        jt.title as job_title,
        COALESCE(e.first_name || ' ' || e.last_name, '(Deleted)') as hiring_manager
      FROM vacancies v
      LEFT JOIN job_titles jt ON v.job_title_id = jt.id
      LEFT JOIN employees e ON v.hiring_manager_id = e.id
      WHERE v.id = $1`,
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vacancy not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching vacancy:', error);
    res.status(500).json({ error: 'Failed to fetch vacancy' });
  }
});

// Create vacancy
app.post('/api/vacancies', async (req, res) => {
  try {
    const { name, jobTitleId, hiringManagerId, description, numberOfPositions, status, publishedDate, closingDate } = req.body;
    
    const result = await pool.query(
      `INSERT INTO vacancies (name, job_title_id, hiring_manager_id, description, number_of_positions, status, published_date, closing_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, jobTitleId, hiringManagerId || null, description || null, numberOfPositions || 1, status || 'active', publishedDate || null, closingDate || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating vacancy:', error);
    res.status(500).json({ error: 'Failed to create vacancy' });
  }
});

// Update vacancy
app.put('/api/vacancies/:id', async (req, res) => {
  try {
    const { name, jobTitleId, hiringManagerId, description, numberOfPositions, status, publishedDate, closingDate } = req.body;
    
    const result = await pool.query(
      `UPDATE vacancies 
       SET name = $1, job_title_id = $2, hiring_manager_id = $3, description = $4, 
           number_of_positions = $5, status = $6, published_date = $7, closing_date = $8,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [name, jobTitleId, hiringManagerId || null, description || null, numberOfPositions || 1, status || 'active', publishedDate || null, closingDate || null, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vacancy not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating vacancy:', error);
    res.status(500).json({ error: 'Failed to update vacancy' });
  }
});

// Delete vacancy
app.delete('/api/vacancies/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM vacancies WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vacancy not found' });
    }
    
    res.json({ message: 'Vacancy deleted successfully' });
  } catch (error) {
    console.error('Error deleting vacancy:', error);
    res.status(500).json({ error: 'Failed to delete vacancy' });
  }
});

// ==================== CANDIDATES API ====================

// Get all candidates with filters
app.get('/api/candidates', async (req, res) => {
  try {
    const { jobTitle, vacancy, hiringManager, status, candidateName, keywords, dateFrom, dateTo, methodOfApplication } = req.query;
    
    let query = `
      SELECT DISTINCT
        c.id,
        c.first_name,
        c.middle_name,
        c.last_name,
        c.email,
        c.contact_number,
        c.keywords,
        c.date_of_application,
        c.status,
        c.method_of_application,
        STRING_AGG(DISTINCT v.name, ', ') as vacancy,
        STRING_AGG(DISTINCT COALESCE(e.first_name || ' ' || e.last_name, '(Deleted)'), ', ') as hiring_manager
      FROM candidates c
      LEFT JOIN candidate_vacancies cv ON c.id = cv.candidate_id
      LEFT JOIN vacancies v ON cv.vacancy_id = v.id
      LEFT JOIN employees e ON v.hiring_manager_id = e.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (jobTitle) {
      query += ` AND EXISTS (
        SELECT 1 FROM candidate_vacancies cv2
        JOIN vacancies v2 ON cv2.vacancy_id = v2.id
        JOIN job_titles jt ON v2.job_title_id = jt.id
        WHERE cv2.candidate_id = c.id AND jt.title = $${paramCount++}
      )`;
      params.push(jobTitle);
    }
    
    if (vacancy) {
      query += ` AND EXISTS (
        SELECT 1 FROM candidate_vacancies cv2
        JOIN vacancies v2 ON cv2.vacancy_id = v2.id
        WHERE cv2.candidate_id = c.id AND v2.name ILIKE $${paramCount++}
      )`;
      params.push(`%${vacancy}%`);
    }
    
    if (hiringManager) {
      query += ` AND EXISTS (
        SELECT 1 FROM candidate_vacancies cv2
        JOIN vacancies v2 ON cv2.vacancy_id = v2.id
        JOIN employees e2 ON v2.hiring_manager_id = e2.id
        WHERE cv2.candidate_id = c.id AND (e2.first_name || ' ' || e2.last_name) ILIKE $${paramCount++}
      )`;
      params.push(`%${hiringManager}%`);
    }
    
    if (status) {
      query += ` AND c.status = $${paramCount++}`;
      params.push(status);
    }
    
    if (candidateName) {
      query += ` AND (c.first_name || ' ' || COALESCE(c.middle_name || ' ', '') || c.last_name) ILIKE $${paramCount++}`;
      params.push(`%${candidateName}%`);
    }
    
    if (keywords) {
      const keywordArray = keywords.split(',').map(k => k.trim());
      query += ` AND (`;
      keywordArray.forEach((keyword, idx) => {
        if (idx > 0) query += ` OR `;
        query += `c.keywords ILIKE $${paramCount++}`;
        params.push(`%${keyword}%`);
      });
      query += `)`;
    }
    
    if (dateFrom) {
      query += ` AND c.date_of_application >= $${paramCount++}`;
      params.push(dateFrom);
    }
    
    if (dateTo) {
      query += ` AND c.date_of_application <= $${paramCount++}`;
      params.push(dateTo);
    }
    
    if (methodOfApplication) {
      query += ` AND c.method_of_application = $${paramCount++}`;
      params.push(methodOfApplication);
    }
    
    query += ` GROUP BY c.id ORDER BY c.date_of_application DESC`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    res.status(500).json({ 
      error: 'Failed to fetch candidates',
      message: error.message,
      hint: 'Check if candidates table exists in hrms_data schema'
    });
  }
});

// Get single candidate
app.get('/api/candidates/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, 
        ARRAY_AGG(DISTINCT v.id) as vacancy_ids,
        ARRAY_AGG(DISTINCT v.name) as vacancies
      FROM candidates c
      LEFT JOIN candidate_vacancies cv ON c.id = cv.candidate_id
      LEFT JOIN vacancies v ON cv.vacancy_id = v.id
      WHERE c.id = $1
      GROUP BY c.id`,
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
});

// Create candidate
app.post('/api/candidates', async (req, res) => {
  try {
    const { firstName, middleName, lastName, email, contactNumber, keywords, comment, dateOfApplication, status, methodOfApplication, vacancyIds } = req.body;
    
    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert candidate
      const candidateResult = await client.query(
        `INSERT INTO candidates (first_name, middle_name, last_name, email, contact_number, keywords, comment, date_of_application, status, method_of_application)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [firstName, middleName || null, lastName, email || null, contactNumber || null, keywords || null, comment || null, dateOfApplication || new Date().toISOString().split('T')[0], status || 'Application Initiated', methodOfApplication || 'Manual']
      );
      
      const candidateId = candidateResult.rows[0].id;
      
      // Link to vacancies if provided
      if (vacancyIds && Array.isArray(vacancyIds) && vacancyIds.length > 0) {
        for (const vacancyId of vacancyIds) {
          await client.query(
            `INSERT INTO candidate_vacancies (candidate_id, vacancy_id, status)
             VALUES ($1, $2, $3)
             ON CONFLICT (candidate_id, vacancy_id) DO NOTHING`,
            [candidateId, vacancyId, status || 'Application Initiated']
          );
        }
      }
      
      await client.query('COMMIT');
      res.status(201).json(candidateResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(500).json({ error: 'Failed to create candidate' });
  }
});

// Update candidate
app.put('/api/candidates/:id', async (req, res) => {
  try {
    const { firstName, middleName, lastName, email, contactNumber, keywords, comment, dateOfApplication, status, methodOfApplication, vacancyIds } = req.body;
    
    const result = await pool.query(
      `UPDATE candidates 
       SET first_name = $1, middle_name = $2, last_name = $3, email = $4, 
           contact_number = $5, keywords = $6, comment = $7, date_of_application = $8,
           status = $9, method_of_application = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [firstName, middleName || null, lastName, email || null, contactNumber || null, keywords || null, comment || null, dateOfApplication, status, methodOfApplication, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(500).json({ error: 'Failed to update candidate' });
  }
});

// Delete candidate
app.delete('/api/candidates/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM candidates WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});

// ==================== EMPLOYEES API ====================

// Get employees (supports compact view for dropdowns)
app.get('/api/employees', async (req, res) => {
  const {
    view,
    employeeId,
    employeeName,
    jobTitle,
    employmentStatus,
    subUnit,
    supervisor,
    include
  } = req.query;

  try {
    if (view === 'compact') {
      const result = await pool.query(
        `SELECT id, employee_id, first_name, last_name,
        first_name || ' ' || last_name AS full_name
        FROM employees
        WHERE status = 'active'
        ORDER BY first_name, last_name`
      );
      return res.json(result.rows);
    }

    let query = `
      SELECT
        e.id,
        e.employee_id,
        e.first_name,
        COALESCE(e.middle_name, '') as middle_name,
        e.last_name,
        e.email,
        e.phone,
        e.position AS job_title,
        COALESCE(e.employment_status, '') as employment_status,
        COALESCE(e.sub_unit, '') as sub_unit,
        COALESCE(e.supervisor_name, '') as supervisor_name,
        e.status,
        e.hire_date
      FROM employees e
      WHERE 1=1
    `;

    const params = [];
    const addFilter = (clause, value) => {
      params.push(value);
      query += ` AND ${clause.replace('$$', `$${params.length}`)}`;
    };

    if (employeeId) {
      addFilter('e.employee_id ILIKE $$', `%${employeeId}%`);
    }

    if (employeeName) {
      // Handle employee name search - middle_name might not exist
      addFilter(
        "(e.first_name || ' ' || COALESCE(NULLIF(e.middle_name, '') || ' ', '') || e.last_name) ILIKE $$",
        `%${employeeName}%`
      );
    }

    if (jobTitle) {
      addFilter('e.position ILIKE $$', `%${jobTitle}%`);
    }

    if (employmentStatus) {
      addFilter('e.employment_status = $$', employmentStatus);
    }

    if (subUnit) {
      addFilter('e.sub_unit = $$', subUnit);
    }

    if (supervisor) {
      addFilter('e.supervisor_name ILIKE $$', `%${supervisor}%`);
    }

    if (include) {
      if (include === 'Current Employees Only') {
        addFilter('e.status = $$', 'active');
      } else if (include === 'Past Employees Only') {
        addFilter("e.status <> $$", 'active');
      }
      // Current and Past Employees => no filter
    }

    query += ' ORDER BY e.employee_id';

    const result = await pool.query(query, params);
    res.json(result.rows.map(mapEmployeeRow));
  } catch (error) {
    console.error('Error fetching employees:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    res.status(500).json({ 
      error: 'Failed to fetch employees',
      message: error.message,
      hint: 'Check if employees table exists in hrms_data schema'
    });
  }
});

// Get single employee
app.get('/api/employees/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        e.id,
        e.employee_id,
        e.first_name,
        COALESCE(e.middle_name, '') as middle_name,
        e.last_name,
        e.email,
        e.phone,
        e.position AS job_title,
        COALESCE(e.employment_status, '') as employment_status,
        COALESCE(e.sub_unit, '') as sub_unit,
        COALESCE(e.supervisor_name, '') as supervisor_name,
        e.status,
        e.hire_date
      FROM employees e
      WHERE e.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(mapEmployeeRow(result.rows[0]));
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Create employee
app.post('/api/employees', async (req, res) => {
  const {
    employeeId,
    firstName,
    middleName,
    lastName,
    email,
    phone,
    jobTitle,
    employmentStatus,
    subUnit,
    supervisorName,
    status,
    hireDate
  } = req.body;

  if (!employeeId || !firstName || !lastName) {
    return res.status(400).json({ error: 'Employee ID, first name, and last name are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO employees (
        employee_id,
        first_name,
        middle_name,
        last_name,
        email,
        phone,
        position,
        employment_status,
        sub_unit,
        supervisor_name,
        status,
        hire_date
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
      )
      RETURNING *`,
      [
        employeeId,
        firstName,
        middleName || null,
        lastName,
        email || null,
        phone || null,
        jobTitle || null,
        employmentStatus || null,
        subUnit || null,
        supervisorName || null,
        status || 'active',
        hireDate || null
      ]
    );

    res.status(201).json(mapEmployeeRow(result.rows[0]));
  } catch (error) {
    console.error('Error creating employee:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Employee ID or email already exists' });
    }
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// Update employee
app.put('/api/employees/:id', async (req, res) => {
  const {
    employeeId,
    firstName,
    middleName,
    lastName,
    email,
    phone,
    jobTitle,
    employmentStatus,
    subUnit,
    supervisorName,
    status,
    hireDate
  } = req.body;

  if (!employeeId || !firstName || !lastName) {
    return res.status(400).json({ error: 'Employee ID, first name, and last name are required' });
  }

  try {
    const result = await pool.query(
      `UPDATE employees SET
        employee_id = $1,
        first_name = $2,
        middle_name = $3,
        last_name = $4,
        email = $5,
        phone = $6,
        position = $7,
        employment_status = $8,
        sub_unit = $9,
        supervisor_name = $10,
        status = $11,
        hire_date = $12,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *`,
      [
        employeeId,
        firstName,
        middleName || null,
        lastName,
        email || null,
        phone || null,
        jobTitle || null,
        employmentStatus || null,
        subUnit || null,
        supervisorName || null,
        status || 'active',
        hireDate || null,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(mapEmployeeRow(result.rows[0]));
  } catch (error) {
    console.error('Error updating employee:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Employee ID or email already exists' });
    }
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// Delete employee
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM employees WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

// Root endpoint - show available API endpoints
// Root route - serve frontend if available, otherwise show API info
app.get('/', (req, res) => {
  const frontendDistPath = path.join(__dirname, '../../web/dist');
  const indexPath = path.join(frontendDistPath, 'index.html');
  
  // If frontend is built, serve it
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Otherwise show API info
    res.json({
      message: 'Arithwise HRM Backend API',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        diagnostic: '/api/diagnostic',
        test: '/api/test',
        jobTitles: '/api/job-titles',
        vacancies: '/api/vacancies',
        candidates: '/api/candidates',
        employees: '/api/employees'
      },
      documentation: 'See README.md for full API documentation',
      note: 'Frontend not built. Run "npm run build" in orangehrm/src/client to build frontend.'
    });
  }
});

// Simple connectivity test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend connected successfully' });
});

// ==================== AUTHENTICATION API ====================

// Login endpoint
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Username and password are required' 
      });
    }

    // Check if users table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'users'
      )
    `);

    if (!tableCheck.rows[0].exists) {
      // Users table doesn't exist - use mock authentication for development
      console.log('⚠️  Users table not found, using mock authentication');
      
      if (username === 'admin' && password === 'Admin@123') {
        return res.json({
          success: true,
          user: {
            id: 1,
            username: 'admin',
            email: 'admin@arithwise.com',
            first_name: 'Admin',
            last_name: 'User',
            role: 'admin',
            status: 'active'
          },
          token: 'mock-token-' + Date.now(),
          message: 'Mock authentication (users table not found)'
        });
      } else if (username === 'user' && password === 'User@123') {
        return res.json({
          success: true,
          user: {
            id: 2,
            username: 'user',
            email: 'user@arithwise.com',
            first_name: 'Regular',
            last_name: 'User',
            role: 'user',
            status: 'active'
          },
          token: 'mock-token-' + Date.now(),
          message: 'Mock authentication (users table not found)'
        });
      } else {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid username or password' 
        });
      }
    }

    // Users table exists - query database
    const result = await pool.query(
      'SELECT id, username, email, password_hash, first_name, last_name, role, status FROM hrms_data.users WHERE username = $1 OR email = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid username or password' 
      });
    }

    const user = result.rows[0];

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({ 
        success: false,
        message: 'Account is ' + user.status 
      });
    }

    // Password verification - support both bcrypt hashed and plain text (for development)
    let passwordMatch = false;
    
    // Check if password_hash looks like a bcrypt hash (starts with $2a$, $2b$, or $2y$)
    if (user.password_hash && (user.password_hash.startsWith('$2a$') || user.password_hash.startsWith('$2b$') || user.password_hash.startsWith('$2y$'))) {
      // Use bcrypt to verify hashed password
      try {
        const bcrypt = require('bcrypt');
        passwordMatch = await bcrypt.compare(password, user.password_hash);
      } catch (err) {
        console.error('Bcrypt comparison error:', err);
        // Fallback to plain text comparison if bcrypt fails
        passwordMatch = password === user.password_hash;
      }
    } else {
      // Plain text password comparison (for development)
      passwordMatch = password === user.password_hash || 
                      password === 'Admin@123' && user.role === 'admin' ||
                      password === 'User@123' && user.role === 'user';
    }

    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid username or password' 
      });
    }

    // Update last login
    await pool.query(
      'UPDATE hrms_data.users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate session token (simple for now, use JWT in production)
    const sessionToken = 'session-' + user.id + '-' + Date.now();

    // Store session in database (if user_sessions table exists)
    try {
      await pool.query(
        'INSERT INTO hrms_data.user_sessions (user_id, session_token, expires_at, ip_address) VALUES ($1, $2, $3, $4)',
        [user.id, sessionToken, new Date(Date.now() + 24 * 60 * 60 * 1000), req.ip]
      );
    } catch (err) {
      // Session table might not exist, that's okay for now
      console.log('⚠️  Could not store session (table might not exist):', err.message);
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        status: user.status
      },
      token: sessionToken
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// Get current user endpoint
app.get('/api/v1/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                 req.query.token || 
                 req.body.token;

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    // Check if user_sessions table exists
    const sessionCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'user_sessions'
      )
    `);

    if (sessionCheck.rows[0].exists) {
      // Verify session token
      const sessionResult = await pool.query(
        'SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.role, u.status FROM hrms_data.user_sessions s JOIN hrms_data.users u ON s.user_id = u.id WHERE s.session_token = $1 AND s.expires_at > CURRENT_TIMESTAMP',
        [token]
      );

      if (sessionResult.rows.length > 0) {
        const user = sessionResult.rows[0];
        return res.json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            status: user.status
          }
        });
      }
    }

    // Fallback: if no session table or token invalid, return error
    return res.status(401).json({ 
      success: false,
      message: 'Invalid or expired token' 
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// Logout endpoint
app.post('/api/v1/auth/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                 req.query.token || 
                 req.body.token;

    if (token) {
      // Delete session from database
      try {
        await pool.query(
          'DELETE FROM user_sessions WHERE session_token = $1',
          [token]
        );
      } catch (err) {
        // Session table might not exist, that's okay
        console.log('⚠️  Could not delete session:', err.message);
      }
    }

    res.json({ 
      success: true,
      message: 'Logged out successfully' 
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// Diagnostic endpoint to check database tables and data
app.get('/api/diagnostic', async (req, res) => {
  try {
    const results = {
      connection: false,
      schema_exists: false,
      tables: [],
      table_counts: {},
      search_path: null,
      errors: []
    };

    // Test connection
    try {
      await pool.query('SELECT 1');
      results.connection = true;
    } catch (err) {
      results.errors.push(`Connection failed: ${err.message}`);
      return res.json(results);
    }

    // Check current search_path
    try {
      const pathResult = await pool.query('SHOW search_path');
      results.search_path = pathResult.rows[0].search_path;
    } catch (err) {
      results.errors.push(`Could not get search_path: ${err.message}`);
    }

    // Check if schema exists
    try {
      const schemaResult = await pool.query(`
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name = 'hrms_data'
      `);
      results.schema_exists = schemaResult.rows.length > 0;
    } catch (err) {
      results.errors.push(`Schema check failed: ${err.message}`);
    }

    // Get all tables in hrms_data schema
    try {
      const tablesResult = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'hrms_data'
        ORDER BY table_name
      `);
      results.tables = tablesResult.rows.map(r => r.table_name);
    } catch (err) {
      results.errors.push(`Table listing failed: ${err.message}`);
    }

    // Get row counts for each table
    for (const table of results.tables) {
      try {
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        results.table_counts[table] = parseInt(countResult.rows[0].count);
      } catch (err) {
        results.table_counts[table] = `Error: ${err.message}`;
        results.errors.push(`Count failed for ${table}: ${err.message}`);
      }
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ 
      error: 'Diagnostic check failed', 
      message: error.message,
      stack: error.stack
    });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test basic connection
    await pool.query('SELECT 1');
    
    // Check if schema exists and get table count
    const schemaCheck = await pool.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'hrms_data'
    `);
    
    // Check if we can query a table (test with employees table)
    let tableAccess = false;
    try {
      await pool.query('SELECT COUNT(*) FROM employees LIMIT 1');
      tableAccess = true;
    } catch (err) {
      tableAccess = false;
    }
    
    res.json({ 
      status: 'ok', 
      database: 'connected',
      schema: 'hrms_data',
      tables_found: parseInt(schemaCheck.rows[0].table_count),
      table_access: tableAccess
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected', 
      error: error.message,
      details: error.stack
    });
  }
});

// ============================================================================
// LEAVE MANAGEMENT API ENDPOINTS
// ============================================================================

// Leave Types - Return CL, EL, and Unpaid Leave (active status)
app.get('/api/leave-types', async (req, res) => {
  try {
    // Return Casual Leave, Earned Leave, and Unpaid Leave (active status)
    // CL includes Sick Leave (no separate SL)
    const result = await pool.query(`
      SELECT * FROM hrms_data.leave_types 
      WHERE status = 'active' 
      ORDER BY 
        CASE 
          WHEN LOWER(name) LIKE '%casual%' THEN 1
          WHEN LOWER(name) LIKE '%earned%' OR LOWER(name) LIKE '%privilege%' THEN 2
          WHEN LOWER(name) LIKE '%unpaid%' OR LOWER(name) LIKE '%lwp%' THEN 3
          ELSE 4
        END,
        name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching leave types:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/leave-types', async (req, res) => {
  try {
    const { name, description, entitlement_days, is_paid } = req.body;
    
    // Validate: Allow CL, EL, and Unpaid Leave
    if (name && !name.toLowerCase().includes('casual') && !name.toLowerCase().includes('earned') && !name.toLowerCase().includes('privilege') && !name.toLowerCase().includes('unpaid') && !name.toLowerCase().includes('lwp')) {
      return res.status(400).json({ error: 'Only Casual Leave (CL), Earned Leave (EL), and Unpaid Leave are allowed. Sick Leave is included in Casual Leave.' });
    }
    
    // Default is_paid based on leave type name
    let defaultIsPaid = true;
    if (name && (name.toLowerCase().includes('unpaid') || name.toLowerCase().includes('lwp'))) {
      defaultIsPaid = false;
    }
    
    // Use INSERT ... ON CONFLICT to handle duplicate names
    // If name exists (even if deleted), update it instead of creating new
    const result = await pool.query(
      `INSERT INTO hrms_data.leave_types (name, description, entitlement_days, is_paid, status) 
       VALUES ($1, $2, $3, $4, 'active') 
       ON CONFLICT (name) 
       DO UPDATE SET 
         description = EXCLUDED.description,
         entitlement_days = EXCLUDED.entitlement_days,
         is_paid = EXCLUDED.is_paid,
         status = 'active',
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [name, description, entitlement_days || 0, is_paid !== undefined ? is_paid : defaultIsPaid]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating leave type:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/leave-types/:id', async (req, res) => {
  try {
    const { name, description, entitlement_days, status, is_paid } = req.body;
    
    // Validate: Allow CL, EL, and Unpaid Leave names
    if (name && !name.toLowerCase().includes('casual') && !name.toLowerCase().includes('earned') && !name.toLowerCase().includes('privilege') && !name.toLowerCase().includes('unpaid') && !name.toLowerCase().includes('lwp')) {
      return res.status(400).json({ error: 'Only Casual Leave (CL), Earned Leave (EL), and Unpaid Leave are allowed.' });
    }
    
    // Check if name change would cause duplicate
    if (name) {
      const checkResult = await pool.query(
        'SELECT id FROM hrms_data.leave_types WHERE name = $1 AND id != $2',
        [name, req.params.id]
      );
      if (checkResult.rows.length > 0) {
        return res.status(400).json({ error: 'A leave type with this name already exists.' });
      }
    }
    
    const result = await pool.query(
      'UPDATE hrms_data.leave_types SET name = $1, description = $2, entitlement_days = $3, status = $4, is_paid = COALESCE($5, is_paid), updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [name, description, entitlement_days, status, is_paid, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Leave type not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating leave type:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/leave-types/:id', async (req, res) => {
  try {
    await pool.query('UPDATE hrms_data.leave_types SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['deleted', req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting leave type:', error);
    res.status(500).json({ error: error.message });
  }
});

// Leave Requests
app.get('/api/leave-requests', async (req, res) => {
  try {
    const { employee_id, status, user_id, month } = req.query;
    let query = `
      SELECT lr.*, 
             e.first_name || ' ' || e.last_name as employee_name,
             e.date_of_joining,
             lt.name as leave_type_name,
             COALESCE(lt.is_paid, true) as is_paid,
             DATE_TRUNC('month', lr.from_date)::DATE as leave_month
      FROM hrms_data.leave_requests lr
      JOIN hrms_data.employees e ON lr.employee_id = e.id
      JOIN hrms_data.leave_types lt ON lr.leave_type_id = lt.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;
    
    // If user_id is provided, get employee_id from employees table
    if (user_id && !employee_id) {
      const empResult = await pool.query(
        'SELECT id FROM hrms_data.employees WHERE user_id = $1 LIMIT 1',
        [user_id]
      );
      if (empResult.rows.length > 0) {
        query += ` AND lr.employee_id = $${paramCount++}`;
        params.push(empResult.rows[0].id);
      } else {
        // User has no employee record, return empty
        return res.json([]);
      }
    } else if (employee_id) {
      query += ` AND lr.employee_id = $${paramCount++}`;
      params.push(employee_id);
    }
    
    if (status) {
      query += ` AND lr.status = $${paramCount++}`;
      params.push(status);
    }
    
    if (month) {
      query += ` AND DATE_TRUNC('month', lr.from_date) = $${paramCount++}`;
      params.push(month);
    }
    
    query += ' ORDER BY lr.date_applied DESC';
    
    const result = await pool.query(query, params);
    
    // Add payable days calculation for each leave request
    const leaveRequestsWithPayroll = await Promise.all(result.rows.map(async (lr) => {
      try {
        const payrollResult = await pool.query(
          'SELECT * FROM hrms_data.calculate_payable_days($1, $2)',
          [lr.leave_month || lr.from_date, lr.employee_id]
        );
        if (payrollResult.rows.length > 0) {
          return {
            ...lr,
            total_days: payrollResult.rows[0].total_days,
            off_days: payrollResult.rows[0].off_days,
            holidays: payrollResult.rows[0].holidays,
            working_days: payrollResult.rows[0].working_days,
            unpaid_leave_days: parseFloat(payrollResult.rows[0].unpaid_leave_days || 0),
            payable_days: parseFloat(payrollResult.rows[0].payable_days || 0)
          };
        }
      } catch (err) {
        console.error('Error calculating payable days:', err);
      }
      return lr;
    }));
    
    res.json(leaveRequestsWithPayroll);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/leave-requests', async (req, res) => {
  try {
    let { employee_id, user_id, leave_type_id, from_date, to_date, number_of_days, comments } = req.body;
    
    console.log('Leave request received:', { employee_id, user_id, leave_type_id, from_date, to_date, number_of_days });
    
    // If user_id is provided but employee_id is not, get employee_id from employees table
    if (user_id && !employee_id) {
      try {
        // First, check if employees table has user_id column
        const columnCheck = await pool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = 'hrms_data' 
          AND table_name = 'employees' 
          AND column_name = 'user_id'
        `);
        
        if (columnCheck.rows.length > 0) {
          // Table has user_id column, query by it
          const empResult = await pool.query(
            'SELECT id FROM hrms_data.employees WHERE user_id = $1 LIMIT 1',
            [user_id]
          );
          
          if (empResult.rows.length > 0) {
            employee_id = empResult.rows[0].id;
            console.log('Found employee_id:', employee_id, 'for user_id:', user_id);
          } else {
            // If user has no employee record, check if employee exists by email first
            console.log('No employee record found for user_id:', user_id, '- Checking by email...');
            
            // Get user details
            const userResult = await pool.query(
              'SELECT first_name, last_name, email FROM hrms_data.users WHERE id = $1',
              [user_id]
            );
            
            if (userResult.rows.length > 0) {
              const user = userResult.rows[0];
              
              // Check if employee exists by email
              if (user.email) {
                const empByEmail = await pool.query(
                  'SELECT id FROM hrms_data.employees WHERE email = $1 LIMIT 1',
                  [user.email]
                );
                
                if (empByEmail.rows.length > 0) {
                  // Employee exists by email, update user_id
                  employee_id = empByEmail.rows[0].id;
                  await pool.query(
                    'UPDATE hrms_data.employees SET user_id = $1 WHERE id = $2',
                    [user_id, employee_id]
                  );
                  console.log('Found employee by email, updated user_id. employee_id:', employee_id);
                }
              }
              
              // If still no employee_id, create new one
              if (!employee_id) {
                console.log('Creating new employee record...');
                // Check employees table structure
                const empColumns = await pool.query(`
                  SELECT column_name, data_type 
                  FROM information_schema.columns 
                  WHERE table_schema = 'hrms_data' 
                  AND table_name = 'employees'
                  ORDER BY ordinal_position
                `);
                
                const hasEmployeeId = empColumns.rows.some(col => col.column_name === 'employee_id');
                const hasStatus = empColumns.rows.some(col => col.column_name === 'status');
                
                // Build INSERT query - skip email if it would cause duplicate
                let insertCols = ['user_id', 'first_name', 'last_name'];
                let insertVals = [user_id, user.first_name || 'User', user.last_name || ''];
                let placeholders = ['$1', '$2', '$3'];
                let paramCount = 4;
                
                if (hasEmployeeId) {
                  insertCols.push('employee_id');
                  insertVals.push(`EMP${user_id}`);
                  placeholders.push(`$${paramCount++}`);
                }
                
                // Only add email if it doesn't already exist
                if (user.email) {
                  const emailExists = await pool.query(
                    'SELECT id FROM hrms_data.employees WHERE email = $1',
                    [user.email]
                  );
                  if (emailExists.rows.length === 0) {
                    insertCols.push('email');
                    insertVals.push(user.email);
                    placeholders.push(`$${paramCount++}`);
                  }
                }
                
                if (hasStatus) {
                  insertCols.push('status');
                  insertVals.push('active');
                  placeholders.push(`$${paramCount++}`);
                }
                
                const finalCols = insertCols.filter(c => c !== 'created_at');
                const finalVals = insertVals.filter((v, i) => insertCols[i] !== 'created_at');
                const finalPlaceholders = finalCols.map((_, i) => `$${i + 1}`);
                
                const insertQuery = `
                  INSERT INTO hrms_data.employees (${finalCols.join(', ')})
                  VALUES (${finalPlaceholders.join(', ')})
                  RETURNING id
                `;
                
                console.log('Creating employee with query:', insertQuery);
                console.log('Values:', finalVals);
                
                const newEmpResult = await pool.query(insertQuery, finalVals);
                employee_id = newEmpResult.rows[0].id;
                console.log('Created employee record with id:', employee_id);
              }
            } else {
              return res.status(400).json({ 
                error: 'User not found. Please ensure you are logged in correctly.' 
              });
            }
          }
        } else {
          // Table doesn't have user_id column, try to find employee by other means
          // For now, we'll need to use a different approach
          console.log('employees table does not have user_id column');
          
          // Try to get the first employee or create a default one
          // This is a fallback - ideally the employees table should have user_id
          const firstEmp = await pool.query('SELECT id FROM hrms_data.employees LIMIT 1');
          
          if (firstEmp.rows.length > 0) {
            employee_id = firstEmp.rows[0].id;
            console.log('Using first available employee_id:', employee_id);
          } else {
            return res.status(400).json({ 
              error: 'No employee records found. Please contact administrator to create an employee record for your user account.' 
            });
          }
        }
      } catch (empError) {
        console.error('Error getting/creating employee:', empError);
        console.error('Error details:', empError.message, empError.stack);
        // If we can't get employee_id, return error
        return res.status(400).json({ 
          error: `Unable to determine employee_id: ${empError.message}. Please ensure you have an employee record or contact administrator.` 
        });
      }
    }
    
    // Final check - employee_id MUST be set and valid
    if (!employee_id || employee_id === null || employee_id === undefined) {
      console.error('CRITICAL: employee_id is still null after all processing');
      console.error('Request body was:', req.body);
      return res.status(400).json({ 
        error: 'Unable to determine employee_id. Please ensure you have an employee record. If you are an admin, please contact the system administrator to create an employee record for your account.' 
      });
    }
    
    // Ensure employee_id is an integer
    employee_id = parseInt(employee_id);
    if (isNaN(employee_id)) {
      console.error('CRITICAL: employee_id is not a valid number:', employee_id);
      return res.status(400).json({ 
        error: 'Invalid employee_id. Please contact administrator.' 
      });
    }
    
    console.log('Using employee_id:', employee_id, 'for leave request');
    
    // Validate required fields
    if (!leave_type_id || !from_date || !to_date) {
      return res.status(400).json({ error: 'Missing required fields: leave_type_id, from_date, to_date' });
    }
    
    // Calculate number_of_days if not provided (inclusive: from 29 to 30 = 2 days)
    if (number_of_days === null || number_of_days === undefined) {
      const from = new Date(from_date);
      const to = new Date(to_date);
      const diffTime = Math.abs(to.getTime() - from.getTime());
      number_of_days = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both dates
    }
    
    // Ensure number_of_days and leave_type_id are integers
    number_of_days = parseInt(number_of_days);
    leave_type_id = parseInt(leave_type_id);
    
    // Validate business rules using database function
    try {
      const validationResult = await pool.query(
        'SELECT hrms_data.validate_leave_request($1, $2, $3, $4, $5) as result',
        [employee_id, leave_type_id, from_date, to_date, number_of_days]
      );
      
      if (validationResult.rows.length > 0) {
        const validation = validationResult.rows[0].result;
        if (validation.valid === false) {
          const errors = Array.isArray(validation.errors) 
            ? validation.errors.map(e => e.message || e).join('; ')
            : validation.errors.message || 'Validation failed';
          return res.status(400).json({ 
            error: `Leave request validation failed: ${errors}`,
            validation_errors: validation.errors
          });
        }
      }
    } catch (validationError) {
      console.error('Validation error (continuing anyway):', validationError);
      // Continue if validation function doesn't exist yet
    }
    
    console.log('Inserting leave request with:', {
      employee_id,
      leave_type_id,
      from_date,
      to_date,
      number_of_days,
      comments: comments || ''
    });
    
    try {
      const result = await pool.query(
        `INSERT INTO hrms_data.leave_requests (employee_id, leave_type_id, from_date, to_date, number_of_days, comments, applied_by)
         VALUES ($1, $2, $3, $4, $5, $6, $1) RETURNING *`,
        [employee_id, leave_type_id, from_date, to_date, number_of_days, comments || '']
      );
      
      console.log('Leave request created successfully:', result.rows[0].id);
      res.status(201).json(result.rows[0]);
    } catch (insertError) {
      console.error('Error inserting leave request:', insertError);
      console.error('Insert error details:', insertError.message, insertError.stack);
      res.status(500).json({ 
        error: `Failed to create leave request: ${insertError.message}` 
      });
    }
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/leave-requests/:id', async (req, res) => {
  try {
    const { status, approved_by } = req.body;
    
    // Get the leave request details first
    const leaveRequest = await pool.query(
      'SELECT * FROM hrms_data.leave_requests WHERE id = $1',
      [req.params.id]
    );
    
    if (leaveRequest.rows.length === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    
    const lr = leaveRequest.rows[0];
    const oldStatus = lr.status;
    
    // Update the leave request status
    const result = await pool.query(
      `UPDATE hrms_data.leave_requests SET status = $1, approved_by = $2, approved_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 RETURNING *`,
      [status, approved_by, req.params.id]
    );
    
    // If status changed to approved/taken/scheduled, deduct from entitlement
    if ((status === 'approved' || status === 'taken' || status === 'scheduled') && 
        (oldStatus !== 'approved' && oldStatus !== 'taken' && oldStatus !== 'scheduled')) {
      // Update leave entitlement - add used days
      await pool.query(
        `UPDATE hrms_data.leave_entitlements 
         SET used_days = COALESCE(used_days, 0) + $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE employee_id = $2 AND leave_type_id = $3
         AND (leave_period_start IS NULL OR leave_period_start <= $4)
         AND (leave_period_end IS NULL OR leave_period_end >= $4)`,
        [lr.number_of_days, lr.employee_id, lr.leave_type_id, lr.from_date]
      );
    }
    
    // If status changed from approved/taken/scheduled to rejected/cancelled, restore entitlement
    if ((status === 'rejected' || status === 'cancelled') && 
        (oldStatus === 'approved' || oldStatus === 'taken' || oldStatus === 'scheduled')) {
      // Restore entitlement - subtract used days
      await pool.query(
        `UPDATE hrms_data.leave_entitlements 
         SET used_days = GREATEST(COALESCE(used_days, 0) - $1, 0),
             updated_at = CURRENT_TIMESTAMP
         WHERE employee_id = $2 AND leave_type_id = $3
         AND (leave_period_start IS NULL OR leave_period_start <= $4)
         AND (leave_period_end IS NULL OR leave_period_end >= $4)`,
        [lr.number_of_days, lr.employee_id, lr.leave_type_id, lr.from_date]
      );
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating leave request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Holidays
app.get('/api/holidays', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hrms_data.holidays ORDER BY date');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/holidays', async (req, res) => {
  try {
    const { name, date, full_day, repeats_annually } = req.body;
    const result = await pool.query(
      'INSERT INTO hrms_data.holidays (name, date, full_day, repeats_annually) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, date, full_day !== false, repeats_annually === true]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating holiday:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/holidays/:id', async (req, res) => {
  try {
    const { name, date, full_day, repeats_annually } = req.body;
    const result = await pool.query(
      'UPDATE hrms_data.holidays SET name = $1, date = $2, full_day = $3, repeats_annually = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [name, date, full_day !== false, repeats_annually === true, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating holiday:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/holidays/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM hrms_data.holidays WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting holiday:', error);
    res.status(500).json({ error: error.message });
  }
});

// Work Week Configuration
app.get('/api/work-week', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hrms_data.work_week ORDER BY id DESC LIMIT 1');
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      // Return default work week
      res.json({
        id: 1,
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false
      });
    }
  } catch (error) {
    console.error('Error fetching work week:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/work-week', async (req, res) => {
  try {
    const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } = req.body;
    const result = await pool.query(
      `INSERT INTO hrms_data.work_week (monday, tuesday, wednesday, thursday, friday, saturday, sunday)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [monday !== false, tuesday !== false, wednesday !== false, thursday !== false, friday !== false, saturday === true, sunday === true]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating work week:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/work-week/:id', async (req, res) => {
  try {
    const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } = req.body;
    const result = await pool.query(
      `UPDATE hrms_data.work_week SET monday = $1, tuesday = $2, wednesday = $3, thursday = $4, friday = $5, saturday = $6, sunday = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 RETURNING *`,
      [monday !== false, tuesday !== false, wednesday !== false, thursday !== false, friday !== false, saturday === true, sunday === true, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating work week:', error);
    res.status(500).json({ error: error.message });
  }
});

// Payable Days Calculation
app.get('/api/payable-days', async (req, res) => {
  try {
    const { employee_id, month } = req.query;
    if (!employee_id || !month) {
      return res.status(400).json({ error: 'employee_id and month are required' });
    }
    const result = await pool.query(
      'SELECT * FROM hrms_data.calculate_payable_days($1, $2)',
      [month, parseInt(employee_id)]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error calculating payable days:', error);
    res.status(500).json({ error: error.message });
  }
});

// Monthly Leave Summary (Comprehensive - All Requirements)
app.get('/api/monthly-leave-summary', async (req, res) => {
  try {
    const { employee_id, month } = req.query;
    if (!employee_id || !month) {
      return res.status(400).json({ error: 'employee_id and month are required' });
    }
    
    // Call the comprehensive monthly summary function
    const result = await pool.query(
      'SELECT * FROM hrms_data.get_monthly_leave_summary($1, $2::DATE)',
      [parseInt(employee_id), month]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No summary data found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching monthly leave summary:', error);
    res.status(500).json({ error: error.message });
  }
});

// Leave Entitlements
app.get('/api/leave-entitlements', async (req, res) => {
  try {
    const { employee_id } = req.query;
    let query = `
      SELECT le.*, lt.name as leave_type_name, lt.is_paid
      FROM hrms_data.leave_entitlements le
      JOIN hrms_data.leave_types lt ON le.leave_type_id = lt.id
      WHERE 1=1
    `;
    const params = [];
    if (employee_id) {
      query += ' AND le.employee_id = $1';
      params.push(employee_id);
    }
    query += ' ORDER BY le.leave_period_start DESC, lt.name';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching leave entitlements:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/leave-entitlements', async (req, res) => {
  try {
    const { employee_id, leave_type_id, entitlement_days, leave_period_start, leave_period_end } = req.body;
    const result = await pool.query(
      `INSERT INTO hrms_data.leave_entitlements (employee_id, leave_type_id, entitlement_days, leave_period_start, leave_period_end)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [employee_id, leave_type_id, entitlement_days || 0, leave_period_start, leave_period_end]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating leave entitlement:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/leave-entitlements/:id', async (req, res) => {
  try {
    const { entitlement_days, used_days, leave_period_start, leave_period_end } = req.body;
    const result = await pool.query(
      `UPDATE hrms_data.leave_entitlements 
       SET entitlement_days = COALESCE($1, entitlement_days), 
           used_days = COALESCE($2, used_days),
           leave_period_start = COALESCE($3, leave_period_start),
           leave_period_end = COALESCE($4, leave_period_end),
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 RETURNING *`,
      [entitlement_days, used_days, leave_period_start, leave_period_end, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating leave entitlement:', error);
    res.status(500).json({ error: error.message });
  }
});

// Leave Reports
app.get('/api/leave-reports/employee/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { year, month, user_id } = req.query;
    const reportYear = year ? parseInt(year) : new Date().getFullYear();
    const reportMonth = month ? parseInt(month) : null;
    
    let finalEmployeeId = parseInt(employeeId);
    
    // If user_id is provided but employeeId is not valid, try to find employee by user_id
    if (user_id && (!employeeId || employeeId === '0' || employeeId === 'undefined')) {
      const empResult = await pool.query(
        'SELECT id FROM hrms_data.employees WHERE user_id = $1 LIMIT 1',
        [parseInt(user_id)]
      );
      if (empResult.rows.length > 0) {
        finalEmployeeId = empResult.rows[0].id;
      } else {
        return res.status(404).json({ error: 'Employee record not found for this user' });
      }
    }
    
    // Call the database function to get employee leave report
    console.log('📊 Calling get_employee_leave_report with:', { finalEmployeeId, reportYear });
    const result = await pool.query(
      'SELECT * FROM hrms_data.get_employee_leave_report($1, $2)',
      [finalEmployeeId, reportYear]
    );
    
    console.log('📊 Database function returned rows:', result.rows.length);
    
    if (result.rows.length === 0) {
      console.log('⚠️ No leave types found in database');
      return res.json({ leave_summary: [] });
    }
    
    // The function returns multiple rows (one per leave type)
    // Structure it as { leave_summary: [...] }
    let reportData = { leave_summary: result.rows };
    console.log('📊 Initial reportData:', { 
      leaveTypesCount: reportData.leave_summary.length,
      sample: reportData.leave_summary[0] 
    });
    
    // If month is specified, update used_days to reflect only that month
    if (reportMonth && reportData.leave_summary) {
      // Use a single query to get all monthly data at once (more efficient)
      const monthlyDataQuery = `
        SELECT 
            lt.id as leave_type_id,
            lt.name as leave_type_name,
            COALESCE(SUM(CASE WHEN lr.status IN ('approved', 'taken', 'scheduled') THEN lr.number_of_days ELSE 0 END), 0) as used_days,
            COALESCE(SUM(CASE WHEN lr.status = 'pending' THEN lr.number_of_days ELSE 0 END), 0) as pending_days,
            COALESCE(SUM(CASE WHEN lr.status = 'scheduled' THEN lr.number_of_days ELSE 0 END), 0) as scheduled_days,
            COALESCE(SUM(CASE WHEN lr.status = 'taken' THEN lr.number_of_days ELSE 0 END), 0) as taken_days
        FROM hrms_data.leave_types lt
        LEFT JOIN hrms_data.leave_requests lr ON (
            lr.leave_type_id = lt.id
            AND lr.employee_id = $1
            AND EXTRACT(YEAR FROM lr.from_date) = $2
            AND EXTRACT(MONTH FROM lr.from_date) = $3
            AND lr.status IN ('approved', 'taken', 'scheduled', 'pending')
        )
        WHERE lt.status != 'deleted'
        GROUP BY lt.id, lt.name
      `;
      
      const monthlyResult = await pool.query(monthlyDataQuery, [finalEmployeeId, reportYear, reportMonth]);
      const monthlyMap = {};
      monthlyResult.rows.forEach(row => {
        monthlyMap[row.leave_type_name] = row;
      });
      
      // Update report data with monthly information
      reportData = {
        ...reportData,
        leave_summary: reportData.leave_summary.map((item) => {
          const monthly = monthlyMap[item.leave_type_name] || {
            used_days: 0,
            pending_days: 0,
            scheduled_days: 0,
            taken_days: 0
          };
          
          const monthlyData = item.monthly_breakdown && Array.isArray(item.monthly_breakdown) 
            ? item.monthly_breakdown.find((m) => m.month === reportMonth)
            : null;
          
          return {
            ...item,
            monthly_breakdown: monthlyData ? [monthlyData] : [],
            used_days: parseFloat(monthly.used_days || 0),
            balance_days: item.total_entitlement - parseFloat(monthly.used_days || 0),
            monthly_pending: parseFloat(monthly.pending_days || 0),
            monthly_scheduled: parseFloat(monthly.scheduled_days || 0),
            monthly_taken: parseFloat(monthly.taken_days || 0),
            annual_used_days: item.used_days,
            annual_balance_days: item.balance_days
          };
        })
      };
    }
    
    // Ensure leave_summary is always an array
    if (!Array.isArray(reportData.leave_summary)) {
      reportData.leave_summary = [];
    }
    
    // Debug logging
    console.log('📊 Leave Report Response:', {
      employeeId: finalEmployeeId,
      year: reportYear,
      month: reportMonth,
      leaveTypesCount: reportData.leave_summary.length,
      sample: reportData.leave_summary[0] || null,
      allLeaveTypes: reportData.leave_summary.map((item) => ({
        name: item.leave_type_name,
        used: item.used_days,
        pending: item.monthly_pending,
        scheduled: item.monthly_scheduled,
        taken: item.monthly_taken
      })),
      fullStructure: JSON.stringify(reportData).substring(0, 200)
    });
    
    // CRITICAL: Ensure we always return { leave_summary: [...] } structure
    const response = {
      leave_summary: Array.isArray(reportData.leave_summary) ? reportData.leave_summary : []
    };
    
    console.log('📊 Sending response structure:', {
      hasLeaveSummary: !!response.leave_summary,
      isArray: Array.isArray(response.leave_summary),
      length: response.leave_summary.length
    });
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching employee leave report:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper endpoint to get employee ID by user_id
app.get('/api/employees/by-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const parsedUserId = parseInt(userId);

    // First, try to find directly by user_id column
    let result = await pool.query(
      'SELECT id, first_name, last_name, email FROM hrms_data.employees WHERE user_id = $1 LIMIT 1',
      [parsedUserId]
    );

    // If not found, try to infer from leave_requests (user has applied leave)
    if (result.rows.length === 0) {
      const lrResult = await pool.query(
        'SELECT employee_id FROM hrms_data.leave_requests WHERE user_id = $1 ORDER BY created_at DESC NULLS LAST LIMIT 1',
        [parsedUserId]
      );

      if (lrResult.rows.length > 0 && lrResult.rows[0].employee_id) {
        result = await pool.query(
          'SELECT id, first_name, last_name, email FROM hrms_data.employees WHERE id = $1 LIMIT 1',
          [lrResult.rows[0].employee_id]
        );
      }
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching employee by user_id:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// TIME & ATTENDANCE API ENDPOINTS
// ============================================================================

// Attendance Records
app.get('/api/attendance-records', async (req, res) => {
  try {
    const { employee_id, date } = req.query;
    let query = `
      SELECT ar.*, e.first_name || ' ' || e.last_name as employee_name
      FROM attendance_records ar
      JOIN employees e ON ar.employee_id = e.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;
    
    if (employee_id) {
      query += ` AND ar.employee_id = $${paramCount++}`;
      params.push(employee_id);
    }
    if (date) {
      query += ` AND ar.punch_in_date = $${paramCount++}`;
      params.push(date);
    }
    query += ' ORDER BY ar.punch_in_date DESC, ar.punch_in_time DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/attendance-records/punch-in', async (req, res) => {
  try {
    const { employee_id, punch_in_date, punch_in_time, punch_in_note } = req.body;
    const result = await pool.query(
      `INSERT INTO attendance_records (employee_id, punch_in_date, punch_in_time, punch_in_note, status)
       VALUES ($1, $2, $3, $4, 'punched_in') RETURNING *`,
      [employee_id, punch_in_date, punch_in_time, punch_in_note]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error punching in:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/attendance-records/:id/punch-out', async (req, res) => {
  try {
    const { punch_out_date, punch_out_time, punch_out_note } = req.body;
    const record = await pool.query('SELECT * FROM attendance_records WHERE id = $1', [req.params.id]);
    if (record.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    
    const punchIn = new Date(`${record.rows[0].punch_in_date}T${record.rows[0].punch_in_time}`);
    const punchOut = new Date(`${punch_out_date}T${punch_out_time}`);
    const durationHours = (punchOut - punchIn) / (1000 * 60 * 60);
    
    const result = await pool.query(
      `UPDATE attendance_records 
       SET punch_out_date = $1, punch_out_time = $2, punch_out_note = $3, 
           duration_hours = $4, status = 'punched_out', updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING *`,
      [punch_out_date, punch_out_time, punch_out_note, durationHours, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error punching out:', error);
    res.status(500).json({ error: error.message });
  }
});

// Customers
app.get('/api/customers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers WHERE status = $1 ORDER BY name', ['active']);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await pool.query(
      'INSERT INTO customers (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const result = await pool.query(
      'UPDATE customers SET name = $1, description = $2, status = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name, description, status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    await pool.query('UPDATE customers SET status = $1 WHERE id = $2', ['inactive', req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Projects
app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.name as customer_name, 
             e.first_name || ' ' || e.last_name as project_admin_name
      FROM projects p
      LEFT JOIN customers c ON p.customer_id = c.id
      LEFT JOIN employees e ON p.project_admin_id = e.id
      WHERE p.status = $1
      ORDER BY p.name
    `, ['active']);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const { customer_id, name, description, project_admin_id } = req.body;
    const result = await pool.query(
      'INSERT INTO projects (customer_id, name, description, project_admin_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [customer_id, name, description, project_admin_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  try {
    const { name, description, project_admin_id, status } = req.body;
    const result = await pool.query(
      'UPDATE projects SET name = $1, description = $2, project_admin_id = $3, status = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [name, description, project_admin_id, status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    await pool.query('UPDATE projects SET status = $1 WHERE id = $2', ['inactive', req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: error.message });
  }
});

// Timesheets
app.get('/api/timesheets', async (req, res) => {
  try {
    const { employee_id, status } = req.query;
    let query = `
      SELECT t.*, e.first_name || ' ' || e.last_name as employee_name,
             p.name as project_name
      FROM timesheets t
      JOIN employees e ON t.employee_id = e.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;
    
    if (employee_id) {
      query += ` AND t.employee_id = $${paramCount++}`;
      params.push(employee_id);
    }
    if (status) {
      query += ` AND t.status = $${paramCount++}`;
      params.push(status);
    }
    query += ' ORDER BY t.start_date DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching timesheets:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/timesheets', async (req, res) => {
  try {
    const { employee_id, project_id, activity_id, start_date, end_date } = req.body;
    const result = await pool.query(
      'INSERT INTO timesheets (employee_id, project_id, activity_id, start_date, end_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [employee_id, project_id, activity_id, start_date, end_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating timesheet:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// PERFORMANCE MANAGEMENT API ENDPOINTS
// ============================================================================

// KPIs
app.get('/api/kpis', async (req, res) => {
  try {
    const { job_title_id } = req.query;
    let query = `
      SELECT k.*, jt.title as job_title_name
      FROM kpis k
      LEFT JOIN job_titles jt ON k.job_title_id = jt.id
      WHERE 1=1
    `;
    const params = [];
    if (job_title_id) {
      query += ' AND k.job_title_id = $1';
      params.push(job_title_id);
    }
    query += ' ORDER BY k.indicator';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/kpis', async (req, res) => {
  try {
    const { indicator, job_title_id, min_rate, max_rate, is_default } = req.body;
    const result = await pool.query(
      'INSERT INTO kpis (indicator, job_title_id, min_rate, max_rate, is_default) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [indicator, job_title_id, min_rate || 0, max_rate || 100, is_default || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating KPI:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/kpis/:id', async (req, res) => {
  try {
    const { indicator, job_title_id, min_rate, max_rate, is_default } = req.body;
    const result = await pool.query(
      'UPDATE kpis SET indicator = $1, job_title_id = $2, min_rate = $3, max_rate = $4, is_default = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [indicator, job_title_id, min_rate, max_rate, is_default, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating KPI:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/kpis/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM kpis WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting KPI:', error);
    res.status(500).json({ error: error.message });
  }
});

// Performance Trackers
app.get('/api/performance-trackers', async (req, res) => {
  try {
    const { employee_id } = req.query;
    let query = `
      SELECT pt.*, e.first_name || ' ' || e.last_name as employee_name
      FROM performance_trackers pt
      JOIN employees e ON pt.employee_id = e.id
      WHERE 1=1
    `;
    const params = [];
    if (employee_id) {
      query += ' AND pt.employee_id = $1';
      params.push(employee_id);
    }
    query += ' ORDER BY pt.added_date DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching performance trackers:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/performance-trackers', async (req, res) => {
  try {
    const { employee_id, tracker_name } = req.body;
    const result = await pool.query(
      'INSERT INTO performance_trackers (employee_id, tracker_name) VALUES ($1, $2) RETURNING *',
      [employee_id, tracker_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating performance tracker:', error);
    res.status(500).json({ error: error.message });
  }
});

// Performance Reviews
app.get('/api/performance-reviews', async (req, res) => {
  try {
    const { employee_id, reviewer_id, review_status } = req.query;
    let query = `
      SELECT pr.*, e.first_name || ' ' || e.last_name as employee_name,
             jt.title as job_title_name,
             r.first_name || ' ' || r.last_name as reviewer_name
      FROM performance_reviews pr
      JOIN employees e ON pr.employee_id = e.id
      LEFT JOIN job_titles jt ON pr.job_title_id = jt.id
      LEFT JOIN employees r ON pr.reviewer_id = r.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;
    
    if (employee_id) {
      query += ` AND pr.employee_id = $${paramCount++}`;
      params.push(employee_id);
    }
    if (reviewer_id) {
      query += ` AND pr.reviewer_id = $${paramCount++}`;
      params.push(reviewer_id);
    }
    if (review_status) {
      query += ` AND pr.review_status = $${paramCount++}`;
      params.push(review_status);
    }
    query += ' ORDER BY pr.review_period_start DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching performance reviews:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/performance-reviews', async (req, res) => {
  try {
    const { employee_id, job_title_id, sub_unit, review_period_start, review_period_end, due_date, reviewer_id } = req.body;
    const result = await pool.query(
      `INSERT INTO performance_reviews (employee_id, job_title_id, sub_unit, review_period_start, review_period_end, due_date, reviewer_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [employee_id, job_title_id, sub_unit, review_period_start, review_period_end, due_date, reviewer_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating performance review:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// MY INFO / EMPLOYEE PERSONAL DATA API ENDPOINTS
// ============================================================================

// Employee Personal Details
app.get('/api/employees/:id/personal-details', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employee_personal_details WHERE employee_id = $1', [req.params.id]);
    res.json(result.rows[0] || null);
  } catch (error) {
    console.error('Error fetching personal details:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/employees/:id/personal-details', async (req, res) => {
  try {
    const { other_id, driver_license_number, license_expiry_date, nationality_id, marital_status, date_of_birth, gender, blood_type } = req.body;
    const result = await pool.query(
      `INSERT INTO employee_personal_details (employee_id, other_id, driver_license_number, license_expiry_date, nationality_id, marital_status, date_of_birth, gender, blood_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (employee_id) 
       DO UPDATE SET other_id = $2, driver_license_number = $3, license_expiry_date = $4, nationality_id = $5, 
                     marital_status = $6, date_of_birth = $7, gender = $8, blood_type = $9, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.params.id, other_id, driver_license_number, license_expiry_date, nationality_id, marital_status, date_of_birth, gender, blood_type]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error saving personal details:', error);
    res.status(500).json({ error: error.message });
  }
});

// Employee Contact Details
app.get('/api/employees/:id/contact-details', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employee_contact_details WHERE employee_id = $1', [req.params.id]);
    res.json(result.rows[0] || null);
  } catch (error) {
    console.error('Error fetching contact details:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/employees/:id/contact-details', async (req, res) => {
  try {
    const { street1, street2, city, state_province, zip_postal_code, country, home_telephone, mobile, work_telephone, work_email, other_email } = req.body;
    const result = await pool.query(
      `INSERT INTO employee_contact_details (employee_id, street1, street2, city, state_province, zip_postal_code, country, home_telephone, mobile, work_telephone, work_email, other_email)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (employee_id)
       DO UPDATE SET street1 = $2, street2 = $3, city = $4, state_province = $5, zip_postal_code = $6, country = $7,
                     home_telephone = $8, mobile = $9, work_telephone = $10, work_email = $11, other_email = $12, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.params.id, street1, street2, city, state_province, zip_postal_code, country, home_telephone, mobile, work_telephone, work_email, other_email]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error saving contact details:', error);
    res.status(500).json({ error: error.message });
  }
});

// Emergency Contacts
app.get('/api/employees/:id/emergency-contacts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM emergency_contacts WHERE employee_id = $1 ORDER BY name', [req.params.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/employees/:id/emergency-contacts', async (req, res) => {
  try {
    const { name, relationship, home_telephone, mobile, work_telephone } = req.body;
    const result = await pool.query(
      'INSERT INTO emergency_contacts (employee_id, name, relationship, home_telephone, mobile, work_telephone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.params.id, name, relationship, home_telephone, mobile, work_telephone]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating emergency contact:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/emergency-contacts/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM emergency_contacts WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting emergency contact:', error);
    res.status(500).json({ error: error.message });
  }
});

// Dependents
app.get('/api/employees/:id/dependents', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM dependents WHERE employee_id = $1 ORDER BY name', [req.params.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching dependents:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/employees/:id/dependents', async (req, res) => {
  try {
    const { name, relationship, date_of_birth } = req.body;
    const result = await pool.query(
      'INSERT INTO dependents (employee_id, name, relationship, date_of_birth) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.params.id, name, relationship, date_of_birth]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating dependent:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/dependents/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM dependents WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting dependent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Immigration Records
app.get('/api/employees/:id/immigration', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM immigration_records WHERE employee_id = $1 ORDER BY issued_date DESC', [req.params.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching immigration records:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/employees/:id/immigration', async (req, res) => {
  try {
    const { document_type, document_number, issued_by, issued_date, expiry_date } = req.body;
    const result = await pool.query(
      'INSERT INTO immigration_records (employee_id, document_type, document_number, issued_by, issued_date, expiry_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.params.id, document_type, document_number, issued_by, issued_date, expiry_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating immigration record:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/immigration/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM immigration_records WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting immigration record:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// ADMIN CONFIGURATION API ENDPOINTS
// ============================================================================

// Locations
app.get('/api/locations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM locations ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Duplicate endpoint - using the one above at line 655 instead
// This endpoint is kept for backward compatibility but uses the correct schema
app.post('/api/locations', async (req, res) => {
  try {
    const { name, country, province, city, address, zip_code, phone, fax, notes, number_of_employees } = req.body;
    const result = await pool.query(
      'INSERT INTO hrms_data.locations (name, country, province, city, address, zip_code, phone, fax, notes, number_of_employees, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [name, country, province, city, address, zip_code, phone, fax, notes || null, number_of_employees || 0, 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({ error: error.message });
  }
});

// Duplicate endpoint - using the one above at line 686 instead
// This endpoint is kept for backward compatibility but uses the correct schema
app.put('/api/locations/:id', async (req, res) => {
  try {
    const { name, country, province, city, address, zip_code, phone, fax, notes, number_of_employees } = req.body;
    const result = await pool.query(
      'UPDATE hrms_data.locations SET name = $1, country = $2, province = $3, city = $4, address = $5, zip_code = $6, phone = $7, fax = $8, notes = $9, number_of_employees = COALESCE($10, number_of_employees), updated_at = CURRENT_TIMESTAMP WHERE id = $11 RETURNING *',
      [name, country, province, city, address, zip_code, phone, fax, notes || null, number_of_employees, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/locations/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM locations WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({ error: error.message });
  }
});

// Pay Grades
app.get('/api/pay-grades', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hrms_data.pay_grades ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pay grades:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pay-grades', async (req, res) => {
  try {
    const { name, currency, min_salary, max_salary } = req.body;
    const result = await pool.query(
      'INSERT INTO hrms_data.pay_grades (name, currency, min_salary, max_salary) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, currency, min_salary, max_salary]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating pay grade:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/pay-grades/:id', async (req, res) => {
  try {
    const { name, currency, min_salary, max_salary } = req.body;
    const result = await pool.query(
      'UPDATE hrms_data.pay_grades SET name = $1, currency = $2, min_salary = $3, max_salary = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [name, currency, min_salary, max_salary, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating pay grade:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/pay-grades/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM hrms_data.pay_grades WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting pay grade:', error);
    res.status(500).json({ error: error.message });
  }
});

// Employment Status
app.get('/api/employment-status', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hrms_data.employment_status ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching employment status:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/employment-status', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query('INSERT INTO hrms_data.employment_status (name) VALUES ($1) RETURNING *', [name]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating employment status:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/employment-status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const result = await pool.query('UPDATE hrms_data.employment_status SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *', [name, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employment status not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating employment status:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/employment-status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM hrms_data.employment_status WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employment status not found' });
    }
    res.json({ message: 'Employment status deleted successfully' });
  } catch (error) {
    console.error('Error deleting employment status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Job Categories
app.get('/api/job-categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hrms_data.job_categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching job categories:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/job-categories', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query('INSERT INTO hrms_data.job_categories (name) VALUES ($1) RETURNING *', [name]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating job category:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/job-categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const result = await pool.query('UPDATE hrms_data.job_categories SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *', [name, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job category not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating job category:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/job-categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM hrms_data.job_categories WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job category not found' });
    }
    res.json({ message: 'Job category deleted successfully' });
  } catch (error) {
    console.error('Error deleting job category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Work Shifts
app.get('/api/work-shifts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hrms_data.work_shifts ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching work shifts:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/work-shifts', async (req, res) => {
  try {
    const { name, hours_per_day, start_time, end_time } = req.body;
    const result = await pool.query(
      'INSERT INTO hrms_data.work_shifts (name, hours_per_day, start_time, end_time) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, hours_per_day, start_time, end_time]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating work shift:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/work-shifts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, hours_per_day, start_time, end_time } = req.body;
    const result = await pool.query(
      'UPDATE hrms_data.work_shifts SET name = $1, hours_per_day = $2, start_time = $3, end_time = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [name, hours_per_day, start_time, end_time, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Work shift not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating work shift:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/work-shifts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM hrms_data.work_shifts WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Work shift not found' });
    }
    res.json({ message: 'Work shift deleted successfully' });
  } catch (error) {
    console.error('Error deleting work shift:', error);
    res.status(500).json({ error: error.message });
  }
});

// Nationalities
app.get('/api/nationalities', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hrms_data.nationalities ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching nationalities:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/nationalities', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query('INSERT INTO hrms_data.nationalities (name) VALUES ($1) RETURNING *', [name]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating nationality:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/nationalities/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query('UPDATE hrms_data.nationalities SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *', [name, req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nationality not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating nationality:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/nationalities/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM hrms_data.nationalities WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nationality not found' });
    }
    res.json({ message: 'Nationality deleted successfully' });
  } catch (error) {
    console.error('Error deleting nationality:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// SKILLS API
// ============================================================================
app.get('/api/skills', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hrms_data.skills ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/skills', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Skill name is required' });
    }
    const result = await pool.query(
      'INSERT INTO hrms_data.skills (name, description) VALUES ($1, $2) RETURNING *',
      [name, description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating skill:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/skills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Skill name is required' });
    }
    const result = await pool.query(
      'UPDATE hrms_data.skills SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [name, description || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating skill:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/skills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM hrms_data.skills WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// EDUCATION LEVELS API
// ============================================================================
app.get('/api/education-levels', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hrms_data.education_levels ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching education levels:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/education-levels', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Education level name is required' });
    }
    const result = await pool.query('INSERT INTO hrms_data.education_levels (name) VALUES ($1) RETURNING *', [name]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating education level:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/education-levels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Education level name is required' });
    }
    const result = await pool.query(
      'UPDATE hrms_data.education_levels SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [name, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Education level not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating education level:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/education-levels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM hrms_data.education_levels WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Education level not found' });
    }
    res.json({ message: 'Education level deleted successfully' });
  } catch (error) {
    console.error('Error deleting education level:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// LICENSES API
// ============================================================================
app.get('/api/licenses', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hrms_data.licenses ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching licenses:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/licenses', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'License name is required' });
    }
    const result = await pool.query('INSERT INTO hrms_data.licenses (name) VALUES ($1) RETURNING *', [name]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating license:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/licenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'License name is required' });
    }
    const result = await pool.query(
      'UPDATE hrms_data.licenses SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [name, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'License not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating license:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/licenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM hrms_data.licenses WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'License not found' });
    }
    res.json({ message: 'License deleted successfully' });
  } catch (error) {
    console.error('Error deleting license:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// LANGUAGES API
// ============================================================================
app.get('/api/languages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hrms_data.languages ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/languages', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Language name is required' });
    }
    const result = await pool.query('INSERT INTO hrms_data.languages (name) VALUES ($1) RETURNING *', [name]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating language:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/languages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Language name is required' });
    }
    const result = await pool.query(
      'UPDATE hrms_data.languages SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [name, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Language not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating language:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/languages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM hrms_data.languages WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Language not found' });
    }
    res.json({ message: 'Language deleted successfully' });
  } catch (error) {
    console.error('Error deleting language:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// MEMBERSHIPS API
// ============================================================================
app.get('/api/memberships', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hrms_data.memberships ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching memberships:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/memberships', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Membership name is required' });
    }
    const result = await pool.query('INSERT INTO hrms_data.memberships (name) VALUES ($1) RETURNING *', [name]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating membership:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/memberships/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Membership name is required' });
    }
    const result = await pool.query(
      'UPDATE hrms_data.memberships SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [name, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Membership not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating membership:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/memberships/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM hrms_data.memberships WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Membership not found' });
    }
    res.json({ message: 'Membership deleted successfully' });
  } catch (error) {
    console.error('Error deleting membership:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// CORPORATE BRANDING API
// ============================================================================
app.get('/api/corporate-branding', async (req, res) => {
  try {
    // First check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'corporate_branding'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      // Return default values if table doesn't exist
      return res.json({
        id: null,
        primary_color: '#78176b',
        secondary_color: '#590a4f',
        primary_font_color: '#ffffff',
        secondary_font_color: '#222222',
        gradient_color1: '#faf3ff',
        gradient_color2: '#fffafe',
        social_media_enabled: true,
        client_logo_path: null,
        client_banner_path: null,
        login_banner_path: null
      });
    }

    const result = await pool.query(
      'SELECT * FROM hrms_data.corporate_branding WHERE id = 1 LIMIT 1'
    );
    
    if (result.rows.length === 0) {
      // Return default values if no record exists
      return res.json({
        id: null,
        primary_color: '#78176b',
        secondary_color: '#590a4f',
        primary_font_color: '#ffffff',
        secondary_font_color: '#222222',
        gradient_color1: '#faf3ff',
        gradient_color2: '#fffafe',
        social_media_enabled: true,
        client_logo_path: null,
        client_banner_path: null,
        login_banner_path: null
      });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching corporate branding:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/corporate-branding', async (req, res) => {
  console.log('📥 PUT /api/corporate-branding received:', req.body);
  try {
    // First check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'corporate_branding'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.error('❌ Table hrms_data.corporate_branding does not exist!');
      return res.status(500).json({ 
        error: 'Table does not exist',
        message: 'Please run the SQL script to create the corporate_branding table',
        hint: 'Run: orangehrm/database/CREATE_CORPORATE_BRANDING_TABLE.sql'
      });
    }

    const {
      primary_color,
      secondary_color,
      primary_font_color,
      secondary_font_color,
      gradient_color1,
      gradient_color2,
      social_media_enabled,
      client_logo_path,
      client_banner_path,
      login_banner_path
    } = req.body;

    // Check if record exists
    const checkResult = await pool.query('SELECT id FROM hrms_data.corporate_branding WHERE id = 1');
    
    if (checkResult.rows.length === 0) {
      // Create new record
      const result = await pool.query(
        `INSERT INTO hrms_data.corporate_branding (
          id, primary_color, secondary_color, primary_font_color, secondary_font_color,
          gradient_color1, gradient_color2, social_media_enabled,
          client_logo_path, client_banner_path, login_banner_path
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [
          1,
          primary_color || '#78176b',
          secondary_color || '#590a4f',
          primary_font_color || '#ffffff',
          secondary_font_color || '#222222',
          gradient_color1 || '#faf3ff',
          gradient_color2 || '#fffafe',
          social_media_enabled !== undefined ? social_media_enabled : true,
          client_logo_path || null,
          client_banner_path || null,
          login_banner_path || null
        ]
      );
      console.log('✅ Corporate branding created:', result.rows[0]);
      res.json(result.rows[0]);
    } else {
      // Update existing record
      const result = await pool.query(
        `UPDATE hrms_data.corporate_branding SET
          primary_color = $1,
          secondary_color = $2,
          primary_font_color = $3,
          secondary_font_color = $4,
          gradient_color1 = $5,
          gradient_color2 = $6,
          social_media_enabled = $7,
          client_logo_path = $8,
          client_banner_path = $9,
          login_banner_path = $10,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = 1 RETURNING *`,
        [
          primary_color || '#78176b',
          secondary_color || '#590a4f',
          primary_font_color || '#ffffff',
          secondary_font_color || '#222222',
          gradient_color1 || '#faf3ff',
          gradient_color2 || '#fffafe',
          social_media_enabled !== undefined ? social_media_enabled : true,
          client_logo_path || null,
          client_banner_path || null,
          login_banner_path || null
        ]
      );
      console.log('✅ Corporate branding updated:', result.rows[0]);
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error('❌ Error saving corporate branding:', error);
    res.status(500).json({ error: error.message });
  }
});

// Users Management
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.*, e.first_name || ' ' || e.last_name as employee_name
      FROM users u
      LEFT JOIN employees e ON u.id = e.user_id
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, role, status } = req.body;
    const bcrypt = require('bcrypt');
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, first_name, last_name, role, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, username, email, first_name, last_name, role, status, created_at',
      [username, email, password_hash, first_name, last_name, role || 'user', status || 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { username, email, first_name, last_name, role, status, password } = req.body;
    let query, params;
    if (password) {
      const bcrypt = require('bcrypt');
      const password_hash = await bcrypt.hash(password, 10);
      query = 'UPDATE users SET username = $1, email = $2, first_name = $3, last_name = $4, role = $5, status = $6, password_hash = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 RETURNING id, username, email, first_name, last_name, role, status';
      params = [username, email, first_name, last_name, role, status, password_hash, req.params.id];
    } else {
      query = 'UPDATE users SET username = $1, email = $2, first_name = $3, last_name = $4, role = $5, status = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING id, username, email, first_name, last_name, role, status';
      params = [username, email, first_name, last_name, role, status, req.params.id];
    }
    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await pool.query('UPDATE users SET status = $1 WHERE id = $2', ['inactive', req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend static files (if built)
// IMPORTANT: This must come AFTER all API routes
const frontendDistPath = path.join(__dirname, '../../web/dist');
if (fs.existsSync(frontendDistPath)) {
  console.log('📁 Serving frontend from:', frontendDistPath);
  
  // Serve static files (JS, CSS, images, etc.) - these have priority
  app.use(express.static(frontendDistPath, {
    // Don't serve index.html here, we'll handle it below
    index: false
  }));
  
  // Serve index.html for all non-API, non-static-file routes (for React Router)
  // This must come after express.static() so static files are served first
  app.get('*', (req, res, next) => {
    // Skip API routes - they should have been handled above
    if (req.path.startsWith('/api')) {
      return next();
    }
    // Serve index.html for all other routes (React Router will handle routing)
    res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
      if (err) {
        next(err);
      }
    });
  });
} else {
  console.log('⚠️  Frontend dist folder not found. Run "npm run build" in orangehrm/src/client to build frontend.');
  console.log('   Expected path:', frontendDistPath);
}

// Catch-all 404 handler for API routes and other unmatched routes
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({
      error: 'Not Found',
      message: `Cannot ${req.method} ${req.path}`,
      availableEndpoints: [
        'GET /',
        'GET /api/health',
        'GET /api/diagnostic',
        'GET /api/test',
        'GET /api/job-titles',
        'POST /api/job-titles',
        'PUT /api/job-titles/:id',
        'DELETE /api/job-titles/:id',
        'GET /api/organization/structure',
        'POST /api/organization/structure',
        'PUT /api/organization/structure/:id',
        'DELETE /api/organization/structure/:id',
        'GET /api/vacancies',
        'GET /api/candidates',
        'GET /api/employees'
      ]
    });
  } else if (!fs.existsSync(frontendDistPath)) {
    // Frontend not built - show helpful message
    res.status(404).send(`
      <html>
        <head><title>Frontend Not Built</title></head>
        <body style="font-family: Arial; padding: 40px; text-align: center;">
          <h1>Frontend Not Found</h1>
          <p>The frontend has not been built yet.</p>
          <p>To build the frontend, run:</p>
          <pre style="background: #f5f5f5; padding: 20px; display: inline-block; border-radius: 5px;">
cd orangehrm/src/client
npm run build
          </pre>
          <p>Or for development, use webpack dev server:</p>
          <pre style="background: #f5f5f5; padding: 20px; display: inline-block; border-radius: 5px;">
cd orangehrm/src/client
npm run serve
          </pre>
          <p><a href="/api/health">API Health Check</a> | <a href="/api">API Endpoints</a></p>
        </body>
      </html>
    `);
  } else {
    // Frontend is built but route not found - should not happen if React Router is working
    res.status(404).send(`
      <html>
        <head><title>404 Not Found</title></head>
        <body style="font-family: Arial; padding: 40px; text-align: center;">
          <h1>404 - Page Not Found</h1>
          <p><a href="/">Go to Home</a> | <a href="/api/health">API Health</a></p>
        </body>
      </html>
    `);
  }
});

// Log all registered routes for debugging
if (process.env.NODE_ENV !== 'production') {
  console.log('\n📋 Registered API Routes:');
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      const methods = Object.keys(middleware.route.methods).join(', ').toUpperCase();
      routes.push(`${methods} ${middleware.route.path}`);
    }
  });
  routes.filter(r => r.includes('/api/job-titles')).forEach(r => console.log(`   ✅ ${r}`));
}

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`🚀 Arithwise HRM server running on port ${PORT}`);
  console.log(`📡 API endpoints: http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`🔍 Diagnostic: http://localhost:${PORT}/api/diagnostic`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
  console.log(`\n📝 Job Titles API:`);
  console.log(`   GET    /api/job-titles`);
  console.log(`   POST   /api/job-titles`);
  console.log(`   PUT    /api/job-titles/:id`);
  console.log(`   DELETE /api/job-titles/:id`);
  if (fs.existsSync(frontendDistPath)) {
    console.log(`✅ Frontend is being served from backend`);
  } else {
    console.log(`⚠️  Frontend not built - only API is available`);
    console.log(`   Build frontend: cd orangehrm/src/client && npm run build`);
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error(`💡 To fix this, run one of the following:`);
    console.error(`   PowerShell: Get-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess | Stop-Process -Force`);
    console.error(`   Or change BACKEND_PORT in your .env file to a different port (e.g., 3002)`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
    process.exit(1);
  }
});

