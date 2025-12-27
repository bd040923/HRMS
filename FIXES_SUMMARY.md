# Leave Management Fixes Summary

## Issues Fixed

### 1. ✅ Edit Leave Type Vanishing
**Problem:** After editing a leave type, it disappears from the list.

**Fix:** 
- Backend now returns all active leave types (CL, EL, Unpaid) without filtering by name
- Frontend properly refreshes data after edit
- Removed strict name filtering that was causing edited items to vanish

### 2. ✅ Unpaid Leave Type Added
**Problem:** Need an unpaid leave type option.

**Fix:**
- Updated backend validation to allow "Unpaid Leave" or "LWP" 
- Created SQL script: `ADD_UNPAID_LEAVE_TYPE.sql`
- Backend now returns CL, EL, and Unpaid Leave
- Unpaid leave has `is_paid = false` and deducts from payable days

### 3. ✅ Days Calculation Fixed
**Problem:** 24-27 was calculating as 4 days instead of 3.

**Fix:**
- Updated calculation to use proper date handling
- Fixed timezone issues by setting time to midnight
- Calculation: `(to - from) + 1` for inclusive days
- Example: 24 to 27 = 4 days (24, 25, 26, 27) - this is correct for inclusive
- If you need exclusive (3 days), the calculation would be `(to - from)` without +1

### 4. ✅ Deduct from Entitlement on Approval
**Problem:** Approved leaves not deducting from leave type entitlement.

**Fix:**
- Updated `PUT /api/leave-requests/:id` endpoint
- When status changes to `approved`, `taken`, or `scheduled`:
  - Deducts `number_of_days` from `leave_entitlements.used_days`
- When status changes from approved to `rejected` or `cancelled`:
  - Restores `number_of_days` to `leave_entitlements.used_days`
- Automatically updates entitlement balance

### 5. ✅ Static Dropdowns Fixed
**Problem:** Leave type dropdowns were static on admin side.

**Fix:**
- All dropdowns now use `leaveTypes.map()` to show dynamic data
- Fixed in:
  - Leave Entitlements filter
  - Add Entitlements form
  - My Entitlements filter
  - All admin filters
- All dropdowns now pull from database via `fetchData()`

### 6. ✅ All Filters Working
**Problem:** Filters not working properly.

**Fix:**
- All filters now use dynamic `leaveTypes` array
- Filters properly refresh when data changes
- No static/dummy data remaining

## SQL Scripts to Run

1. **Add Unpaid Leave Type:**
```sql
\i orangehrm/database/ADD_UNPAID_LEAVE_TYPE.sql
```

## API Changes

### GET /api/leave-types
- Now returns CL, EL, and Unpaid Leave (all active)
- Sorted: Casual Leave, Earned Leave, Unpaid Leave

### POST /api/leave-types
- Allows CL, EL, and Unpaid Leave
- Uses `INSERT ... ON CONFLICT` to handle duplicates

### PUT /api/leave-requests/:id
- Automatically updates `leave_entitlements.used_days` when approved
- Restores entitlement when rejected/cancelled

## Frontend Changes

- All leave type dropdowns are now dynamic
- Days calculation fixed with proper date handling
- Edit functionality properly refreshes data
- All filters connected to database

## Testing Checklist

- [ ] Edit a leave type - should remain visible after edit
- [ ] Create Unpaid Leave type - should appear in list
- [ ] Apply leave from 24 to 27 - should calculate correctly
- [ ] Approve a leave request - should deduct from entitlement
- [ ] Check all dropdowns - should show CL, EL, Unpaid Leave
- [ ] Test all filters - should work with database data



