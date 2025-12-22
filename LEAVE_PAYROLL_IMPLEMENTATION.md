# Leave Management & Payroll Calculation Implementation

## Overview
Implemented a comprehensive leave management system with 31-day month payroll calculation logic based on the "24-Day Rule".

## Database Changes Required

**Run this SQL script first:**
```sql
-- File: orangehrm/database/UPDATE_LEAVE_PAYROLL_SYSTEM.sql
```

This script:
1. ✅ Adds `is_paid` column to `leave_types` table
2. ✅ Adds `date_of_joining`, `profile`, `kyc` columns to `employees` table
3. ✅ Creates `work_week` configuration table
4. ✅ Creates `leave_entitlements` table
5. ✅ Creates `calculate_payable_days()` function
6. ✅ Inserts "Unpaid Leave" and "LWP" leave types
7. ✅ Sets default work week (Monday-Friday, excludes Sunday)

## Calculation Logic (Dynamic Month Calculation)

### Base Calculation (Fully Dynamic):
- **Total Month Days**: Calculated dynamically based on actual month (28, 29, 30, or 31 days)
  - Handles leap years automatically (February 29 days)
  - Works for any month of any year
- **Off Days**: Counted dynamically based on Work Week configuration
  - Pulls from `work_week` table (Sunday, Saturday, etc.)
  - Automatically adapts if Work Week changes (e.g., Saturday-Sunday off)
- **Public Holidays**: Deducted from holidays table (only full-day holidays)
  - Excludes holidays that fall on off days (no double counting)
- **Working Days Base**: `Total Days - Off Days - Holidays`
  - Example for January 2025 (31 days, 5 Sundays, 1 holiday): `31 - 5 - 1 = 25 days`
  - Example for February 2025 (28 days, 4 Sundays, 0 holidays): `28 - 4 - 0 = 24 days`

### Leave Impact:
- **Paid Leaves** (Casual, Earned, Sick): 
  - Deduct from entitlement balance
  - **DO NOT** deduct from 25-day base (employee still gets paid)
  
- **Unpaid Leaves** (Unpaid Leave, LWP):
  - Deduct from the 25-day base
  - Reduces payable days for salary calculation

### Final Payable Days:
```
Payable Days = 25 (Working Days) - Unpaid Leave Days
Example: 25 - 1 = 24 days
```

## Features Implemented

### 1. Leave Types Management
- ✅ Added "Unpaid Leave" and "LWP" leave types
- ✅ Added `is_paid` flag to distinguish paid vs unpaid leaves
- ✅ UI shows Paid/Unpaid status in Leave Types table
- ✅ Modal includes checkbox to mark leave as paid/unpaid

### 2. Work Week Configuration
- ✅ Admin can configure which days are working days
- ✅ Default: Monday-Friday working, Saturday-Sunday non-working
- ✅ Sundays automatically excluded from calculation
- ✅ Accessible via: Leave > Configure > Work Week

### 3. Leave List with Payroll Data
- ✅ Shows "Working Days" for the month
- ✅ Shows "Unpaid Leave" days (highlighted in red)
- ✅ Shows "Payable Days" (final calculation, highlighted in purple)
- ✅ Shows leave type with "(Unpaid)" indicator for unpaid leaves
- ✅ Admin can approve/reject leave requests

### 4. Employee Fields
- ✅ `date_of_joining` (DOJ) - Date field
- ✅ `profile` - JSONB field for flexible profile data
- ✅ `kyc` - JSONB field for KYC documents

### 5. Leave Entitlements Tracking
- ✅ Tracks entitlement days per leave type per employee
- ✅ Tracks used days
- ✅ Calculates balance automatically
- ✅ API endpoints for CRUD operations

## API Endpoints Added

### Work Week
- `GET /api/work-week` - Get work week configuration
- `POST /api/work-week` - Create work week configuration
- `PUT /api/work-week/:id` - Update work week configuration

### Payable Days
- `GET /api/payable-days?employee_id=X&month=YYYY-MM-DD` - Calculate payable days

