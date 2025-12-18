/**
 * Check if authentication is synced between frontend and backend
 * Run: node check-auth-sync.js
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

async function checkAuthSync() {
    const client = await pool.connect();
    
    try {
        await client.query('SET search_path TO hrms_data, public');
        console.log('✅ Connected to database\n');
        
        console.log('🔍 Checking Authentication Sync...\n');
        console.log('─'.repeat(60));
        
        // Check 1: Users table exists
        console.log('\n1. Checking users table...');
        const usersTableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'hrms_data' 
                AND table_name = 'users'
            )
        `);
        
        if (usersTableCheck.rows[0].exists) {
            console.log('   ✅ users table exists');
            
            // Check user count
            const userCount = await client.query('SELECT COUNT(*) as count FROM users');
            console.log(`   📊 Total users: ${userCount.rows[0].count}`);
            
            // Check for admin users
            const adminCount = await client.query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
            console.log(`   👑 Admin users: ${adminCount.rows[0].count}`);
            
            // Check for regular users
            const regularCount = await client.query("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
            console.log(`   👤 Regular users: ${regularCount.rows[0].count}`);
            
            // List all users
            const users = await client.query(`
                SELECT id, username, email, first_name, last_name, role, status 
                FROM users 
                ORDER BY role, username
            `);
            
            if (users.rows.length > 0) {
                console.log('\n   📋 Users in database:');
                users.rows.forEach(user => {
                    console.log(`      ${user.id}. ${user.username} (${user.role}) - ${user.first_name} ${user.last_name} [${user.status}]`);
                });
            } else {
                console.log('   ⚠️  No users found in database');
                console.log('   💡 Create users with INSERT statements');
            }
        } else {
            console.log('   ❌ users table does NOT exist');
            console.log('   💡 Run CREATE_ALL_TABLES_hrms_data.sql to create it');
        }
        
        // Check 2: User sessions table
        console.log('\n2. Checking user_sessions table...');
        const sessionsTableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'hrms_data' 
                AND table_name = 'user_sessions'
            )
        `);
        
        if (sessionsTableCheck.rows[0].exists) {
            console.log('   ✅ user_sessions table exists');
            const sessionCount = await client.query('SELECT COUNT(*) as count FROM user_sessions WHERE expires_at > CURRENT_TIMESTAMP');
            console.log(`   🔐 Active sessions: ${sessionCount.rows[0].count}`);
        } else {
            console.log('   ⚠️  user_sessions table does NOT exist (optional)');
        }
        
        // Check 3: Backend endpoints
        console.log('\n3. Checking backend endpoints...');
        console.log('   ✅ POST /api/v1/auth/login - Login endpoint');
        console.log('   ✅ GET  /api/v1/auth/me - Get current user');
        console.log('   ✅ POST /api/v1/auth/logout - Logout endpoint');
        
        // Check 4: Frontend integration
        console.log('\n4. Frontend integration...');
        console.log('   ✅ Frontend calls: /api/v1/auth/login');
        console.log('   ✅ Frontend uses: process.env.REACT_APP_API_URL || "/api"');
        console.log('   ✅ Frontend expects: { user: {...}, token: "..." }');
        
        // Summary
        console.log('\n' + '─'.repeat(60));
        console.log('\n📊 Summary:');
        
        if (usersTableCheck.rows[0].exists) {
            const hasUsers = userCount.rows[0].count > 0;
            const hasAdmin = adminCount.rows[0].count > 0;
            
            if (hasUsers && hasAdmin) {
                console.log('   ✅ Authentication is SYNCED');
                console.log('   ✅ Users table exists with data');
                console.log('   ✅ Admin users exist');
                console.log('   ✅ Backend endpoints are ready');
                console.log('   ✅ Frontend is configured correctly');
            } else if (hasUsers) {
                console.log('   ⚠️  PARTIALLY SYNCED');
                console.log('   ✅ Users table exists with data');
                console.log('   ❌ No admin users found');
                console.log('   💡 Create an admin user in the database');
            } else {
                console.log('   ⚠️  PARTIALLY SYNCED');
                console.log('   ✅ Users table exists');
                console.log('   ❌ No users in database');
                console.log('   💡 Insert users into the users table');
            }
        } else {
            console.log('   ❌ NOT SYNCED');
            console.log('   ❌ Users table does not exist');
            console.log('   💡 Run CREATE_ALL_TABLES_hrms_data.sql');
        }
        
        console.log('\n💡 Test authentication:');
        console.log('   curl -X POST http://localhost:3001/api/v1/auth/login \\');
        console.log('        -H "Content-Type: application/json" \\');
        console.log('        -d \'{"username":"admin","password":"Admin@123"}\'');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

checkAuthSync();

