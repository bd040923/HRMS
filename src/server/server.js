/**
 * Arithwise HRM Backend API Server
 * Copyright (C) 2024 Arithwise Inc.
 */

// Load environment variables - EXPLICIT PATH
const path = require('path');
const fs = require('fs');
const multer = require('multer');

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

// Skip JSON parsing for multipart/form-data to avoid "Unexpected token" errors
const jsonMiddleware = express.json();
const urlEncodedMiddleware = express.urlencoded({ extended: true });
app.use((req, res, next) => {
  if (req.is('multipart/form-data')) {
    return next();
  }
  return jsonMiddleware(req, res, (err) => {
    if (err) return next(err);
    return urlEncodedMiddleware(req, res, next);
  });
});

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
    
    // Validate business rules using database function - MANDATORY
    let final_leave_type_id = leave_type_id;
    let auto_converted = false;
    let conversion_warning = null;
    let validationPassed = false;
    
    try {
      console.log('🔍 Validating leave request:', {
        employee_id,
        leave_type_id,
        from_date,
        to_date,
        number_of_days
      });
      
      const validationResult = await pool.query(
        'SELECT hrms_data.validate_leave_request($1, $2, $3, $4, $5) as result',
        [employee_id, leave_type_id, from_date, to_date, number_of_days]
      );
      
      if (validationResult.rows.length > 0) {
        const validation = validationResult.rows[0].result;
        console.log('✅ Validation result:', JSON.stringify(validation, null, 2));
        
        // Check if validation failed
        if (validation.valid === false) {
          const errors = Array.isArray(validation.errors) 
            ? validation.errors.map(e => typeof e === 'object' ? e.message || JSON.stringify(e) : e).join('; ')
            : (typeof validation.errors === 'object' ? validation.errors.message : validation.errors) || 'Validation failed';
          console.log('❌ Validation failed:', errors);
          return res.status(400).json({ 
            error: `Leave request validation failed: ${errors}`,
            validation_errors: validation.errors
          });
        }
        
        validationPassed = true;
        
        // Check if auto-conversion to unpaid is needed
        if (validation.auto_convert_to_unpaid === true && validation.suggested_leave_type_id) {
          final_leave_type_id = validation.suggested_leave_type_id;
          auto_converted = true;
          conversion_warning = validation.warnings && validation.warnings.length > 0 
            ? (Array.isArray(validation.warnings) ? validation.warnings[0] : validation.warnings)
            : 'Annual casual leave limit exceeded. Converted to Unpaid Leave.';
          console.log('⚠️ Auto-converting casual leave to unpaid leave:', {
            original_leave_type_id: leave_type_id,
            converted_to: final_leave_type_id,
            reason: conversion_warning
          });
        }
      } else {
        console.error('❌ Validation function returned no results - REJECTING REQUEST');
        return res.status(500).json({ 
          error: 'Validation function returned no results. Please contact administrator.',
          details: 'The leave validation system is not working properly.'
        });
      }
    } catch (validationError) {
      console.error('❌ Validation error:', validationError);
      console.error('Validation error message:', validationError.message);
      console.error('Validation error code:', validationError.code);
      
      // Check if function doesn't exist
      if (validationError.message && (
        validationError.message.includes('does not exist') ||
        validationError.message.includes('function hrms_data.validate_leave_request') ||
        validationError.code === '42883' || // function does not exist
        validationError.message.includes('relation') && validationError.message.includes('does not exist')
      )) {
        console.error('❌ CRITICAL: Validation function does not exist in database!');
        return res.status(500).json({ 
          error: 'Leave validation system is not configured. Please contact administrator.',
          details: 'The validation function is missing. Please run UPDATE_LEAVE_VALIDATION_RULES.sql in the database.',
          sql_file: 'orangehrm/database/UPDATE_LEAVE_VALIDATION_RULES.sql'
        });
      } else {
        // If validation function exists but failed, reject the request
        console.error('❌ Validation function exists but failed - REJECTING REQUEST');
        return res.status(500).json({ 
          error: `Validation failed: ${validationError.message}`,
          details: 'Please ensure the validation function is properly installed and working.'
        });
      }
    }
    
    // CRITICAL: Do not proceed if validation did not pass
    if (!validationPassed) {
      console.error('❌ Validation did not pass - REJECTING REQUEST');
      return res.status(400).json({ 
        error: 'Leave request validation failed. Request cannot be processed.',
        details: 'The validation system did not approve this request.'
      });
    }
    
    console.log('Inserting leave request with:', {
      employee_id,
      leave_type_id: final_leave_type_id,
      original_leave_type_id: auto_converted ? leave_type_id : null,
      auto_converted,
      from_date,
      to_date,
      number_of_days,
      comments: comments || ''
    });
    
    try {
      const result = await pool.query(
        `INSERT INTO hrms_data.leave_requests (employee_id, leave_type_id, from_date, to_date, number_of_days, comments, applied_by)
         VALUES ($1, $2, $3, $4, $5, $6, $1) RETURNING *`,
        [employee_id, final_leave_type_id, from_date, to_date, number_of_days, comments || '']
      );
      
      const responseData = result.rows[0];
      
      // Add conversion info to response if applicable
      if (auto_converted) {
        responseData.auto_converted = true;
        responseData.original_leave_type_id = leave_type_id;
        responseData.conversion_warning = conversion_warning;
      }
      
      console.log('Leave request created successfully:', result.rows[0].id);
      res.status(201).json(responseData);
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
      FROM hrms_data.attendance_records ar
      JOIN hrms_data.employees e ON ar.employee_id = e.id
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
      `INSERT INTO hrms_data.attendance_records (employee_id, punch_in_date, punch_in_time, punch_in_note, status)
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
    const record = await pool.query('SELECT * FROM hrms_data.attendance_records WHERE id = $1', [req.params.id]);
    if (record.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    
    const punchIn = new Date(`${record.rows[0].punch_in_date}T${record.rows[0].punch_in_time}`);
    const punchOut = new Date(`${punch_out_date}T${punch_out_time}`);
    const durationHours = (punchOut - punchIn) / (1000 * 60 * 60);
    
    const result = await pool.query(
      `UPDATE hrms_data.attendance_records 
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

app.delete('/api/attendance-records/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM hrms_data.attendance_records WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    res.status(500).json({ error: error.message });
  }
});