### Leave Entitlements
- `GET /api/leave-entitlements?employee_id=X` - Get entitlements
- `POST /api/leave-entitlements` - Create entitlement
- `PUT /api/leave-entitlements/:id` - Update entitlement

### Updated Endpoints
- `GET /api/leave-requests` - Now includes payable days calculation
- `POST /api/leave-types` - Now accepts `is_paid` parameter
- `PUT /api/leave-types/:id` - Now accepts `is_paid` parameter

## How to Use

### Step 1: Run Database Script
```powershell
# In pgAdmin or psql, run:
orangehrm\database\UPDATE_LEAVE_PAYROLL_SYSTEM.sql
```

### Step 2: Configure Work Week
1. Go to Leave > Configure > Work Week
2. Uncheck "Sunday" (and Saturday if needed)
3. Click "Save"

### Step 3: Add Unpaid Leave Type (if not auto-created)
1. Go to Leave > Configure > Leave Types
2. Click "+ Add"
3. Name: "Unpaid Leave" or "LWP"
4. **Uncheck "Paid Leave" checkbox**
5. Click "Save"

### Step 4: View Payable Days
1. Go to Leave > Leave List (Admin only)
2. View the table columns:
   - **Working Days**: Base working days for the month (25 days)
   - **Unpaid Leave**: Days of unpaid leave taken
   - **Payable Days**: Final payable days (25 - unpaid leave)

## Database Function

The `calculate_payable_days()` function (fully dynamic):
- Takes month date and employee_id
- **Dynamically calculates total days** in the month (handles 28, 29, 30, 31 days)
- **Pulls Work Week configuration** from database to determine off days
- **Counts actual off days** in that specific month (not hardcoded)
- Calculates working days base: `Total Days - Off Days - Holidays`
- Sums unpaid leave days for the month (handles multi-month spans)
- Returns: `payable_days = working_days - unpaid_leave_days`

**Key Features:**
- ✅ No hardcoded values (no "31" or "25" assumptions)
- ✅ Handles leap years automatically
- ✅ Adapts to Work Week changes (if you switch to Saturday-Sunday off, it updates automatically)
- ✅ Excludes holidays that fall on off days (no double counting)

## Example Calculations

### Example 1: January 2025 (31 days)
- **Total Days**: 31 (calculated dynamically)
- **Off Days**: 5 Sundays (counted from Work Week config)
- **Holidays**: 1 day (New Year's Day, if it falls on a working day)
- **Working Days Base**: 31 - 5 - 1 = 25 days

**Employee takes**:
- 2 days Casual Leave (Paid) → No salary deduction
- 1 day Unpaid Leave → Deducts from 25 days

**Result**:
- **Payable Days**: 25 - 1 = 24 days
- **Entitlement Balance**: Casual Leave reduced by 2 days

### Example 2: February 2025 (28 days, non-leap year)
- **Total Days**: 28 (calculated dynamically)
- **Off Days**: 4 Sundays (counted from Work Week config)
- **Holidays**: 0 days
- **Working Days Base**: 28 - 4 - 0 = 24 days

**Employee takes**:
- 1 day Unpaid Leave

**Result**:
- **Payable Days**: 24 - 1 = 23 days

### Example 3: February 2024 (29 days, leap year)
- **Total Days**: 29 (calculated dynamically, leap year)
- **Off Days**: 4 Sundays
- **Holidays**: 0 days
- **Working Days Base**: 29 - 4 - 0 = 25 days

### Example 4: If Work Week changes to Saturday-Sunday off
- System automatically recalculates off days
- If January has 5 Saturdays + 5 Sundays = 10 off days
- **Working Days Base**: 31 - 10 - 1 = 20 days

## Testing

1. Create a leave request with "Unpaid Leave"
2. Approve it
3. View in Leave List
4. Check "Payable Days" column shows correct calculation

## Notes

- The calculation uses the month of the leave request's `from_date`
- Sundays are automatically counted based on the calendar
- Holidays are pulled from the `holidays` table
- Only approved/taken/scheduled unpaid leaves affect payable days
- Paid leaves (Casual, Earned, Sick) don't affect payable days

