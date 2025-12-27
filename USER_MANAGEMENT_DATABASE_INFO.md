# User Management - Database Information

## ✅ Status: FIXED AND CONNECTED TO DATABASE

The "Add" button in User Management is now **fully functional** and connected to the database.

## 📊 Database Location

### Table Name
**`hrms_data.users`**

### Database Details
- **Database**: `arithwise_hrms`
- **Schema**: `hrms_data`
- **Table**: `users`

### Table Structure
```sql
CREATE TABLE hrms_data.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'manager')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);
```

## 🔄 How It Works

### When You Click "+ Add":
1. **Frontend**: Opens modal form
2. **User fills in**: Username, Email, First Name, Last Name, Role, Password
3. **On Save**: Frontend calls `apiService.createUser()`
4. **Backend API**: `POST /api/users`
5. **Database**: Inserts new record into `hrms_data.users` table
6. **Password**: Automatically hashed using bcrypt before saving
7. **Response**: Returns the created user (without password)
8. **Frontend**: Updates the list to show the new user

### When You Edit a User:
1. **Frontend**: Opens modal with existing data
2. **On Save**: Frontend calls `apiService.updateUser(id, data)`
3. **Backend API**: `PUT /api/users/:id`
4. **Database**: Updates record in `hrms_data.users` table
5. **Password**: Only updated if provided (optional for edits)

### When You Delete a User:
1. **Frontend**: Shows confirmation dialog
2. **On Confirm**: Frontend calls `apiService.deleteUser(id)`
3. **Backend API**: `DELETE /api/users/:id`
4. **Database**: Sets `status = 'inactive'` (soft delete)

## 🔍 How to Verify Data in Database

### Using pgAdmin:
1. Connect to PostgreSQL
2. Navigate to: `arithwise_hrms` → `Schemas` → `hrms_data` → `Tables` → `users`
3. Right-click on `users` → "View/Edit Data" → "All Rows"
4. You'll see all users with their data

### Using SQL Query:
```sql
-- View all users
SELECT id, username, email, first_name, last_name, role, status, created_at 
FROM hrms_data.users 
ORDER BY created_at DESC;

-- View specific user
SELECT * FROM hrms_data.users WHERE username = 'your_username';

-- Count users
SELECT COUNT(*) as total_users FROM hrms_data.users;

-- View active users only
SELECT * FROM hrms_data.users WHERE status = 'active';
```

### Using API Endpoint:
- **GET** `http://localhost:3001/api/users`
- Returns JSON array of all users

## 📝 Field Mappings

| Frontend (React) | Backend API | Database Column |
|-----------------|-------------|-----------------|
| `username` | `username` | `username` |
| `email` | `email` | `email` |
| `password` | `password` | `password_hash` (hashed) |
| `firstName` | `first_name` | `first_name` |
| `lastName` | `last_name` | `last_name` |
| `role` | `role` | `role` |
| `status: 'enabled'` | `status: 'active'` | `status: 'active'` |
| `status: 'disabled'` | `status: 'inactive'` | `status: 'inactive'` |

## ✅ What Was Fixed

1. ✅ **Added API Integration**: Now uses `apiService.getUsers()`, `apiService.createUser()`, `apiService.updateUser()`, `apiService.deleteUser()`
2. ✅ **Added Loading State**: Shows "Loading users..." while fetching
3. ✅ **Added Error Handling**: Shows error message if API call fails
4. ✅ **Added Data Fetching**: Fetches users from database on page load
5. ✅ **Fixed Field Mapping**: Properly maps between frontend camelCase and backend snake_case
6. ✅ **Fixed Status Mapping**: Maps 'enabled'/'disabled' to 'active'/'inactive'

## 🧪 Testing

1. **Add a new user**:
   - Click "+ Add"
   - Fill in the form
   - Click "Save"
   - Check database: `SELECT * FROM hrms_data.users ORDER BY created_at DESC LIMIT 1;`

2. **Edit a user**:
   - Click edit icon (✏️)
   - Modify fields
   - Click "Save"
   - Check database: `SELECT * FROM hrms_data.users WHERE id = <user_id>;`

3. **Delete a user**:
   - Click delete icon (🗑️)
   - Confirm deletion
   - Check database: `SELECT * FROM hrms_data.users WHERE id = <user_id>;` (status should be 'inactive')

## 🔐 Security Notes

- Passwords are **hashed** using bcrypt before storing
- Password field is **never returned** in API responses
- Only admins can access this page (protected route)
- Status field prevents accidental permanent deletion (soft delete)



