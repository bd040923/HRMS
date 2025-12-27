# KYC Upload Bug Fix - Complete Implementation

## Problem
The KYC upload page was showing "Already Uploaded" for ALL users, which was incorrect. KYC status was not employee-specific.

## Solution Implemented

### 1. Database Schema ✅
- **File**: `orangehrm/database/CREATE_KYC_TABLE.sql`
- Created proper `kyc_documents` table with:
  - `employee_id` foreign key (ensures employee-specific data)
  - `verification_status` (PENDING, APPROVED, REJECTED)
  - `rejection_reason` field
  - `verified_by` (admin user_id)
  - Unique constraint on `(employee_id, document_type)`

**Action Required**: Run the SQL file in PostgreSQL:
```bash
psql -U bhushan -d your_database -f orangehrm/database/CREATE_KYC_TABLE.sql
```

### 2. Backend Authentication Middleware ✅
- **File**: `orangehrm/src/server/server.js`
- Created `authenticateUser` middleware that:
  - Extracts user_id from session token
  - Fetches employee_id from employees table
  - Attaches user info to `req.user`
- Created `requireAdmin` middleware for admin-only endpoints

### 3. Backend Employee APIs ✅
- **POST `/api/kyc/upload`**: Uploads document for authenticated employee
- **GET `/api/kyc/my`**: Gets KYC status for authenticated employee
- **POST `/api/kyc/submit`**: Submits all documents for review
- All APIs use `req.user.employeeId` from authentication (no hardcoded IDs)

### 4. Backend Admin APIs ✅
- **GET `/api/admin/kyc/pending`**: Lists all pending KYC documents
- **POST `/api/admin/kyc/verify`**: Approve or reject documents
  - Payload: `{ kyc_id, status: 'APPROVED' | 'REJECTED', rejection_reason? }`

### 5. Frontend API Service ✅
- **File**: `orangehrm/src/client/src/services/api.ts`
- Updated to:
  - Send authentication token in headers
  - Use new endpoints (`/api/kyc/my`, `/api/kyc/upload`, etc.)
  - Added admin methods: `getPendingKyc()`, `verifyKyc()`

### 6. Frontend Employee UI ✅
- **File**: `orangehrm/src/client/src/pages/MyInfo.tsx`
- Fixed `loadKyc()` to:
  - Use authenticated endpoint (no employee_id parameter)
  - Map `verification_status` correctly (PENDING → Pending, APPROVED → Approved, REJECTED → Rejected)
  - Show rejection reason when status is Rejected
  - Reset to "Not Uploaded" if no document exists
- Fixed `handleKycUpload()` to not pass employee_id
- Fixed `handleSubmit()` to use new submit endpoint
- Updated UI to show "Re-upload" button for rejected documents

### 7. Frontend Admin UI ✅
- **File**: `orangehrm/src/client/src/pages/Admin/KycVerification.tsx`
- New admin page showing:
  - Table of pending KYC documents
  - Employee name, document type, file link, upload date
  - Approve/Reject buttons
  - Rejection reason modal
- **Route**: `/admin/kyc-verification`
- Added to AdminLayout tabs

## Key Changes

### Before (Buggy):
- Hardcoded `employee_id = 1` fallback
- Global KYC status (all users saw same status)
- No authentication check
- No admin verification workflow

### After (Fixed):
- ✅ Employee-specific KYC (each user sees only their documents)
- ✅ Authentication required (token-based)
- ✅ Admin verification workflow (Pending → Approved/Rejected)
- ✅ Rejection reasons shown to employees
- ✅ Proper authorization (employees can only see their own, admins see all pending)

## Testing Checklist

1. **Employee Side**:
   - [ ] Login as employee
   - [ ] Go to My Info → KYC Upload
   - [ ] Verify all documents show "Not Uploaded" initially
   - [ ] Upload Aadhaar, PAN, Bank documents
   - [ ] Verify status changes to "Pending"
   - [ ] Submit for review
   - [ ] Verify status changes to "Under Review"

2. **Admin Side**:
   - [ ] Login as admin
   - [ ] Go to Admin → KYC Verification
   - [ ] Verify pending documents are listed
   - [ ] Click "View Document" to preview
   - [ ] Approve a document
   - [ ] Reject a document with reason
   - [ ] Verify employee sees updated status

3. **Multi-User Test**:
   - [ ] Login as Employee A, upload documents
   - [ ] Login as Employee B, verify Employee B sees "Not Uploaded"
   - [ ] Admin sees only Employee A's documents in pending list

## Database Migration

**IMPORTANT**: Run this SQL file to create/update the table:
```sql
-- File: orangehrm/database/CREATE_KYC_TABLE.sql
```

The table will be auto-created on first API call, but it's recommended to run the SQL file first to ensure proper schema.

## API Endpoints Summary

### Employee Endpoints (Authenticated)
- `POST /api/kyc/upload` - Upload document
- `GET /api/kyc/my` - Get own KYC status
- `POST /api/kyc/submit` - Submit for review

### Admin Endpoints (Authenticated + Admin Role)
- `GET /api/admin/kyc/pending` - List pending documents
- `POST /api/admin/kyc/verify` - Approve/Reject document

## Security
- ✅ All endpoints require authentication
- ✅ Employee endpoints scoped to logged-in user's employee_id
- ✅ Admin endpoints require admin role
- ✅ No cross-user data access possible



