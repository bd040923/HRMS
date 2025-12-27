# Leave Management System - How It Works

## Overview
The Leave Management system is now fully functional and connected to the database. This guide explains how each section works.

## Database Tables

### 1. `hrms_data.leave_types`
Stores different types of leave (e.g., Vacation, Sick Leave, Personal Leave)
- `id` - Primary key
- `name` - Leave type name (e.g., "US - Vacation")
- `description` - Optional description
- `entitlement_days` - Number of days allocated for this leave type
- `status` - 'active' or 'deleted'
- `created_at`, `updated_at` - Timestamps

### 2. `hrms_data.leave_requests`
Stores employee leave requests
- `id` - Primary key
- `employee_id` - Foreign key to employees table
- `leave_type_id` - Foreign key to leave_types table
- `from_date` - Start date of leave
- `to_date` - End date of leave
- `number_of_days` - Calculated number of days
- `status` - 'pending', 'approved', 'rejected', 'cancelled', 'taken', 'scheduled'
- `comments` - Optional comments
- `applied_by` - User who applied
- `approved_by` - User who approved (if approved)
- `approved_date` - Date of approval
- `date_applied` - When the request was created
- `created_at`, `updated_at` - Timestamps

### 3. `hrms_data.holidays`
Stores company holidays
- `id` - Primary key
- `name` - Holiday name (e.g., "New Year's Day")
- `date` - Holiday date
- `full_day` - Boolean (true if full day holiday)
- `repeats_annually` - Boolean (true if holiday repeats every year)
- `created_at`, `updated_at` - Timestamps

## Features

### 1. Apply Leave
**Location:** Leave > Apply

**How it works:**
1. User selects a leave type from the dropdown (loaded from `leave_types` table)
2. User enters from date and to date
3. System calculates number of days automatically
4. User can add optional comments
5. On "Apply" button click:
   - Creates a new record in `leave_requests` table
   - Status is set to 'pending' by default
   - Employee ID is taken from the logged-in user

**API Endpoint:** `POST /api/leave-requests`

### 2. My Leave
**Location:** Leave > My Leave

**How it works:**
1. Displays all leave requests for the current user
2. Shows filters for:
   - Date range (From Date, To Date)
   - Status (Pending, Approved, Rejected, etc.)
   - Leave Type
3. Displays a table with:
   - Leave Type
   - From Date
   - To Date
   - Number of Days
   - Status
   - Comments

**API Endpoint:** `GET /api/leave-requests?employee_id={id}`

### 3. Leave Types (Configure)
**Location:** Leave > Configure > Leave Types

**How it works:**
1. Lists all leave types from the database
2. Admin can:
   - Add new leave types
   - Edit existing leave types
   - Delete leave types (soft delete - sets status to 'deleted')
3. Each leave type has:
   - Name
   - Description (optional)
   - Entitlement Days (number of days allocated)

**API Endpoints:**
- `GET /api/leave-types` - Get all leave types
- `POST /api/leave-types` - Create new leave type
- `PUT /api/leave-types/:id` - Update leave type
- `DELETE /api/leave-types/:id` - Delete leave type (soft delete)

### 4. Holidays (Configure)
**Location:** Leave > Configure > Holidays

**How it works:**
1. Lists all holidays from the database
2. Admin can:
   - Add new holidays
   - Edit existing holidays
   - Delete holidays
3. Each holiday has:
   - Name
   - Date
   - Full Day (checkbox)
   - Repeats Annually (checkbox)

**API Endpoints:**
- `GET /api/holidays` - Get all holidays
- `POST /api/holidays` - Create new holiday
- `PUT /api/holidays/:id` - Update holiday
- `DELETE /api/holidays/:id` - Delete holiday

### 5. Leave List
**Location:** Leave > Leave List

**How it works:**
1. Shows all leave requests (for admins/managers)
2. Can filter by:
   - Employee
   - Leave Type
   - Status
   - Date Range
3. Admins can approve/reject leave requests

**API Endpoint:** `GET /api/leave-requests`

### 6. Assign Leave
**Location:** Leave > Assign Leave

**How it works:**
1. Allows admins to assign leave directly to employees
2. Similar to Apply Leave but admin selects the employee
3. Creates a leave request with status 'approved' or 'scheduled'

## Status Flow

1. **Pending** - Initial status when leave is applied
2. **Approved** - Manager/admin approves the leave
3. **Rejected** - Manager/admin rejects the leave
4. **Scheduled** - Leave is approved and scheduled for future
5. **Taken** - Leave has been taken
6. **Cancelled** - Leave request was cancelled

## API Endpoints Summary

### Leave Types
- `GET /api/leave-types` - Get all active leave types
- `POST /api/leave-types` - Create leave type
- `PUT /api/leave-types/:id` - Update leave type
- `DELETE /api/leave-types/:id` - Delete leave type

### Leave Requests
- `GET /api/leave-requests` - Get all leave requests (with optional filters)
- `GET /api/leave-requests?employee_id={id}` - Get leave requests for specific employee
- `GET /api/leave-requests?status={status}` - Get leave requests by status
- `POST /api/leave-requests` - Create leave request
- `PUT /api/leave-requests/:id` - Update leave request (approve/reject)

### Holidays
- `GET /api/holidays` - Get all holidays
- `POST /api/holidays` - Create holiday
- `PUT /api/holidays/:id` - Update holiday
- `DELETE /api/holidays/:id` - Delete holiday

## Setup Instructions

1. **Ensure tables exist:**
   ```sql
   -- Check if tables exist
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'hrms_data' 
   AND table_name IN ('leave_types', 'leave_requests', 'holidays');
   ```

2. **Create sample leave types:**
   ```sql
   INSERT INTO hrms_data.leave_types (name, description, entitlement_days, status)
   VALUES 
     ('US - Vacation', 'Annual vacation leave', 15, 'active'),
     ('US - Sick Leave', 'Sick leave', 10, 'active'),
     ('US - Personal', 'Personal leave', 5, 'active');
   ```

3. **Restart the server:**
   ```powershell
   cd orangehrm\src\server
   npm start
   ```

## Usage Flow

1. **Admin sets up leave types:**
   - Go to Leave > Configure > Leave Types
   - Add leave types with entitlement days

2. **Admin sets up holidays:**
   - Go to Leave > Configure > Holidays
   - Add company holidays

3. **Employee applies for leave:**
   - Go to Leave > Apply
   - Select leave type, dates, add comments
   - Click "Apply"
   - Request is created with status 'pending'

4. **Employee views their leave:**
   - Go to Leave > My Leave
   - See all their leave requests
   - Filter by date, status, or leave type

5. **Manager/Admin approves leave:**
   - Go to Leave > Leave List
   - Find pending requests
   - Approve or reject requests

## Notes

- All dates are stored in ISO format (YYYY-MM-DD)
- Number of days is calculated automatically based on from_date and to_date
- Leave types can be soft-deleted (status = 'deleted') but remain in database
- Holidays can be set to repeat annually
- The system uses the logged-in user's ID to identify the employee