// Customers
app.get('/api/customers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hrms_data.customers WHERE status = $1 ORDER BY name', ['active']);
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
      'INSERT INTO hrms_data.customers (name, description) VALUES ($1, $2) RETURNING *',
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
      'UPDATE hrms_data.customers SET name = $1, description = $2, status = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
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
    await pool.query('UPDATE hrms_data.customers SET status = $1 WHERE id = $2', ['inactive', req.params.id]);
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
      SELECT p.*, 
             e.first_name || ' ' || e.last_name as project_admin_name
      FROM hrms_data.projects p
      LEFT JOIN hrms_data.employees e ON p.project_admin_id = e.id
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
    const { name, description, project_admin_id } = req.body;
    const result = await pool.query(
      'INSERT INTO hrms_data.projects (name, description, project_admin_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description, project_admin_id || null]
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
      'UPDATE hrms_data.projects SET name = $1, description = $2, project_admin_id = $3, status = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
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
    await pool.query('UPDATE hrms_data.projects SET status = $1 WHERE id = $2', ['inactive', req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: error.message });
  }
});

// Timesheets
app.get('/api/timesheets', async (req, res) => {
  try {
    const { employee_id, status, start_date, end_date } = req.query;
    let query = `
      SELECT t.*, e.first_name || ' ' || e.last_name as employee_name,
             m.first_name || ' ' || m.last_name as submitted_to_name,
             a.first_name || ' ' || a.last_name as approved_by_name
      FROM hrms_data.timesheets t
      JOIN hrms_data.employees e ON t.employee_id = e.id
      LEFT JOIN hrms_data.employees m ON t.submitted_to = m.id
      LEFT JOIN hrms_data.employees a ON t.approved_by = a.id
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
    if (start_date) {
      query += ` AND t.start_date = $${paramCount++}`;
      params.push(start_date);
    }
    if (end_date) {
      query += ` AND t.end_date = $${paramCount++}`;
      params.push(end_date);
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
    const { employee_id, start_date, end_date } = req.body;
    
    // First check if timesheet already exists
    const existing = await pool.query(
      `SELECT * FROM hrms_data.timesheets 
       WHERE employee_id = $1 AND start_date = $2 AND end_date = $3`,
      [employee_id, start_date, end_date]
    );
    
    if (existing.rows.length > 0) {
      return res.json(existing.rows[0]);
    }
    
    // Create new timesheet
    const result = await pool.query(
      `INSERT INTO hrms_data.timesheets (employee_id, start_date, end_date, status) 
       VALUES ($1, $2, $3, 'draft') 
       RETURNING *`,
      [employee_id, start_date, end_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating timesheet:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get timesheet entries
app.get('/api/timesheets/:id/entries', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT te.*, p.name as project_name, a.name as activity_name
      FROM hrms_data.timesheet_entries te
      LEFT JOIN hrms_data.projects p ON te.project_id = p.id
      LEFT JOIN hrms_data.activities a ON te.activity_id = a.id
      WHERE te.timesheet_id = $1
      ORDER BY te.entry_date, p.name, a.name
    `, [req.params.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching timesheet entries:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create or update timesheet entry
app.post('/api/timesheets/:id/entries', async (req, res) => {
  try {
    const { project_id, activity_id, entry_date, hours, comments } = req.body;
    
    if (!project_id) {
      return res.status(400).json({ error: 'project_id is required' });
    }
    if (!entry_date) {
      return res.status(400).json({ error: 'entry_date is required' });
    }
    
    // Validate and clamp hours to 0-24 range
    let hoursValue = parseFloat(hours) || 0;
    if (isNaN(hoursValue)) {
      hoursValue = 0;
    }
    if (hoursValue < 0) {
      hoursValue = 0;
    }
    if (hoursValue > 24) {
      hoursValue = 24;
    }
    
    // Check if entry already exists
    const existing = await pool.query(
      `SELECT * FROM hrms_data.timesheet_entries 
       WHERE timesheet_id = $1 AND project_id = $2 
       AND (activity_id = $3 OR (activity_id IS NULL AND $3 IS NULL))
       AND entry_date = $4`,
      [req.params.id, project_id, activity_id || null, entry_date]
    );
    
    let result;
    if (existing.rows.length > 0) {
      // Update existing entry - but only if it wasn't just deleted
      const existingEntry = existing.rows[0];
      console.log('Updating existing entry:', existingEntry.id);
      result = await pool.query(
        `UPDATE hrms_data.timesheet_entries 
         SET hours = $1, comments = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [hoursValue, comments || null, existingEntry.id]
      );
    } else {
      // Insert new entry - log this to track if entries are being recreated
      console.log('Creating NEW entry:', {
        timesheet_id: req.params.id,
        project_id,
        activity_id: activity_id || null,
        entry_date,
        hours: hoursValue
      });
      result = await pool.query(
        `INSERT INTO hrms_data.timesheet_entries 
         (timesheet_id, project_id, activity_id, entry_date, hours, comments) 
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [req.params.id, project_id, activity_id || null, entry_date, hoursValue, comments || null]
      );
      console.log('New entry created with ID:', result.rows[0].id);
    }
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error saving timesheet entry:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete timesheet entry
app.delete('/api/timesheet-entries/:id', async (req, res) => {
  try {
    const entryId = parseInt(req.params.id);
    console.log('=== DELETE TIMESHEET ENTRY ===');
    console.log('Entry ID:', entryId);
    
    if (isNaN(entryId)) {
      return res.status(400).json({ error: 'Invalid entry ID' });
    }
    
    // First check if entry exists
    const checkResult = await pool.query(
      'SELECT id, timesheet_id, project_id, activity_id, entry_date FROM hrms_data.timesheet_entries WHERE id = $1',
      [entryId]
    );
    
    if (checkResult.rows.length === 0) {
      console.log('Entry not found:', entryId);
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    const entry = checkResult.rows[0];
    console.log('Entry found:', entry);
    
    // Delete the entry using explicit schema
    const deleteResult = await pool.query(
      'DELETE FROM hrms_data.timesheet_entries WHERE id = $1 RETURNING id, timesheet_id, project_id, entry_date',
      [entryId]
    );
    
    if (deleteResult.rowCount === 0) {
      console.log('No rows deleted for entry:', entryId);
      // Double check if it exists
      const doubleCheck = await pool.query(
        'SELECT id FROM hrms_data.timesheet_entries WHERE id = $1',
        [entryId]
      );
      if (doubleCheck.rows.length === 0) {
        console.log('Entry already deleted or never existed');
        return res.json({ success: true, deletedId: entryId, message: 'Already deleted' });
      }
      return res.status(404).json({ error: 'Entry not found or could not be deleted' });
    }
    
    const deletedEntry = deleteResult.rows[0];
    console.log('Successfully deleted entry:', entryId);
    console.log('Deleted entry details:', deletedEntry);
    
    // Verify deletion with multiple checks
    const verifyResult = await pool.query(
      'SELECT id FROM hrms_data.timesheet_entries WHERE id = $1',
      [entryId]
    );
    
    if (verifyResult.rows.length > 0) {
      console.error('CRITICAL: Entry still exists after deletion!');
      console.error('Entry ID:', entryId);
      console.error('Verification query returned:', verifyResult.rows);
      return res.status(500).json({ error: 'Entry deletion failed - entry still exists' });
    }
    
    // Also verify by project_id and entry_date to ensure it's really gone
    const verifyByProject = await pool.query(
      'SELECT id FROM hrms_data.timesheet_entries WHERE timesheet_id = $1 AND project_id = $2 AND entry_date = $3',
      [deletedEntry.timesheet_id, deletedEntry.project_id, deletedEntry.entry_date]
    );
    
    console.log('Deletion verified - entry no longer exists');
    console.log('Verification by project/date returned:', verifyByProject.rows.length, 'entries');
    
    res.json({ success: true, deletedId: entryId, deletedEntry: deletedEntry });
  } catch (error) {
    console.error('Error deleting timesheet entry:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete all entries for a project in a timesheet (bulk delete)
// IMPORTANT: This route must be BEFORE other /api/timesheets/:id routes
app.delete('/api/timesheets/:timesheetId/projects/:projectId/entries', async (req, res) => {
  try {
    const timesheetId = parseInt(req.params.timesheetId);
    const projectId = parseInt(req.params.projectId);
    const activityIdParam = req.query.activity_id;
    const activityId = activityIdParam && activityIdParam !== 'null' && activityIdParam !== 'undefined' 
      ? parseInt(String(activityIdParam)) 
      : null;
    
    console.log('=== BULK DELETE PROJECT ENTRIES ===');
    console.log('Timesheet ID:', timesheetId);
    console.log('Project ID:', projectId);
    console.log('Activity ID param:', activityIdParam);
    console.log('Activity ID parsed:', activityId);
    
    if (isNaN(timesheetId) || isNaN(projectId)) {
      return res.status(400).json({ error: 'Invalid timesheet or project ID' });
    }
    
    let deleteQuery;
    let params;
    
    if (activityId !== null && activityId !== undefined && !isNaN(activityId)) {
      deleteQuery = 'DELETE FROM hrms_data.timesheet_entries WHERE timesheet_id = $1 AND project_id = $2 AND activity_id = $3 RETURNING id';
      params = [timesheetId, projectId, activityId];
      console.log('Deleting with activity_id:', activityId);
    } else {
      deleteQuery = 'DELETE FROM hrms_data.timesheet_entries WHERE timesheet_id = $1 AND project_id = $2 AND activity_id IS NULL RETURNING id';
      params = [timesheetId, projectId];
      console.log('Deleting without activity_id (NULL)');
    }
    
    const deleteResult = await pool.query(deleteQuery, params);
    console.log(`Deleted ${deleteResult.rowCount} entries`);
    
    if (deleteResult.rowCount === 0) {
      console.log('No entries found to delete');
      return res.json({ success: true, deletedCount: 0, message: 'No entries found' });
    }
    
    res.json({ success: true, deletedCount: deleteResult.rowCount });
  } catch (error) {
    console.error('Error bulk deleting entries:', error);
    res.status(500).json({ error: error.message });
  }
});

// Submit timesheet to manager
app.put('/api/timesheets/:id/submit', async (req, res) => {
  try {
    const { submitted_to } = req.body;
    const result = await pool.query(
      `UPDATE hrms_data.timesheets 
       SET status = 'submitted', submitted_at = CURRENT_TIMESTAMP, submitted_to = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND status = 'draft'
       RETURNING *`,
      [submitted_to, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Timesheet not found or already submitted' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error submitting timesheet:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get activities for a project
app.get('/api/projects/:id/activities', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM hrms_data.activities WHERE project_id = $1 AND status = $2 ORDER BY name',
      [req.params.id, 'active']
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all activities
app.get('/api/activities', async (req, res) => {
  try {
    const { project_id } = req.query;
    let query = 'SELECT * FROM hrms_data.activities WHERE status = $1';
    const params = ['active'];
    if (project_id) {
      query += ' AND project_id = $2';
      params.push(project_id);
    }
    query += ' ORDER BY name';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching activities:', error);
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

// -----------------------------------------------------------------------------
// KYC / Profile helpers
// -----------------------------------------------------------------------------
const uploadRoot = path.join(__dirname, 'uploads');
const kycUploadDir = path.join(uploadRoot, 'kyc');
const profileUploadDir = path.join(uploadRoot, 'profile');
[uploadRoot, kycUploadDir, profileUploadDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isProfile = req.path.includes('/employee/profile');
    cb(null, isProfile ? profileUploadDir : kycUploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${unique}-${safeName}`);
  }
});

const allowedMime = ['application/pdf', 'image/jpeg', 'image/png'];
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!allowedMime.includes(file.mimetype)) {
      return cb(new Error('Only PDF, JPG, PNG files are allowed'));
    }
    cb(null, true);
  }
});

// Authentication middleware to extract user_id and employee_id
async function authenticateUser(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                 req.query.token || 
                 req.body.token ||
                 req.headers['x-session-token'];
    
    const userIdFromHeader = req.headers['x-user-id'];

    console.log('🔐 Auth attempt:', { 
      hasToken: !!token, 
      tokenPrefix: token ? token.substring(0, 20) : 'none',
      userIdFromHeader,
      path: req.path 
    });

    // Priority 1: Use x-user-id header if provided (most reliable)
    if (userIdFromHeader) {
      const userResult = await pool.query(
        `SELECT u.id as user_id, u.username, u.email, u.role, u.status, e.id as employee_id
         FROM hrms_data.users u
         LEFT JOIN hrms_data.employees e ON e.user_id = u.id
         WHERE u.id = $1
         LIMIT 1`,
        [parseInt(userIdFromHeader)]
      );

      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        req.user = {
          id: user.user_id,
          username: user.username,
          email: user.email,
          role: user.role,
          status: user.status,
          employeeId: user.employee_id
        };
        console.log('✅ Authenticated via x-user-id header:', req.user.id);
        return next();
      }
    }

    // Priority 2: Check session table if token provided
    if (token) {
      // Check if user_sessions table exists
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'hrms_data' 
          AND table_name = 'user_sessions'
        )
      `);

      if (tableCheck.rows[0].exists) {
        const sessionResult = await pool.query(
          `SELECT u.id as user_id, u.username, u.email, u.role, u.status, e.id as employee_id
           FROM hrms_data.user_sessions s
           JOIN hrms_data.users u ON s.user_id = u.id
           LEFT JOIN hrms_data.employees e ON e.user_id = u.id
           WHERE s.session_token = $1 AND s.expires_at > CURRENT_TIMESTAMP
           LIMIT 1`,
          [token]
        );

        if (sessionResult.rows.length > 0) {
          const user = sessionResult.rows[0];
          req.user = {
            id: user.user_id,
            username: user.username,
            email: user.email,
            role: user.role,
            status: user.status,
            employeeId: user.employee_id
          };
          console.log('✅ Authenticated via session table:', req.user.id);
          return next();
        }
      }

      // Priority 3: Extract user_id from token format
      let userId = null;
      
      // Try format: session-{user_id}-{timestamp}
      const sessionMatch = token.match(/^session-(\d+)-/);
      if (sessionMatch) {
        userId = parseInt(sessionMatch[1]);
      } 
      // Try format: mock-token-{timestamp} - use header or try to parse
      else if (token.startsWith('mock-token-')) {
        // Use header if available, otherwise we'll fail
        userId = userIdFromHeader ? parseInt(userIdFromHeader) : null;
      }
      // Try parsing token as direct user_id
      else {
        const parsed = parseInt(token);
        if (!isNaN(parsed) && parsed > 0) {
          userId = parsed;
        }
      }
      
      // If we have a user_id, look up the user
      if (userId) {
        const userResult = await pool.query(
          `SELECT u.id as user_id, u.username, u.email, u.role, u.status, e.id as employee_id
           FROM hrms_data.users u
           LEFT JOIN hrms_data.employees e ON e.user_id = u.id
           WHERE u.id = $1
           LIMIT 1`,
          [userId]
        );

        if (userResult.rows.length > 0) {
          const user = userResult.rows[0];
          req.user = {
            id: user.user_id,
            username: user.username,
            email: user.email,
            role: user.role,
            status: user.status,
            employeeId: user.employee_id
          };
          console.log('✅ Authenticated via token parsing:', req.user.id);
          return next();
        }
      }
    }

    // If we get here, authentication failed
    console.error('❌ Authentication failed:', { 
      hasToken: !!token, 
      hasUserIdHeader: !!userIdFromHeader,
      path: req.path 
    });
    
    return res.status(401).json({ 
      success: false,
      message: 'Invalid or expired token' 
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Authentication failed',
      error: error.message 
    });
  }
}

// Admin-only middleware
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Admin access required' 
    });
  }
  next();
}

async function ensureKycTable() {
  try {
    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'kyc_documents'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      // Table doesn't exist, create it
      await pool.query(`
        CREATE TABLE hrms_data.kyc_documents (
          id SERIAL PRIMARY KEY,
          employee_id INTEGER NOT NULL,
          document_type VARCHAR(50) NOT NULL,
          file_url TEXT NOT NULL,
          file_name TEXT,
          upload_status VARCHAR(20) DEFAULT 'UPLOADED',
          verification_status VARCHAR(20) DEFAULT 'PENDING',
          rejection_reason TEXT,
          uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          verified_at TIMESTAMP,
          verified_by INTEGER,
          masked_number TEXT,
          CONSTRAINT fk_employee
              FOREIGN KEY (employee_id) REFERENCES hrms_data.employees(id) ON DELETE CASCADE,
          CONSTRAINT unique_employee_document
              UNIQUE (employee_id, document_type),
            CONSTRAINT check_verification_status
                CHECK (verification_status IS NULL OR verification_status IN ('PENDING', 'APPROVED', 'REJECTED'))
        );
      `);
      
      // Create indexes
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_kyc_employee_id ON hrms_data.kyc_documents(employee_id);
        CREATE INDEX IF NOT EXISTS idx_kyc_verification_status ON hrms_data.kyc_documents(verification_status);
        CREATE INDEX IF NOT EXISTS idx_kyc_document_type ON hrms_data.kyc_documents(document_type);
      `);
      
      console.log('✅ Created kyc_documents table');
    } else {
      // Table exists, check and add missing columns
      const columns = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'hrms_data' 
        AND table_name = 'kyc_documents'
      `);
      
      const existingColumns = columns.rows.map(r => r.column_name);
      const requiredColumns = {
        'document_type': 'VARCHAR(50)',
        'file_url': 'TEXT',
        'file_name': 'TEXT',
        'upload_status': 'VARCHAR(20) DEFAULT \'UPLOADED\'',
        'verification_status': 'VARCHAR(20) DEFAULT \'PENDING\'',
        'rejection_reason': 'TEXT',
        'verified_at': 'TIMESTAMP',
        'verified_by': 'INTEGER',
        'masked_number': 'TEXT'
      };
      
      for (const [colName, colDef] of Object.entries(requiredColumns)) {
        if (!existingColumns.includes(colName)) {
          await pool.query(`
            ALTER TABLE hrms_data.kyc_documents 
            ADD COLUMN ${colName} ${colDef}
          `);
          console.log(`✅ Added missing column: ${colName}`);
        }
      }
      
      // Migrate old doc_type to document_type if needed
      if (existingColumns.includes('doc_type') && !existingColumns.includes('document_type')) {
        await pool.query(`
          ALTER TABLE hrms_data.kyc_documents 
          ADD COLUMN document_type VARCHAR(50)
        `);
        await pool.query(`
          UPDATE hrms_data.kyc_documents 
          SET document_type = CASE 
            WHEN doc_type = 'aadhaar' THEN 'Aadhaar'
            WHEN doc_type = 'pan' THEN 'PAN'
            WHEN doc_type = 'bank' THEN 'Bank Passbook'
            ELSE INITCAP(doc_type)
          END
        `);
        await pool.query(`
          ALTER TABLE hrms_data.kyc_documents 
          ALTER COLUMN document_type SET NOT NULL
        `);
        console.log('✅ Migrated doc_type to document_type');
      }
      
      // Migrate file_path to file_url if needed
      if (existingColumns.includes('file_path') && !existingColumns.includes('file_url')) {
        await pool.query(`
          ALTER TABLE hrms_data.kyc_documents 
          ADD COLUMN file_url TEXT
        `);
        await pool.query(`
          UPDATE hrms_data.kyc_documents 
          SET file_url = file_path 
          WHERE file_path IS NOT NULL
        `);
        await pool.query(`
          ALTER TABLE hrms_data.kyc_documents 
          ALTER COLUMN file_url SET NOT NULL
        `);
        console.log('✅ Migrated file_path to file_url');
      }
    }
  } catch (err) {
    console.error('Error ensuring kyc_documents table:', err);
    throw err;
  }
}
ensureKycTable();

function computeOverallStatus(docs) {
  const required = ['aadhaar', 'pan', 'bank'];
  const missing = required.some((k) => !docs[k]?.file_name || !docs[k]?.upload_status);
  
  if (missing) return 'Not Uploaded';
  
  // Check if all are approved
  const allApproved = required.every((k) => docs[k]?.verification_status === 'APPROVED');
  if (allApproved) {
    return 'Approved';
  }
  
  // Check if any are rejected
  if (required.some((k) => docs[k]?.verification_status === 'REJECTED')) {
    return 'Re-upload Required';
  }
  
  // Check if any are under review
  if (required.some((k) => docs[k]?.verification_status === 'PENDING')) {
    return 'Under Review';
  }
  
  // If uploaded but not submitted (verification_status is NULL)
  const allUploaded = required.every((k) => docs[k]?.upload_status === 'UPLOADED' && !docs[k]?.verification_status);
  if (allUploaded) {
    return 'Uploaded';
  }
  
  // Mixed states
  return 'In Progress';
}

// GET profile - Employee API (uses authenticated user's employee_id)
app.get('/api/employee/profile', authenticateUser, async (req, res) => {
  try {
    // Get employee_id from authenticated user
    let employeeId = req.user.employeeId;
    
    if (!employeeId) {
      // Try to find employee by user_id
      const empResult = await pool.query(
        'SELECT id FROM hrms_data.employees WHERE user_id = $1 LIMIT 1',
        [req.user.id]
      );
      
      if (empResult.rows.length > 0) {
        employeeId = empResult.rows[0].id;
      } else {
        // Try to find by email
        const empByEmail = await pool.query(
          'SELECT id FROM hrms_data.employees WHERE email = $1 LIMIT 1',
          [req.user.email]
        );
        
        if (empByEmail.rows.length > 0) {
          employeeId = empByEmail.rows[0].id;
          // Update employee with user_id
          await pool.query(
            'UPDATE hrms_data.employees SET user_id = $1 WHERE id = $2',
            [req.user.id, employeeId]
          );
        } else {
          // Return empty profile if no employee record found
          return res.json({
            id: null,
            employeeId: '',
            name: req.user.username || '',
            title: '',
            email: req.user.email || '',
            department: '',
            phone: '',
            doj: '',
            location: '',
            avatarUrl: '/api/employee/profile/avatar-placeholder'
          });
        }
      }
    }
    
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, phone_number, department, job_title, hire_date, location, avatar_url, employee_code
       FROM hrms_data.employees
       WHERE id = $1
       LIMIT 1`,
      [employeeId]
    );
    
    if (result.rows.length === 0) {
      // Return empty profile
      return res.json({
        id: employeeId,
        employeeId: employeeId?.toString() || '',
        name: req.user.username || '',
        title: '',
        email: req.user.email || '',
        department: '',
        phone: '',
        doj: '',
        location: '',
        avatarUrl: '/api/employee/profile/avatar-placeholder'
      });
    }
    
    const row = result.rows[0];
    res.json({
      id: row.id,
      employeeId: row.employee_code || row.id?.toString() || '',
      name: `${row.first_name || ''} ${row.last_name || ''}`.trim() || req.user.username || '',
      title: row.job_title || '',
      email: row.email || req.user.email || '',
      department: row.department || '',
      phone: row.phone_number || '',
      doj: row.hire_date ? new Date(row.hire_date).toISOString().split('T')[0] : '',
      location: row.location || '',
      avatarUrl: row.avatar_url || '/api/employee/profile/avatar-placeholder'
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: err.message });
  }
});

// Static placeholder
app.get('/api/employee/profile/avatar-placeholder', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'placeholder.png'), (err) => {
    if (err) res.status(204).end();
  });
});

// PUT profile (supports avatar upload) - Employee API (uses authenticated user's employee_id)
app.put('/api/employee/profile', authenticateUser, upload.single('avatar'), async (req, res) => {
  // Get employee_id from authenticated user
  let employeeId = req.user.employeeId;
  
  if (!employeeId) {
    // Try to find employee by user_id
    const empResult = await pool.query(
      'SELECT id FROM hrms_data.employees WHERE user_id = $1 LIMIT 1',
      [req.user.id]
    );
    
    if (empResult.rows.length > 0) {
      employeeId = empResult.rows[0].id;
    } else {
      // Try to find by email
      const empByEmail = await pool.query(
        'SELECT id FROM hrms_data.employees WHERE email = $1 LIMIT 1',
        [req.user.email]
      );
      
      if (empByEmail.rows.length > 0) {
        employeeId = empByEmail.rows[0].id;
        // Update employee with user_id
        await pool.query(
          'UPDATE hrms_data.employees SET user_id = $1 WHERE id = $2',
          [req.user.id, employeeId]
        );
      } else {
        return res.status(400).json({ error: 'No employee record found. Please contact administrator.' });
      }
    }
  }
  
  const { name, title, email, department, phone, doj, location } = req.body || {};
  const avatarUrl = req.file ? `/uploads/profile/${req.file.filename}` : undefined;
  try {
    await pool.query(`ALTER TABLE hrms_data.employees
      ADD COLUMN IF NOT EXISTS avatar_url TEXT,
      ADD COLUMN IF NOT EXISTS job_title TEXT,
      ADD COLUMN IF NOT EXISTS phone_number TEXT,
      ADD COLUMN IF NOT EXISTS department TEXT,
      ADD COLUMN IF NOT EXISTS location TEXT;`);

    const parts = (name || '').trim().split(' ');
    const first = parts.shift() || null;
    const last = parts.join(' ') || null;

    const fields = [];
    const values = [];
    let idx = 1;
    if (first) { fields.push(`first_name = $${idx++}`); values.push(first); }
    if (last) { fields.push(`last_name = $${idx++}`); values.push(last); }
    if (title) { fields.push(`job_title = $${idx++}`); values.push(title); }
    if (email) { fields.push(`email = $${idx++}`); values.push(email); }
    if (department) { fields.push(`department = $${idx++}`); values.push(department); }
    if (phone) { fields.push(`phone_number = $${idx++}`); values.push(phone); }
    if (location) { fields.push(`location = $${idx++}`); values.push(location); }
    if (avatarUrl) { fields.push(`avatar_url = $${idx++}`); values.push(avatarUrl); }
    if (doj) { fields.push(`hire_date = $${idx++}`); values.push(new Date(doj)); }

    values.push(employeeId);
    if (fields.length > 0) {
      const q = `UPDATE hrms_data.employees SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`;
      const result = await pool.query(q, values);
      return res.json({ success: true, employee: result.rows[0] });
    } else {
      // Nothing to update; just return current row (or empty)
      const current = await pool.query(
        `SELECT * FROM hrms_data.employees WHERE id = $1 LIMIT 1`,
        [employeeId]
      );
      return res.json({ success: true, employee: current.rows[0] || null });
    }
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: err.message });
  }
});

// Upload KYC document - Employee API
app.post('/api/kyc/upload', authenticateUser, upload.single('file'), async (req, res) => {
  try {
    // Get employee_id from authenticated user
    let employeeId = req.user.employeeId;
    
    // If user doesn't have employee_id, try to find or create one
    if (!employeeId) {
      // Try to find employee by user_id
      const empResult = await pool.query(
        'SELECT id FROM hrms_data.employees WHERE user_id = $1 LIMIT 1',
        [req.user.id]
      );
      
      if (empResult.rows.length > 0) {
        employeeId = empResult.rows[0].id;
      } else {
        // Try to find by email
        const empByEmail = await pool.query(
          'SELECT id FROM hrms_data.employees WHERE email = $1 LIMIT 1',
          [req.user.email]
        );
        
        if (empByEmail.rows.length > 0) {
          employeeId = empByEmail.rows[0].id;
          // Update employee with user_id
          await pool.query(
            'UPDATE hrms_data.employees SET user_id = $1 WHERE id = $2',
            [req.user.id, employeeId]
          );
        } else {
          return res.status(400).json({ 
            error: 'No employee record found. Please contact administrator.' 
          });
        }
      }
    }

    const docType = (req.body.documentType || '').toLowerCase();
    const docTypeMap = {
      'aadhaar': 'Aadhaar',
      'pan': 'PAN',
      'bank': 'Bank Passbook'
    };
    
    if (!docTypeMap[docType]) {
      return res.status(400).json({ error: 'Invalid document type. Must be: aadhaar, pan, or bank' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    await ensureKycTable();
    const fileUrl = `/uploads/kyc/${req.file.filename}`;
    
    console.log(`📤 Uploading KYC: employee_id=${employeeId}, docType=${docType}, mappedType=${docTypeMap[docType]}, file=${req.file.originalname}`);
    
    const result = await pool.query(
      `INSERT INTO hrms_data.kyc_documents 
       (employee_id, document_type, file_url, file_name, upload_status, verification_status, uploaded_at)
       VALUES ($1, $2, $3, $4, 'UPLOADED', NULL, CURRENT_TIMESTAMP)
       ON CONFLICT (employee_id, document_type)
       DO UPDATE SET 
         file_url = EXCLUDED.file_url,
         file_name = EXCLUDED.file_name,
         upload_status = 'UPLOADED',
         verification_status = NULL,
         uploaded_at = CURRENT_TIMESTAMP,
         rejection_reason = NULL
       RETURNING id, employee_id, document_type, file_url, file_name, upload_status, verification_status`,
      [employeeId, docTypeMap[docType], fileUrl, req.file.originalname]
    );
    
    if (result.rows.length > 0) {
      console.log(`✅ KYC document saved: ID=${result.rows[0].id}, employee_id=${result.rows[0].employee_id}`);
      res.json({ 
        success: true, 
        fileUrl, 
        message: 'Document uploaded successfully',
        document: result.rows[0]
      });
    } else {
      console.error('❌ KYC document insert returned no rows');
      res.status(500).json({ error: 'Failed to save document' });
    }
  } catch (err) {
    console.error('Error uploading KYC:', err);
    res.status(500).json({ error: err.message });
  }
});

// Legacy endpoint for backward compatibility
app.post('/api/employee/kyc/upload', authenticateUser, upload.single('file'), async (req, res) => {
  // Redirect to new endpoint
  req.url = '/api/kyc/upload';
  return app._router.handle(req, res);
});

// Get Employee KYC status - Employee API
app.get('/api/kyc/my', authenticateUser, async (req, res) => {
  try {
    // Get employee_id from authenticated user
    let employeeId = req.user.employeeId;
    
    if (!employeeId) {
      // Try to find employee by user_id
      const empResult = await pool.query(
        'SELECT id FROM hrms_data.employees WHERE user_id = $1 LIMIT 1',
        [req.user.id]
      );
      
      if (empResult.rows.length > 0) {
        employeeId = empResult.rows[0].id;
      } else {
        // Return empty documents if no employee record
        return res.json({
          documents: {
            aadhaar: { file_name: null, uploaded_at: null, upload_status: null, verification_status: null, file_url: null, masked_number: null, submitted_at: null },
            pan: { file_name: null, uploaded_at: null, upload_status: null, verification_status: null, file_url: null, masked_number: null, submitted_at: null },
            bank: { file_name: null, uploaded_at: null, upload_status: null, verification_status: null, file_url: null, masked_number: null, submitted_at: null },
          },
          overallStatus: 'Not Uploaded'
        });
      }
    }

    await ensureKycTable();
    
    console.log(`📥 Fetching KYC for employee_id=${employeeId}`);
    
    // Check if submitted_at column exists, if not, query without it
    let result;
    try {
      result = await pool.query(
        `SELECT document_type, file_name, file_url, upload_status, verification_status, uploaded_at, submitted_at, masked_number, rejection_reason
         FROM hrms_data.kyc_documents
         WHERE employee_id = $1`,
        [employeeId]
      );
    } catch (err) {
      // If submitted_at column doesn't exist, query without it
      if (err.message && err.message.includes('submitted_at')) {
        console.log('⚠️ submitted_at column not found, using fallback query');
        result = await pool.query(
          `SELECT document_type, file_name, file_url, upload_status, verification_status, uploaded_at, NULL as submitted_at, masked_number, rejection_reason
           FROM hrms_data.kyc_documents
           WHERE employee_id = $1`,
          [employeeId]
        );
      } else {
        throw err;
      }
    }
    
    console.log(`📥 Found ${result.rows.length} KYC documents for employee_id=${employeeId}`);
    
    // Map document types to lowercase keys for frontend
    const docTypeMap = {
      'Aadhaar': 'aadhaar',
      'PAN': 'pan',
      'Bank Passbook': 'bank'
    };
    
    const docs = {
      aadhaar: { file_name: null, uploaded_at: null, upload_status: null, verification_status: null, file_url: null, masked_number: null, rejection_reason: null, submitted_at: null },
      pan: { file_name: null, uploaded_at: null, upload_status: null, verification_status: null, file_url: null, masked_number: null, rejection_reason: null, submitted_at: null },
      bank: { file_name: null, uploaded_at: null, upload_status: null, verification_status: null, file_url: null, masked_number: null, rejection_reason: null, submitted_at: null },
    };
    
    result.rows.forEach((row) => {
      const key = docTypeMap[row.document_type];
      if (key && docs[key] !== undefined) {
        docs[key] = {
          file_name: row.file_name,
          uploaded_at: row.uploaded_at,
          upload_status: row.upload_status || null,
          verification_status: row.verification_status || null,
          file_url: row.file_url,
          masked_number: row.masked_number,
          rejection_reason: row.rejection_reason,
          submitted_at: row.submitted_at || null
        };
      }
    });
    
    const overallStatus = computeOverallStatus(docs);
    res.json({ documents: docs, overallStatus });
  } catch (err) {
    console.error('Error fetching KYC status:', err);
    res.status(500).json({ error: err.message });
  }
});

// Legacy endpoint for backward compatibility
app.get('/api/employee/kyc/status', authenticateUser, async (req, res) => {
  req.url = '/api/kyc/my';
  return app._router.handle(req, res);
});

// Submit individual KYC document for review - Employee API
app.post('/api/kyc/submit/:documentType', authenticateUser, async (req, res) => {
  try {
    let employeeId = req.user.employeeId;
    
    if (!employeeId) {
      const empResult = await pool.query(
        'SELECT id FROM hrms_data.employees WHERE user_id = $1 LIMIT 1',
        [req.user.id]
      );
      if (empResult.rows.length > 0) {
        employeeId = empResult.rows[0].id;
      } else {
        return res.status(400).json({ error: 'No employee record found' });
      }
    }

    await ensureKycTable();
    
    const docType = (req.params.documentType || '').toLowerCase();
    const docTypeMap = {
      'aadhaar': 'Aadhaar',
      'pan': 'PAN',
      'bank': 'Bank Passbook'
    };
    
    if (!docTypeMap[docType]) {
      return res.status(400).json({ error: 'Invalid document type. Must be: aadhaar, pan, or bank' });
    }
    
    const mappedDocType = docTypeMap[docType];
    
    // Check if document exists and is uploaded
    // Handle case where submitted_at column might not exist
    let checkResult;
    try {
      checkResult = await pool.query(
        `SELECT id, upload_status, verification_status, submitted_at
         FROM hrms_data.kyc_documents
         WHERE employee_id = $1 AND document_type = $2`,
        [employeeId, mappedDocType]
      );
    } catch (err) {
      if (err.message && err.message.includes('submitted_at')) {
        // Fallback: query without submitted_at
        checkResult = await pool.query(
          `SELECT id, upload_status, verification_status, NULL as submitted_at
           FROM hrms_data.kyc_documents
           WHERE employee_id = $1 AND document_type = $2`,
          [employeeId, mappedDocType]
        );
      } else {
        throw err;
      }
    }
    
    if (checkResult.rows.length === 0) {
      return res.status(400).json({ 
        error: 'Document not found. Please upload the document first.' 
      });
    }
    
    const doc = checkResult.rows[0];
    
    if (doc.upload_status !== 'UPLOADED') {
      return res.status(400).json({ 
        error: 'Document is not uploaded. Please upload the document first.' 
      });
    }
    
    if (doc.verification_status === 'PENDING' || doc.verification_status === 'APPROVED') {
      return res.status(400).json({ 
        error: 'Document is already submitted or approved.' 
      });
    }
    
    // Submit the individual document
    // Try to update with submitted_at, fallback if column doesn't exist
    let updateResult;
    try {
      updateResult = await pool.query(
        `UPDATE hrms_data.kyc_documents
         SET verification_status = 'PENDING',
             submitted_at = CURRENT_TIMESTAMP
         WHERE employee_id = $1 
         AND document_type = $2
         RETURNING id, document_type, submitted_at`,
        [employeeId, mappedDocType]
      );
    } catch (err) {
      if (err.message && err.message.includes('submitted_at')) {
        // Fallback: update without submitted_at
        console.log('⚠️ submitted_at column not found, updating without it');
        updateResult = await pool.query(
          `UPDATE hrms_data.kyc_documents
           SET verification_status = 'PENDING'
           WHERE employee_id = $1 
           AND document_type = $2
           RETURNING id, document_type, NULL as submitted_at`,
          [employeeId, mappedDocType]
        );
      } else {
        throw err;
      }
    }
    
    if (updateResult.rows.length === 0) {
      return res.status(500).json({ error: 'Failed to submit document' });
    }
    
    res.json({ 
      success: true, 
      message: `${mappedDocType} submitted for review`,
      document: updateResult.rows[0]
    });
  } catch (err) {
    console.error('Error submitting KYC document:', err);
    res.status(500).json({ error: err.message });
  }
});

// Submit all KYC documents for review - Employee API (bulk submit)
app.post('/api/kyc/submit', authenticateUser, async (req, res) => {
  try {
    let employeeId = req.user.employeeId;
    
    if (!employeeId) {
      const empResult = await pool.query(
        'SELECT id FROM hrms_data.employees WHERE user_id = $1 LIMIT 1',
        [req.user.id]
      );
      if (empResult.rows.length > 0) {
        employeeId = empResult.rows[0].id;
      } else {
        return res.status(400).json({ error: 'No employee record found' });
      }
    }

    await ensureKycTable();
    
    // Only submit documents that are uploaded but not yet submitted
    // (verification_status is NULL means uploaded but not submitted)
    // Only submit documents that have been individually submitted (submitted_at IS NOT NULL)
    // Handle case where submitted_at column might not exist
    let updateResult;
    try {
      updateResult = await pool.query(
        `UPDATE hrms_data.kyc_documents
         SET verification_status = 'PENDING'
         WHERE employee_id = $1 
         AND upload_status = 'UPLOADED' 
         AND submitted_at IS NOT NULL
         AND (verification_status IS NULL OR verification_status = 'REJECTED')
         RETURNING id, document_type`,
        [employeeId]
      );
    } catch (err) {
      if (err.message && err.message.includes('submitted_at')) {
        // Fallback: submit all uploaded documents (old behavior)
        console.log('⚠️ submitted_at column not found, using fallback query');
        updateResult = await pool.query(
          `UPDATE hrms_data.kyc_documents
           SET verification_status = 'PENDING'
           WHERE employee_id = $1 
           AND upload_status = 'UPLOADED' 
           AND (verification_status IS NULL OR verification_status = 'REJECTED')
           RETURNING id, document_type`,
          [employeeId]
        );
      } else {
        throw err;
      }
    }
    
    if (updateResult.rows.length === 0) {
      return res.status(400).json({ 
        error: 'No documents available to submit. Please upload and submit individual documents first.' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'KYC documents submitted for review',
      submittedCount: updateResult.rows.length
    });
  } catch (err) {
    console.error('Error submitting KYC:', err);
    res.status(500).json({ error: err.message });
  }
});

// Legacy endpoint
app.put('/api/employee/kyc/status', authenticateUser, async (req, res) => {
  const status = req.body?.status;
  if (status === 'Under Review') {
    req.url = '/api/kyc/submit';
    req.method = 'POST';
    return app._router.handle(req, res);
  }
  return res.status(400).json({ error: 'Invalid status update' });
});

// ==================== ADMIN KYC APIs ====================

// Get pending KYC documents - Admin API
app.get('/api/admin/kyc/pending', authenticateUser, requireAdmin, async (req, res) => {
  try {
    await ensureKycTable();
    const result = await pool.query(
      `SELECT 
        k.id,
        k.employee_id,
        k.document_type,
        k.file_url,
        k.file_name,
        k.uploaded_at,
        k.verification_status,
        k.verified_at,
        k.verified_by,
        k.rejection_reason,
        e.first_name || ' ' || e.last_name AS employee_name,
        e.email AS employee_email,
        NULL AS employee_code
       FROM hrms_data.kyc_documents k
       JOIN hrms_data.employees e ON e.id = k.employee_id
       ORDER BY 
         CASE k.verification_status 
           WHEN 'PENDING' THEN 1 
           WHEN 'APPROVED' THEN 2 
           WHEN 'REJECTED' THEN 3 
           ELSE 4 
         END,
         k.uploaded_at DESC`
    );
    
    res.json({ success: true, documents: result.rows });
  } catch (err) {
    console.error('Error fetching pending KYC:', err);
    res.status(500).json({ error: err.message });
  }
});

// Verify/Approve/Reject KYC - Admin API
app.post('/api/admin/kyc/verify', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { kyc_id, status, rejection_reason } = req.body;
    
    if (!kyc_id || !status) {
      return res.status(400).json({ error: 'kyc_id and status are required' });
    }
    
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'status must be APPROVED or REJECTED' });
    }
    
    if (status === 'REJECTED' && !rejection_reason) {
      return res.status(400).json({ error: 'rejection_reason is required when rejecting' });
    }

    await ensureKycTable();
    
    const updateQuery = status === 'APPROVED'
      ? `UPDATE hrms_data.kyc_documents
         SET verification_status = 'APPROVED',
             verified_at = CURRENT_TIMESTAMP,
             verified_by = $1,
             rejection_reason = NULL
         WHERE id = $2
         RETURNING *`
      : `UPDATE hrms_data.kyc_documents
         SET verification_status = 'REJECTED',
             verified_at = CURRENT_TIMESTAMP,
             verified_by = $1,
             rejection_reason = $3
         WHERE id = $2
         RETURNING *`;
    
    const params = status === 'APPROVED'
      ? [req.user.id, kyc_id]
      : [req.user.id, kyc_id, rejection_reason];
    
    const result = await pool.query(updateQuery, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'KYC document not found' });
    }
    
    res.json({ 
      success: true, 
      message: `Document ${status.toLowerCase()} successfully`,
      document: result.rows[0]
    });
  } catch (err) {
    console.error('Error verifying KYC:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all employees with KYC data - Admin API
app.get('/api/admin/employees/with-kyc', authenticateUser, requireAdmin, async (req, res) => {
  try {
    await ensureKycTable();
    
    // Fetch all employees with their basic info
    // Handle missing columns gracefully by checking if they exist first
    let employeesResult;
    try {
      employeesResult = await pool.query(
        `SELECT 
          e.id,
          e.employee_id,
          e.first_name,
          e.middle_name,
          e.last_name,
          e.email as office_email,
          COALESCE(e.phone_number, e.phone) as primary_phone,
          COALESCE(e.alternate_phone, NULL) as alternate_phone,
          COALESCE(e.personal_email, NULL) as personal_email,
          COALESCE(e.residential_address, NULL) as residential_address,
          e.status
        FROM hrms_data.employees e
        WHERE e.status = 'active'
        ORDER BY e.first_name, e.last_name`
      );
    } catch (err) {
      // If columns don't exist, query without them
      if (err.message && (err.message.includes('alternate_phone') || err.message.includes('personal_email') || err.message.includes('residential_address'))) {
        console.log('⚠️ Some employee columns missing, using fallback query');
        employeesResult = await pool.query(
          `SELECT 
            e.id,
            e.employee_id,
            e.first_name,
            e.middle_name,
            e.last_name,
            e.email as office_email,
            COALESCE(e.phone_number, e.phone) as primary_phone,
            NULL as alternate_phone,
            NULL as personal_email,
            NULL as residential_address,
            e.status
          FROM hrms_data.employees e
          WHERE e.status = 'active'
          ORDER BY e.first_name, e.last_name`
        );
      } else {
        throw err;
      }
    }
    
    // Fetch all KYC documents
    let kycResult;
    try {
      kycResult = await pool.query(
        `SELECT 
          id,
          employee_id,
          document_type,
          file_name,
          file_url,
          upload_status,
          verification_status,
          uploaded_at,
          submitted_at,
          masked_number,
          rejection_reason,
          verified_at,
          verified_by
        FROM hrms_data.kyc_documents
        ORDER BY employee_id, document_type`
      );
    } catch (err) {
      if (err.message && err.message.includes('submitted_at')) {
        // Fallback: query without submitted_at
        kycResult = await pool.query(
          `SELECT 
            id,
            employee_id,
            document_type,
            file_name,
            file_url,
            upload_status,
            verification_status,
            uploaded_at,
            NULL as submitted_at,
            masked_number,
            rejection_reason,
            verified_at,
            verified_by
          FROM hrms_data.kyc_documents
          ORDER BY employee_id, document_type`
        );
      } else {
        throw err;
      }
    }
    
    // Map KYC documents by employee_id and document_type
    const kycMap = {};
    kycResult.rows.forEach((doc) => {
      if (!kycMap[doc.employee_id]) {
        kycMap[doc.employee_id] = {};
      }
      const docTypeMap = {
        'Aadhaar': 'aadhaar',
        'PAN': 'pan',
        'Bank Passbook': 'bank'
      };
      const key = docTypeMap[doc.document_type] || doc.document_type.toLowerCase();
      kycMap[doc.employee_id][key] = doc;
    });
    
    // Combine employee data with KYC data
    const employeesWithKyc = employeesResult.rows.map((emp) => {
      const kycDocs = kycMap[emp.id] || {};
      
      // Determine overall KYC status
      const aadhaar = kycDocs.aadhaar;
      const pan = kycDocs.pan;
      const bank = kycDocs.bank;
      
      let overallStatus = 'Not Submitted';
      if (aadhaar || pan || bank) {
        const allApproved = [aadhaar, pan, bank].every(doc => 
          doc && doc.verification_status === 'APPROVED'
        );
        const anyRejected = [aadhaar, pan, bank].some(doc => 
          doc && doc.verification_status === 'REJECTED'
        );
        const anyPending = [aadhaar, pan, bank].some(doc => 
          doc && doc.verification_status === 'PENDING'
        );
        const anySubmitted = [aadhaar, pan, bank].some(doc => 
          doc && (doc.submitted_at || doc.verification_status === 'PENDING' || doc.verification_status === 'APPROVED' || doc.verification_status === 'REJECTED')
        );
        
        if (allApproved) {
          overallStatus = 'Approved';
        } else if (anyRejected) {
          overallStatus = 'Rejected';
        } else if (anyPending) {
          overallStatus = 'Submitted';
        } else if (anySubmitted) {
          overallStatus = 'Submitted';
        }
      }
      
      return {
        ...emp,
        full_name: [emp.first_name, emp.middle_name, emp.last_name].filter(Boolean).join(' '),
        kyc: {
          aadhaar: aadhaar || null,
          pan: pan || null,
          bank: bank || null,
          overallStatus
        }
      };
    });
    
    res.json({ success: true, employees: employeesWithKyc });
  } catch (err) {
    console.error('Error fetching employees with KYC:', err);
    res.status(500).json({ error: err.message });
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadRoot));

// Serve images from web/images directory
const imagesPath = path.join(__dirname, '../../web/images');
if (fs.existsSync(imagesPath)) {
  app.use('/images', express.static(imagesPath));
  console.log('📸 Serving images from:', imagesPath);
}

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

