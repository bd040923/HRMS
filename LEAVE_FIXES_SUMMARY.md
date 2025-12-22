# Leave System Fixes & Enhancements

## Issues Fixed

### 1. ✅ Date Calculation Fix
**Problem:** Leave from 29 to 30 was calculating as 1 day instead of 2 days.

**Solution:**
- Changed from `Math.ceil()` to `Math.floor() + 1` for inclusive date calculation
- Updated in both frontend (`LeaveManagement.tsx`) and backend (`server.js`)
- Formula: `Math.floor((to_date - from_date) / (1000 * 60 * 60 * 24)) + 1`
- Example: Dec 29 to Dec 30 = 2 days (inclusive)

### 2. ✅ Business Rules Validation
**Implemented Rules:**
- **Casual Leave:** Maximum 8 days per year, maximum 2 days per month
- **Earned Leave:** Maximum 12 days per year
- **Continuous Leave Prevention:** Leaves cannot be taken continuously (must have gaps)

**Implementation:**
- Created `validate_leave_request()` database function
- Validates before inserting leave request
- Returns detailed error messages

### 3. ✅ Professional Leave Reports
**Features:**
- Employee-specific leave reports
- All employees report (admin only)
- Monthly breakdown
- Violation tracking
- Entitlement vs Used vs Balance
- Export to PDF functionality

**Access:**
- Route: `/leave/reports`
- Users: Can view their own report
- Admins: Can view all employees' reports

## Database Scripts to Run

### 1. Run Leave Report Functions
```sql
-- File: orangehrm/database/CREATE_LEAVE_REPORT_FUNCTION.sql
```
This creates:
- `get_employee_leave_report()` - Generates comprehensive reports
- `validate_leave_request()` - Validates business rules

### 2. Setup Default Entitlements
```sql
-- File: orangehrm/database/SETUP_LEAVE_ENTITLEMENTS.sql
```
This sets:
- 8 Casual Leaves per year for all employees
- 12 Earned Leaves per year for all employees

### 3. Complete Payroll Fix (if not already run)
```sql
-- File: orangehrm/database/COMPLETE_PAYROLL_FIX.sql
```

## How to Use

### For Users:
1. Navigate to **Leave** → **Apply Leave**
2. Select dates (29 to 30 = 2 days automatically calculated)
3. System validates:
   - Balance available
   - Max 2 casual leaves per month
   - No continuous leaves
4. Submit request

### For Admins:
1. **View Reports:**
   - Navigate to **Leave** → **Leave Reports** (or `/leave/reports`)
   - Select employee and year
   - Click "Generate Report"
   - Or click "All Employees" for company-wide report

2. **Report Shows:**
   - Entitlement (8 casual, 12 earned)
   - Used days
   - Balance
   - Monthly breakdown
   - Violations (if any)

## Validation Rules in Action

### Example 1: Casual Leave Limit
- Employee has 8 casual leave entitlement
- Already took 2 casual leaves in January
- Tries to take 1 more casual leave in January
- **Result:** ❌ Error: "Maximum 2 casual leaves per month exceeded"

### Example 2: Continuous Leave
- Employee took leave Dec 28-30
- Tries to take leave Dec 31-Jan 2
- **Result:** ❌ Error: "Leaves cannot be taken continuously. There must be a gap between leave periods."

### Example 3: Insufficient Balance
- Employee has 3 casual leaves remaining
- Tries to take 5 days casual leave
- **Result:** ❌ Error: "Insufficient balance. Available: 3 days, Requested: 5 days"

## API Endpoints

### Leave Reports
- `GET /api/leave-reports/employee/:employeeId?year=2025` - Single employee report
- `GET /api/leave-reports/all?year=2025` - All employees report

### Validation
- Automatically called when creating leave request
- `POST /api/leave-requests` - Includes validation

## Files Modified

1. **Frontend:**
   - `orangehrm/src/client/src/pages/LeaveManagement.tsx` - Fixed date calculation
   - `orangehrm/src/client/src/pages/LeaveReports.tsx` - New report page
   - `orangehrm/src/client/src/services/api.ts` - Added report endpoints
   - `orangehrm/src/client/src/App.tsx` - Added route

2. **Backend:**
   - `orangehrm/src/server/server.js` - Fixed date calculation, added validation, added report endpoints

3. **Database:**
   - `orangehrm/database/CREATE_LEAVE_REPORT_FUNCTION.sql` - Report functions
   - `orangehrm/database/SETUP_LEAVE_ENTITLEMENTS.sql` - Default entitlements

## Next Steps

1. **Run SQL Scripts:**
   ```sql
   -- Execute in order:
   1. CREATE_LEAVE_REPORT_FUNCTION.sql
   2. SETUP_LEAVE_ENTITLEMENTS.sql
   ```

2. **Restart Backend Server**

3. **Test:**
   - Apply leave from 29 to 30 (should show 2 days)
   - Try to take 3 casual leaves in one month (should be rejected)
   - Try continuous leaves (should be rejected)
   - Generate leave reports

## Report Features

- **Professional Format:** Clean, printable layout
- **Monthly Breakdown:** Shows which months leaves were taken
- **Violation Tracking:** Highlights policy violations
- **Balance Tracking:** Real-time entitlement vs used
- **Export:** Print/PDF functionality via browser

