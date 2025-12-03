/**
 * Arithwise HRM Backend API Server
 * Copyright (C) 2024 Arithwise Inc.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'arithwsie_hrms',
  user: process.env.DB_USER || 'bhushan',
  password: process.env.DB_PASSWORD || '',
  // Set search_path to use hrms_data schema
  options: '-c search_path=hrms_data,public'
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

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
    res.status(500).json({ error: 'Failed to fetch job titles' });
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
    res.status(500).json({ error: 'Failed to fetch vacancies' });
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
    res.status(500).json({ error: 'Failed to fetch candidates' });
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
        e.middle_name,
        e.last_name,
        e.email,
        e.phone,
        e.position AS job_title,
        e.employment_status,
        e.sub_unit,
        e.supervisor_name,
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
      addFilter(
        "(e.first_name || ' ' || COALESCE(e.middle_name || ' ', '') || e.last_name) ILIKE $$",
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
    res.status(500).json({ error: 'Failed to fetch employees' });
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
        e.middle_name,
        e.last_name,
        e.email,
        e.phone,
        e.position AS job_title,
        e.employment_status,
        e.sub_unit,
        e.supervisor_name,
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

// Simple connectivity test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend connected successfully' });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Arithwise HRM Backend API server running on port ${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
});

