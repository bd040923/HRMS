# Database Setup Guide

## Overview
This HRMS system requires a MySQL/MariaDB database. The schema includes tables for users, authentication, permissions, and HR data.

## Database Setup Steps

### 1. Create Database
```sql
CREATE DATABASE arithwise_hrm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE arithwise_hrm;
```

### 2. Run Schema
```bash
mysql -u your_username -p arithwise_hrm < schema.sql
```

### 3. Default Credentials
After running the schema, you'll have:
- **Admin**: username: `admin`, password: `Admin@123` (change in production!)
- **User**: username: `user`, password: `User@123` (change in production!)

### 4. Environment Variables
Update your backend `.env` file:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=arithwise_hrm
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

## Tables Created

1. **users** - User accounts and authentication
2. **password_reset_tokens** - Password reset functionality
3. **user_sessions** - Session management
4. **permissions** - System permissions
5. **role_permissions** - Role-based access control
6. **employees** - Employee records
7. **departments** - Department information

## Security Notes

⚠️ **IMPORTANT**: 
- Change default passwords immediately in production
- Use strong password hashing (bcrypt recommended)
- Implement rate limiting on login attempts
- Use HTTPS in production
- Regularly update and patch your database

