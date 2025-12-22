# Leave Types Setup - CL and EL Only

## Overview
The system now maintains only **2 leave types**:
1. **Casual Leave (CL)** - Includes Sick Leave (no separate SL)
2. **Earned Leave / Privilege Leave (EL)**

## Setup Instructions

### Step 1: Run the SQL Script
```sql
\i orangehrm/database/SETUP_TWO_LEAVE_TYPES.sql
```

This script will:
- Deactivate all existing leave types
- Create/Update **Casual Leave (CL)** with description: "Can be used for personal reasons or illness. Includes Sick Leave."
- Create/Update **Earned Leave (EL)** with description: "Accumulated leave based on service period."
- Set both as `is_paid = true` (paid leaves)
- Set both as `status = 'active'`

### Step 2: Verify Setup
```sql
SELECT id, name, description, entitlement_days, is_paid, status
FROM hrms_data.leave_types
WHERE status = 'active'
ORDER BY name;
```

Expected output:
```
 id |      name      |                    description                     | entitlement_days | is_paid | status
----+----------------+---------------------------------------------------+------------------+---------+--------
  1 | Casual Leave   | Casual Leave (CL) - Can be used for personal...  |                8 | t       | active
  2 | Earned Leave   | Earned Leave / Privilege Leave (EL) - Accum...   |               12 | t       | active
```

## Key Points

### Casual Leave (CL)
- ✅ Can be used for **personal reasons** OR **illness**
- ✅ **Includes Sick Leave** (no separate SL type)
- ✅ Paid leave (`is_paid = true`)
- ✅ Default entitlement: **8 days** per year
- ✅ Deducts from entitlement balance but **NOT** from payable days

### Earned Leave (EL)
- ✅ Also called **Privilege Leave**
- ✅ Accumulated based on service period
- ✅ Paid leave (`is_paid = true`)
- ✅ Default entitlement: **12 days** per year
- ✅ Deducts from entitlement balance but **NOT** from payable days

## Employee Application Rules

✅ **Employees can ONLY apply for:**
- Casual Leave (CL)
- Earned Leave (EL)

❌ **Employees CANNOT apply for:**
- Sick Leave (use CL instead)
- Unpaid Leave / LWP (not available)
- Any other leave types

## Backend Filtering

The API endpoint `/api/leave-types` automatically filters to return only CL and EL:
```javascript
// Backend automatically filters to only return:
// - Leave types with name containing "casual"
// - Leave types with name containing "earned" or "privilege"
// - Only active status
```

## Frontend Filtering

The frontend also applies an additional filter to ensure only CL and EL are shown:
```typescript
const activeLeaveTypes = (typesData || []).filter((type: any) => 
  type.status === 'active' && 
  (type.name.toLowerCase().includes('casual') || 
   type.name.toLowerCase().includes('earned') ||
   type.name.toLowerCase().includes('privilege'))
);
```

## Monthly Summary

The monthly leave summary function (`get_monthly_leave_summary`) correctly calculates:
- `cl_used` - Casual Leave days used (includes any sick leave taken as CL)
- `el_used` - Earned Leave days used
- `lwp_used` - Will be 0 (no unpaid leave types available)

## Notes

- **Sick Leave is NOT a separate type** - employees use Casual Leave for illness
- Both CL and EL are **paid leaves** - they don't reduce payable days
- The system is configured to **only show CL and EL** in all dropdowns
- All other leave types are hidden/deactivated

