# ⚠️ CRITICAL: Leave Validation Setup Required

## Problem
You're seeing that you can apply unlimited leaves without restrictions. This is because the validation function is **not installed** in your database yet.

## Solution
You **MUST** run the SQL script to install the validation function. Without it, the system will **reject all leave requests** (this is by design for security).

## Steps to Fix

### 1. Connect to PostgreSQL
```bash
psql -U your_username -d your_database_name
```

Or use pgAdmin or any PostgreSQL client.

### 2. Run the Validation Function Script
```sql
\i orangehrm/database/UPDATE_LEAVE_VALIDATION_RULES.sql
```

Or copy and paste the entire contents of `UPDATE_LEAVE_VALIDATION_RULES.sql` into your SQL client and execute it.

### 3. Verify Installation
Run this query to check if the function exists:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'hrms_data' 
AND routine_name = 'validate_leave_request';
```

You should see `validate_leave_request` in the results.

### 4. Test the Function
```sql
-- Replace with actual employee_id and leave_type_id from your database
SELECT hrms_data.validate_leave_request(
    1,  -- employee_id (replace with actual)
    1,  -- leave_type_id for Casual Leave (replace with actual)
    '2026-01-15'::DATE,
    '2026-01-20'::DATE,
    6   -- number_of_days
) as validation_result;
```

## What Happens After Installation

Once the validation function is installed:

1. ✅ **Annual Limit (8 days)**: Casual leaves exceeding 8 days/year will auto-convert to Unpaid Leave
2. ✅ **Monthly Limit (2 requests)**: Maximum 2 casual leave requests per month
3. ✅ **No Continuous Leaves**: Leaves cannot be taken consecutively (must have gap)
4. ✅ **Proper Error Messages**: Clear error messages when rules are violated

## Current Behavior

**BEFORE** running the script:
- ❌ All leave requests are **REJECTED** with error: "Leave validation system is not configured"
- ❌ You cannot apply for any leaves

**AFTER** running the script:
- ✅ Validation rules are enforced
- ✅ Auto-conversion to Unpaid Leave works
- ✅ Clear error messages for violations

## Files to Run

1. **Primary**: `orangehrm/database/UPDATE_LEAVE_VALIDATION_RULES.sql`
2. **Check**: `orangehrm/database/CHECK_VALIDATION_FUNCTION.sql` (optional, for verification)

## Important Notes

- The validation function **must** exist in the `hrms_data` schema
- The function name is: `hrms_data.validate_leave_request`
- Without this function, **NO leave requests will be processed** (security measure)
- Make sure you have an "Unpaid Leave" or "LWP" leave type for auto-conversion to work

## Troubleshooting

If you get errors when running the script:

1. **Permission Error**: Make sure your database user has CREATE FUNCTION permission
2. **Schema Error**: Make sure the `hrms_data` schema exists
3. **Syntax Error**: Check PostgreSQL version (should be 9.5+)

If issues persist, check the server console logs for detailed error messages.



