# Leave Application & Approval Flow

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    REGULAR USER APPLIES FOR LEAVE                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. User fills form in "Apply Leave" section                    │
│    - Selects Leave Type (Casual, Earned, Sick, Unpaid, etc.)    │
│    - Enters From Date                                           │
│    - Enters To Date                                             │
│    - (Optional) Adds Comments                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. User clicks "Apply" button                                  │
│    → handleApplyLeave() function executes                      │
│    → Validates required fields                                  │
│    → Calculates number_of_days (to_date - from_date + 1)        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Frontend API Call                                            │
│    apiService.createLeaveRequest({                              │
│      user_id: user.id,                                          │
│      leave_type_id: selectedType,                               │
│      from_date: '2025-01-15',                                   │
│      to_date: '2025-01-17',                                     │
│      number_of_days: 3,                                         │
│      comments: 'Family emergency'                               │
│    })                                                            │
│    → POST /api/leave-requests                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Backend Processing (server.js)                               │
│    POST /api/leave-requests                                     │
│                                                                  │
│    Step 4.1: Resolve Employee ID                                │
│    ├─ Check if employee_id provided → Use it                    │
│    ├─ If user_id provided:                                      │
│    │  ├─ Query: SELECT id FROM employees WHERE user_id = $1     │
│    │  ├─ If found → Use employee_id                            │
│    │  ├─ If not found, check by email                           │
│    │  └─ If still not found → Create new employee record        │
│    └─ If no employee record exists → Return error               │
│                                                                  │
│    Step 4.2: Validate Data                                      │
│    ├─ Check: leave_type_id, from_date, to_date, number_of_days   │
│    └─ Convert to integers where needed                          │
│                                                                  │
│    Step 4.3: Insert Leave Request                               │
│    INSERT INTO hrms_data.leave_requests (                       │
│      employee_id,                                               │
│      leave_type_id,                                             │
│      from_date,                                                 │
│      to_date,                                                    │
│      number_of_days,                                            │
│      comments,                                                   │
│      applied_by,                                                 │
│      status                                                      │
│    ) VALUES (...)                                                │
│    → Default status: 'pending'                                   │
│    → applied_by: employee_id                                    │
│    → date_applied: CURRENT_TIMESTAMP                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Database Record Created                                      │
│    hrms_data.leave_requests table:                              │
│    ┌──────────────────────────────────────────────────────┐    │
│    │ id: 1                                                 │    │
│    │ employee_id: 5                                        │    │
│    │ leave_type_id: 2 (Casual Leave)                      │    │
│    │ from_date: '2025-01-15'                               │    │
│    │ to_date: '2025-01-17'                                 │    │
│    │ number_of_days: 3                                     │    │
│    │ status: 'pending' ← WAITING FOR APPROVAL              │    │
│    │ comments: 'Family emergency'                          │    │
│    │ applied_by: 5                                         │    │
│    │ date_applied: '2025-01-10 10:30:00'                  │    │
│    │ approved_by: NULL                                    │    │
│    │ approved_date: NULL                                  │    │
│    └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. Response to Frontend                                        │
│    → Success: 201 Created                                       │
│    → Returns leave request object with id                       │
│    → Frontend shows: "Leave request submitted successfully!"   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN VIEWS LEAVE LIST                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. Admin navigates to "Leave" → "Leave List"                    │
│    → Only visible to admin users (isAdmin() check)             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. Frontend fetches all leave requests                          │
│    apiService.getLeaveRequests()                                │
│    → GET /api/leave-requests                                    │
│    → No user_id filter (admin sees all)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 9. Backend Query (server.js)                                    │
│    GET /api/leave-requests                                      │
│                                                                  │
│    SELECT lr.*,                                                 │
│           e.first_name || ' ' || e.last_name as employee_name, │
│           lt.name as leave_type_name,                           │
│           lt.is_paid,                                           │
│           DATE_TRUNC('month', lr.from_date) as leave_month       │
│    FROM hrms_data.leave_requests lr                             │
│    JOIN hrms_data.employees e ON lr.employee_id = e.id         │
│    JOIN hrms_data.leave_types lt ON lr.leave_type_id = lt.id    │
│    ORDER BY lr.date_applied DESC                                │
│                                                                  │
│    → For each request, also calculates payable days:            │
│      calculate_payable_days(leave_month, employee_id)            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 10. Admin sees table with all pending requests                  │
│     Columns:                                                    │
│     - Date (from_date - to_date)                                │
│     - Employee Name                                             │
│     - Leave Type                                                │
│     - Days                                                      │
│     - Status (pending/approved/rejected)                        │
│     - Working Days (Base)                                       │
│     - Unpaid Leave                                              │
│     - Payable Days                                              │
│     - Actions (Approve/Reject buttons)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN APPROVES/REJECTS                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 11. Admin clicks "Approve" or "Reject" button                  │
│     → Confirmation dialog appears                               │
│     → Admin confirms action                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 12. Frontend API Call                                           │
│     apiService.updateLeaveRequest(requestId, {                  │
│       status: 'approved'  // or 'rejected'                      │
│     })                                                          │
│     → PUT /api/leave-requests/:id                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 13. Backend Processing (server.js)                             │
│     PUT /api/leave-requests/:id                                 │
│                                                                  │
│     UPDATE hrms_data.leave_requests                             │
│     SET status = 'approved',                                    │
│         approved_by = employee_id,  // (from admin's session)   │
│         approved_date = CURRENT_TIMESTAMP,                      │
│         updated_at = CURRENT_TIMESTAMP                          │
│     WHERE id = :id                                              │
│                                                                  │
│     → Returns updated leave request                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 14. Database Record Updated                                    │
│     hrms_data.leave_requests table:                            │
│     ┌──────────────────────────────────────────────────────┐    │
│     │ id: 1                                                 │    │
│     │ employee_id: 5                                        │    │
│     │ leave_type_id: 2                                       │    │
│     │ from_date: '2025-01-15'                               │    │
│     │ to_date: '2025-01-17'                                 │    │
│     │ number_of_days: 3                                     │    │
│     │ status: 'approved' ← APPROVED!                         │    │
│     │ comments: 'Family emergency'                          │    │
│     │ applied_by: 5                                         │    │
│     │ date_applied: '2025-01-10 10:30:00'                  │    │
│     │ approved_by: 1  ← Admin's employee_id                │    │
│     │ approved_date: '2025-01-10 14:45:00'                  │    │
│     └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 15. Frontend refreshes data                                    │
│     → fetchData() called again                                  │
│     → Updated status shown in table                             │
│     → Status badge changes color:                               │
│        - Pending: Yellow                                        │
│        - Approved: Green                                        │
│        - Rejected: Red                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    USER VIEWS THEIR LEAVE                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 16. User navigates to "Leave" → "My Leave"                     │
│     → Shows only their own leave requests                       │
│     → Filtered by user_id in backend                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 17. User sees their leave request with updated status          │
│     → Status: "approved" (green badge)                          │
│     → Can see approved_date if approved                         │
└─────────────────────────────────────────────────────────────────┘
```

## Key Code Locations

### Frontend (React)

1. **Leave Application Form:**
   - File: `orangehrm/src/client/src/pages/LeaveManagement.tsx`
   - Function: `renderApplyLeave()` (line ~500)
   - Handler: `handleApplyLeave()` (line ~423)

2. **Leave List (Admin View):**
   - File: `orangehrm/src/client/src/pages/LeaveManagement.tsx`
   - Function: `renderLeaveList()` (line ~2051)
   - Approval/Rejection: Buttons in table (line ~2412-2450)

3. **My Leave (User View):**
   - File: `orangehrm/src/client/src/pages/LeaveManagement.tsx`
   - Function: `renderMyLeave()` (line ~645)

4. **API Service:**
   - File: `orangehrm/src/client/src/services/api.ts`
   - Methods:
     - `createLeaveRequest()` (line ~419)
     - `getLeaveRequests()` (line ~410)
     - `updateLeaveRequest()` (line ~423)

### Backend (Node.js/Express)

1. **Create Leave Request:**
   - File: `orangehrm/src/server/server.js`
   - Endpoint: `POST /api/leave-requests` (line ~2176)
   - Logic: Employee ID resolution, validation, insert

2. **Get Leave Requests:**
   - File: `orangehrm/src/server/server.js`
   - Endpoint: `GET /api/leave-requests` (line ~2095)
   - Logic: Fetches with employee name, leave type, payable days

3. **Update Leave Request (Approve/Reject):**
   - File: `orangehrm/src/server/server.js`
   - Endpoint: `PUT /api/leave-requests/:id` (line ~2392)
   - Logic: Updates status, approved_by, approved_date

### Database

1. **Leave Requests Table:**
   - Schema: `hrms_data.leave_requests`
   - Key columns:
     - `status`: 'pending', 'approved', 'rejected', 'cancelled', 'taken', 'scheduled'
     - `applied_by`: Employee ID who applied
     - `approved_by`: Employee ID who approved (NULL if pending)
     - `approved_date`: Timestamp when approved (NULL if pending)

2. **Leave Types Table:**
   - Schema: `hrms_data.leave_types`
   - Key columns:
     - `is_paid`: Boolean (true for paid leaves, false for unpaid)

3. **Employees Table:**
   - Schema: `hrms_data.employees`
   - Links users to employee records

## Status Flow

```
pending → approved → taken
   │
   └──→ rejected
   │
   └──→ cancelled (by user)
