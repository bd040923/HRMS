# Leave Business Rules Implementation

## Overview
This document describes the business rules implemented for leave management, specifically for Casual Leave.

## Business Rules

### 1. Casual Leave Annual Limit
- **Rule**: Employees can take a maximum of **8 days** of Casual Leave per year
- **Auto-Conversion**: If an employee exceeds the 8-day annual limit, the excess leave is automatically converted to **Unpaid Leave**
- **Implementation**: 
  - Validated in `validate_leave_request()` database function
  - Backend automatically converts to Unpaid Leave type if limit exceeded
  - User receives a warning message when conversion occurs

### 2. Casual Leave Monthly Limit
- **Rule**: Employees can take a maximum of **2 leave requests** per month (not days, but number of requests)
- **Example**: 
  - ✅ Allowed: 2 requests of 1 day each = 2 requests
  - ❌ Not Allowed: 3 requests of 1 day each = 3 requests (exceeds limit)
- **Implementation**: 
  - Counts the number of leave requests (not total days) in the month
  - Includes pending, approved, scheduled, and taken leaves
  - Validation happens before leave request is created

### 3. No Continuous Leaves
- **Rule**: Employees cannot take leaves in a continuous/consecutive manner
- **Requirement**: There must be at least **one working day gap** between leave periods
- **Examples**:
  - ❌ Not Allowed: Leave on Jan 7-9, then leave on Jan 10 (no gap)
  - ❌ Not Allowed: Leave on Jan 7-9, then leave on Jan 6 (overlaps)
  - ✅ Allowed: Leave on Jan 7-9, then leave on Jan 11+ (has gap)
- **Implementation**: 
  - Checks for overlapping dates
  - Checks for consecutive dates (no gap)
  - Applies to all leave types

## Database Function

### `validate_leave_request()`
Located in: `orangehrm/database/UPDATE_LEAVE_VALIDATION_RULES.sql`

**Parameters:**
- `p_employee_id`: Employee ID
- `p_leave_type_id`: Leave Type ID
- `p_from_date`: Start date
- `p_to_date`: End date
- `p_number_of_days`: Number of days

**Returns:**
```json
{
  "valid": true/false,
  "errors": [...],
  "auto_convert_to_unpaid": true/false,
  "suggested_leave_type_id": <unpaid_leave_type_id>,
  "warnings": [...]
}
```

## Backend Implementation

### Auto-Conversion Logic
When a Casual Leave request exceeds the annual limit:
1. Validation function returns `auto_convert_to_unpaid: true`
2. Backend automatically changes `leave_type_id` to Unpaid Leave type
3. Leave request is created as Unpaid Leave
4. Response includes conversion information

**Location**: `orangehrm/src/server/server.js` (POST `/api/leave-requests`)

## Frontend Implementation

### User Experience
- When leave is auto-converted, user sees a warning message:
  ```
  Leave request submitted successfully!
  
  ⚠️ Note: Annual casual leave limit (8 days) exceeded. 
  This leave has been converted to Unpaid Leave.
  ```

**Location**: `orangehrm/src/client/src/pages/LeaveManagement.tsx` (`handleApplyLeave`)

## SQL Setup

To apply these rules, run:
```sql
\i orangehrm/database/UPDATE_LEAVE_VALIDATION_RULES.sql
```

## Testing Scenarios

### Scenario 1: Annual Limit Exceeded
1. Employee has taken 7 days of Casual Leave
2. Employee requests 2 more days
3. **Result**: First day is approved as Casual Leave, second day is auto-converted to Unpaid Leave

### Scenario 2: Monthly Limit Exceeded
1. Employee has taken 2 Casual Leave requests in January
2. Employee requests a 3rd Casual Leave in January
3. **Result**: Request is rejected with error: "Maximum 2 casual leave requests per month exceeded"

### Scenario 3: Continuous Leaves
1. Employee has leave on Jan 7-9
2. Employee requests leave on Jan 10
3. **Result**: Request is rejected with error: "Leaves cannot be taken continuously. There must be at least one working day gap between leave periods"

## Notes

- The monthly limit counts **requests**, not **days**
- The annual limit counts **days**, not requests
- Auto-conversion only works if an "Unpaid Leave" or "LWP" leave type exists in the system
- Continuous leave check applies to all leave types, not just Casual Leave

