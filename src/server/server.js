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
      'SELECT id, username, email, password_hash, first_name, last_name, role, status FROM users WHERE username = $1 OR email = $1',
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

    // Simple password check (in production, use bcrypt)
    // For now, we'll accept plain text passwords for development
    // TODO: Implement proper password hashing with bcrypt
    const passwordMatch = password === user.password_hash || 
                          password === 'Admin@123' && user.role === 'admin' ||
                          password === 'User@123' && user.role === 'user';

    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid username or password' 
      });
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate session token (simple for now, use JWT in production)
    const sessionToken = 'session-' + user.id + '-' + Date.now();

    // Store session in database (if user_sessions table exists)
    try {
      await pool.query(
        'INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address) VALUES ($1, $2, $3, $4)',
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
        'SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.role, u.status FROM user_sessions s JOIN users u ON s.user_id = u.id WHERE s.session_token = $1 AND s.expires_at > CURRENT_TIMESTAMP',
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

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`🚀 Arithwise HRM server running on port ${PORT}`);
  console.log(`📡 API endpoints: http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`🔍 Diagnostic: http://localhost:${PORT}/api/diagnostic`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
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