```

## Role-Based Access

- **Regular User:**
  - Can apply for leave
  - Can view "My Leave" (only their requests)
  - Cannot see "Leave List" (admin only)
  - Cannot approve/reject

- **Admin:**
  - Can view "Leave List" (all requests)
  - Can approve/reject leave requests
  - Can view "My Leave" (their own requests)
  - Can configure leave types, holidays, work week

## Payroll Calculation Integration

When admin views "Leave List", the system automatically calculates:
- **Working Days (Base)**: Total days - Off days - Holidays
- **Unpaid Leave**: Sum of unpaid leave days in the month
- **Payable Days**: Working Days - Unpaid Leave

This calculation uses the `calculate_payable_days()` function which:
1. Gets actual month length (28/29/30/31 days)
2. Counts off days from Work Week config
3. Counts holidays
4. Calculates unpaid leave days
5. Returns payable days for salary calculation

## Example Timeline

**Day 1 (10:30 AM):**
- User applies for leave (Jan 15-17)
- Status: `pending`
- Record created in database

**Day 1 (2:45 PM):**
- Admin views Leave List
- Admin clicks "Approve"
- Status: `approved`
- `approved_by` and `approved_date` set

**Day 1 (3:00 PM):**
- User views "My Leave"
- Sees status changed to "approved" (green badge)

**Jan 15-17:**
- Leave period
- Status can be updated to `taken` (if tracking is implemented)



