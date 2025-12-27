/**
 * Quick script to check data in PostgreSQL
 * Run: node check-data.js
 */

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

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
        // Keep as-is
    }
}

const pool = new Pool(dbConfig);

async function checkData() {
    const client = await pool.connect();
    
    try {
        await client.query('SET search_path TO hrms_data, public');
        console.log('✅ Connected to database\n');
        
        // Count records
        console.log('📊 Record Counts:');
        console.log('─'.repeat(40));
        const counts = await client.query(`
            SELECT 'job_titles' as table_name, COUNT(*) as count FROM hrms_data.job_titles
            UNION ALL SELECT 'employees', COUNT(*) FROM hrms_data.employees
            UNION ALL SELECT 'vacancies', COUNT(*) FROM hrms_data.vacancies
            UNION ALL SELECT 'candidates', COUNT(*) FROM hrms_data.candidates
            UNION ALL SELECT 'candidate_vacancies', COUNT(*) FROM hrms_data.candidate_vacancies
            ORDER BY table_name
        `);
        
        counts.rows.forEach(row => {
            console.log(`   ${row.table_name.padEnd(20)} : ${row.count}`);
        });
        
        // Sample data
        console.log('\n📋 Sample Data:');
        console.log('─'.repeat(40));
        
        // Job Titles
        const jobTitles = await client.query('SELECT id, title, status FROM hrms_data.job_titles LIMIT 5');
        if (jobTitles.rows.length > 0) {
            console.log('\n   Job Titles:');
            jobTitles.rows.forEach(row => {
                console.log(`     ${row.id}. ${row.title} (${row.status})`);
            });
        }
        
        // Employees
        const employees = await client.query('SELECT id, employee_id, first_name, last_name FROM hrms_data.employees LIMIT 5');
        if (employees.rows.length > 0) {
            console.log('\n   Employees:');
            employees.rows.forEach(row => {
                console.log(`     ${row.employee_id}: ${row.first_name} ${row.last_name}`);
            });
        }
        
        // Vacancies
        const vacancies = await client.query('SELECT id, name, status FROM hrms_data.vacancies LIMIT 5');
        if (vacancies.rows.length > 0) {
            console.log('\n   Vacancies:');
            vacancies.rows.forEach(row => {
                console.log(`     ${row.id}. ${row.name} (${row.status})`);
            });
        }
        
        // Candidates
        const candidates = await client.query('SELECT id, first_name, last_name, status FROM hrms_data.candidates LIMIT 5');
        if (candidates.rows.length > 0) {
            console.log('\n   Candidates:');
            candidates.rows.forEach(row => {
                console.log(`     ${row.id}. ${row.first_name} ${row.last_name} (${row.status})`);
            });
        }
        
        console.log('\n✅ Data check complete!');
        console.log('\n💡 For more detailed queries, see CHECK_DATA.sql');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

checkData();



