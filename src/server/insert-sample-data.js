/**
 * Insert sample data into hrms_data schema
 * Run: node insert-sample-data.js
 */

const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Database configuration
const dbConfig = {
    user: process.env.DB_USER || 'bhushan',
    password: process.env.DB_PASS || process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'arithwise_hrms'
};

// Decode URL-encoded password
if (dbConfig.password) {
    try {
        dbConfig.password = decodeURIComponent(dbConfig.password);
    } catch (e) {
        // Keep as-is if decoding fails
    }
}

const pool = new Pool(dbConfig);

async function insertSampleData() {
    const client = await pool.connect();
    
    try {
        await client.query('SET search_path TO hrms_data, public');
        console.log('✅ Connected to database');
        
        // Start transaction
        await client.query('BEGIN');
        
        // 1. Insert Job Titles
        console.log('📝 Inserting job titles...');
        const jobTitles = [
            ['Software Engineer', 'Develop and maintain software applications'],
            ['Senior Software Engineer', 'Lead software development projects'],
            ['Product Manager', 'Manage product development and strategy'],
            ['HR Manager', 'Manage human resources and recruitment'],
            ['Sales Representative', 'Handle sales and customer relations'],
            ['Marketing Specialist', 'Develop and execute marketing campaigns'],
            ['Data Analyst', 'Analyze data and generate insights'],
            ['Project Manager', 'Manage projects and teams']
        ];
        
        for (const [title, description] of jobTitles) {
            await client.query(
                `INSERT INTO hrms_data.job_titles (title, description, status) 
                 VALUES ($1, $2, 'active') 
                 ON CONFLICT (title) DO NOTHING`,
                [title, description]
            );
        }
        console.log(`   ✓ Inserted ${jobTitles.length} job titles`);
        
        // 2. Insert Employees
        console.log('👥 Inserting employees...');
        const employees = [
            ['EMP001', 'John', 'Michael', 'Doe', 'john.doe@company.com', '+1234567890', 
             'Software Engineer', 'Full-Time Permanent', 'IT', 'Jane Manager', '2023-01-15'],
            ['EMP002', 'Jane', null, 'Smith', 'jane.smith@company.com', '+1234567891', 
             'HR Manager', 'Full-Time Permanent', 'HR', null, '2022-06-01'],
            ['EMP003', 'Robert', 'James', 'Johnson', 'robert.j@company.com', '+1234567892', 
             'Product Manager', 'Full-Time Permanent', 'Product', 'Jane Manager', '2023-03-20'],
            ['EMP004', 'Emily', null, 'Williams', 'emily.w@company.com', '+1234567893', 
             'Sales Representative', 'Full-Time Permanent', 'Sales', 'Robert Johnson', '2023-05-10'],
            ['EMP005', 'Michael', 'David', 'Brown', 'michael.b@company.com', '+1234567894', 
             'Senior Software Engineer', 'Full-Time Permanent', 'IT', 'Jane Manager', '2021-11-05']
        ];
        
        for (const [empId, firstName, middleName, lastName, email, phone, position, status, subUnit, supervisor, hireDate] of employees) {
            await client.query(
                `INSERT INTO hrms_data.employees 
                 (employee_id, first_name, middle_name, last_name, email, phone, position, employment_status, sub_unit, supervisor_name, status, hire_date) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active', $11) 
                 ON CONFLICT (employee_id) DO NOTHING`,
                [empId, firstName, middleName, lastName, email, phone, position, status, subUnit, supervisor, hireDate]
            );
        }
        console.log(`   ✓ Inserted ${employees.length} employees`);
        
        // 3. Insert Vacancies
        console.log('📋 Inserting vacancies...');
        
        // Get job title and employee IDs
        const seniorEngResult = await client.query(
            "SELECT id FROM hrms_data.job_titles WHERE title = 'Senior Software Engineer' LIMIT 1"
        );
        const productMgrResult = await client.query(
            "SELECT id FROM hrms_data.job_titles WHERE title = 'Product Manager' LIMIT 1"
        );
        const marketingResult = await client.query(
            "SELECT id FROM hrms_data.job_titles WHERE title = 'Marketing Specialist' LIMIT 1"
        );
        const emp001Result = await client.query(
            "SELECT id FROM hrms_data.employees WHERE employee_id = 'EMP001' LIMIT 1"
        );
        const emp003Result = await client.query(
            "SELECT id FROM hrms_data.employees WHERE employee_id = 'EMP003' LIMIT 1"
        );
        
        const vacancies = [
            ['Senior Developer Position', seniorEngResult.rows[0]?.id, emp001Result.rows[0]?.id, 
             'We are looking for an experienced senior developer to join our team.', 2, 30],
            ['Product Manager Role', productMgrResult.rows[0]?.id, emp003Result.rows[0]?.id, 
             'Join our product team as a Product Manager.', 1, 45],
            ['Marketing Specialist Opening', marketingResult.rows[0]?.id, null, 
             'We need a creative marketing specialist.', 1, 20]
        ];
        
        for (const [name, jobTitleId, hiringManagerId, description, numPositions, daysUntilClose] of vacancies) {
            if (!jobTitleId) {
                console.log(`   ⚠️  Skipping ${name} - job title not found`);
                continue;
            }
            await client.query(
                `INSERT INTO hrms_data.vacancies 
                 (name, job_title_id, hiring_manager_id, description, number_of_positions, status, published_date, closing_date) 
                 VALUES ($1, $2, $3, $4, $5, 'active', CURRENT_DATE, CURRENT_DATE + INTERVAL '${daysUntilClose} days') 
                 ON CONFLICT (name) DO NOTHING`,
                [name, jobTitleId, hiringManagerId, description, numPositions]
            );
        }
        console.log(`   ✓ Inserted ${vacancies.length} vacancies`);
        
        // 4. Insert Candidates
        console.log('🎯 Inserting candidates...');
        const candidates = [
            ['Alice', null, 'Anderson', 'alice.anderson@email.com', '+1987654321', 
             'Java, Spring, PostgreSQL', -5, 'Application Initiated', 'Online'],
            ['Bob', 'Charles', 'Taylor', 'bob.taylor@email.com', '+1987654322', 
             'JavaScript, React, Node.js', -3, 'Shortlisted', 'Manual'],
            ['Carol', null, 'Martinez', 'carol.m@email.com', '+1987654323', 
             'Python, Django, SQL', -1, 'Application Initiated', 'Online'],
            ['David', 'Edward', 'Lee', 'david.lee@email.com', '+1987654324', 
             'Product Management, Agile', 0, 'Interview Scheduled', 'Manual']
        ];
        
        for (const [firstName, middleName, lastName, email, contact, keywords, daysAgo, status, method] of candidates) {
            await client.query(
                `INSERT INTO hrms_data.candidates 
                 (first_name, middle_name, last_name, email, contact_number, keywords, date_of_application, status, method_of_application) 
                 VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE + INTERVAL '${daysAgo} days', $7, $8)`,
                [firstName, middleName, lastName, email, contact, keywords, status, method]
            );
        }
        console.log(`   ✓ Inserted ${candidates.length} candidates`);
        
        // 5. Link Candidates to Vacancies
        console.log('🔗 Linking candidates to vacancies...');
        
        const aliceResult = await client.query(
            "SELECT id FROM hrms_data.candidates WHERE first_name = 'Alice' AND last_name = 'Anderson' LIMIT 1"
        );
        const bobResult = await client.query(
            "SELECT id FROM hrms_data.candidates WHERE first_name = 'Bob' AND last_name = 'Taylor' LIMIT 1"
        );
        const davidResult = await client.query(
            "SELECT id FROM hrms_data.candidates WHERE first_name = 'David' AND last_name = 'Lee' LIMIT 1"
        );
        const seniorDevResult = await client.query(
            "SELECT id FROM hrms_data.vacancies WHERE name = 'Senior Developer Position' LIMIT 1"
        );
        const productMgrVacResult = await client.query(
            "SELECT id FROM hrms_data.vacancies WHERE name = 'Product Manager Role' LIMIT 1"
        );
        
        const links = [
            [aliceResult.rows[0]?.id, seniorDevResult.rows[0]?.id, 'Application Initiated'],
            [bobResult.rows[0]?.id, seniorDevResult.rows[0]?.id, 'Shortlisted'],
            [davidResult.rows[0]?.id, productMgrVacResult.rows[0]?.id, 'Application Initiated']
        ];
        
        for (const [candidateId, vacancyId, status] of links) {
            if (candidateId && vacancyId) {
                await client.query(
                    `INSERT INTO hrms_data.candidate_vacancies (candidate_id, vacancy_id, status) 
                     VALUES ($1, $2, $3) 
                     ON CONFLICT (candidate_id, vacancy_id) DO NOTHING`,
                    [candidateId, vacancyId, status]
                );
            }
        }
        console.log(`   ✓ Created ${links.length} candidate-vacancy links`);
        
        // Commit transaction
        await client.query('COMMIT');
        
        // Verify counts
        console.log('');
        console.log('📊 Verification:');
        const counts = await client.query(`
            SELECT 'Job Titles' as table_name, COUNT(*) as count FROM hrms_data.job_titles
            UNION ALL
            SELECT 'Employees', COUNT(*) FROM hrms_data.employees
            UNION ALL
            SELECT 'Vacancies', COUNT(*) FROM hrms_data.vacancies
            UNION ALL
            SELECT 'Candidates', COUNT(*) FROM hrms_data.candidates
            UNION ALL
            SELECT 'Candidate-Vacancy Links', COUNT(*) FROM hrms_data.candidate_vacancies
        `);
        
        counts.rows.forEach(row => {
            console.log(`   ${row.table_name}: ${row.count}`);
        });
        
        console.log('');
        console.log('✅ Sample data inserted successfully!');
        console.log('');
        console.log('Test your endpoints:');
        console.log('  http://localhost:3001/api/job-titles');
        console.log('  http://localhost:3001/api/vacancies');
        console.log('  http://localhost:3001/api/candidates');
        console.log('  http://localhost:3001/api/employees');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error inserting data:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run the script
insertSampleData().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});



