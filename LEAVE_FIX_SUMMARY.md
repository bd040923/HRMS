# Leave Management Fix Summary

## Issue
Error: `null value in column "employee_id" of relation "leave_requests" violates not-null constraint`

## Fixes Applied

### 1. Backend (`server.js`)
- ✅ Added automatic employee record creation if user doesn't have one
- ✅ Added comprehensive error handling and logging
- ✅ Added validation to ensure `employee_id` is always set before INSERT
- ✅ Fixed SQL query for creating employee records
- ✅ Added type conversion (parseInt) for employee_id

### 2. Frontend (`LeaveManagement.tsx`)
- ✅ Added user login validation
- ✅ Added console logging for debugging
- ✅ Improved error message handling

## Important: Restart Required

**You MUST restart the backend server for changes to take effect:**

```powershell
# Stop the current server (Ctrl+C)
# Then restart:
cd orangehrm\src\server
npm start
```

## How It Works Now

1. User applies for leave → Frontend sends `user_id`
2. Backend checks if user has an employee record:
   - ✅ If found → Uses that `employee_id`
   - ✅ If NOT found → **Automatically creates** an employee record
3. Uses the `employee_id` to create leave request

## Verification Steps

### 1. Check Server Logs
After restarting, when you apply for leave, you should see in the server console:
```
Leave request received: { user_id: X, leave_type_id: Y, ... }
Found employee_id: Z for user_id: X
OR
Created employee record with id: Z
Using employee_id: Z for leave request
Inserting leave request with: { employee_id: Z, ... }
Leave request created successfully: [id]
```

### 2. Check Database
Run this SQL to verify your user has an employee record:
```sql
-- Check if user has employee record
SELECT u.id as user_id, u.username, e.id as employee_id, e.first_name, e.last_name
FROM hrms_data.users u
LEFT JOIN hrms_data.employees e ON u.id = e.user_id
WHERE u.id = [YOUR_USER_ID];
```

### 3. Test Leave Application
1. Log in as a user
2. Go to Leave > Apply
3. Fill in the form and click "Apply"
4. Check browser console for any errors
5. Check server console for detailed logs

## If Error Persists

### Check 1: Is user_id being sent?
Open browser console (F12) and check the log:
```
Applying leave with: { user_id: X, ... }
```

### Check 2: Check server logs
Look for these messages:
- `Leave request received:` - Should show user_id
- `Found employee_id:` OR `Created employee record with id:`
- `Using employee_id:` - Should show a number

### Check 3: Verify employees table structure
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'hrms_data'
AND table_name = 'employees'
ORDER BY ordinal_position;
```

### Check 4: Verify user exists
```sql
SELECT id, username, first_name, last_name, email
FROM hrms_data.users
WHERE id = [YOUR_USER_ID];
```

## Common Issues

### Issue: "user_id is undefined"
**Solution:** Make sure you're logged in. Check `user?.id` in browser console.

### Issue: "employees table doesn't have user_id column"
**Solution:** Run the schema creation script to ensure the table has the correct structure.

### Issue: "Employee creation fails"
**Solution:** Check server logs for the exact SQL error. The employee table might have required fields that aren't being set.

## Next Steps

1. ✅ Restart the backend server
2. ✅ Try applying for leave again
3. ✅ Check server console logs for detailed information
4. ✅ If still failing, share the server console logs for debugging

