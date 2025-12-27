# Database Setup and API Integration Guide

## ✅ Completed

1. **Database Schema Created**: `orangehrm/database/create_all_missing_tables.sql`
   - All tables for Leave Management, Time & Attendance, Performance, My Info, and Admin sections
   
2. **API Endpoints Created**: All CRUD endpoints added to `server.js`
   - Leave Management (leave-types, leave-requests, holidays)
   - Time & Attendance (attendance-records, customers, projects, timesheets)
   - Performance (kpis, performance-trackers, performance-reviews)
   - My Info (personal-details, contact-details, emergency-contacts, dependents, immigration)
   - Admin (locations, pay-grades, employment-status, job-categories, work-shifts, nationalities, users)

3. **API Service Extended**: `orangehrm/src/client/src/services/api.ts`
   - All new API methods added and ready to use

## 📋 Next Steps

### Step 1: Create Database Tables

Run the SQL file to create all tables:

**Option A: Using PowerShell Script**
```powershell
cd orangehrm/database
# Edit run-create-tables.ps1 and set your postgres password
.\run-create-tables.ps1
```

**Option B: Using pgAdmin**
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on `arithwise_hrms` database
4. Select "Query Tool"
5. Open `orangehrm/database/create_all_missing_tables.sql`
6. Execute the script

**Option C: Using psql command line**
```bash
psql -U postgres -d arithwise_hrms -f orangehrm/database/create_all_missing_tables.sql
```

### Step 2: Update Frontend Pages

All frontend pages need to be updated to use `apiService` instead of mock data. Here's the pattern:

**Before (Mock Data):**
```typescript
const [items, setItems] = useState([{ id: 1, name: 'Item 1' }]);
```

**After (Real API):**
```typescript
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getItems();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);

// For create/update/delete:
const handleCreate = async (data) => {
  try {
    const newItem = await apiService.createItem(data);
    setItems([...items, newItem]);
  } catch (error) {
    console.error('Error creating item:', error);
    alert('Failed to create item');
  }
};
```

### Step 3: Pages to Update

1. **Leave Management** (`pages/LeaveManagement.tsx`)
   - Replace `mockLeaveTypes` with `apiService.getLeaveTypes()`
   - Replace `mockHolidays` with `apiService.getHolidays()`
   - Add API calls for leave requests

2. **Time & Attendance** (`pages/TimePage.tsx`)
   - Replace `mockAttendanceRecords` with `apiService.getAttendanceRecords()`
   - Replace `mockCustomers` with `apiService.getCustomers()`
   - Replace `mockProjects` with `apiService.getProjects()`
   - Add API calls for timesheets

3. **Performance** (`pages/Performance.tsx`)
   - Replace mock KPIs with `apiService.getKPIs()`
   - Replace mock trackers with `apiService.getPerformanceTrackers()`
   - Replace mock reviews with `apiService.getPerformanceReviews()`

4. **My Info** (`pages/MyInfo.tsx`)
   - Add API calls for all personal data sections
   - Use `apiService.getPersonalDetails()`, `apiService.getContactDetails()`, etc.

5. **Admin Pages** (all in `pages/Admin/`)
   - Locations: Use `apiService.getLocations()`
   - Pay Grades: Use `apiService.getPayGrades()`
   - Employment Status: Use `apiService.getEmploymentStatus()`
   - Job Categories: Use `apiService.getJobCategories()`
   - Work Shifts: Use `apiService.getWorkShifts()`
   - Nationalities: Use `apiService.getNationalities()`

6. **User Management** (`pages/UserManagement.tsx`)
   - Replace mock users with `apiService.getUsers()`

### Step 4: Testing

After updating pages:
1. Start the backend server: `cd orangehrm/src/server && npm start`
2. Build the frontend: `cd orangehrm/src/client && npm run build`
3. Test each section:
   - Create records
   - Read/List records
   - Update records
   - Delete records
   - Verify data persists in database

## 🔍 Verification

Check that tables were created:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'hrms_data'
ORDER BY table_name;
```

Check API endpoints are working:
- Visit: `http://localhost:3001/api/health`
- Visit: `http://localhost:3001/api/diagnostic`

## 📝 Notes

- All API endpoints follow RESTful conventions
- Error handling should be added to all frontend API calls
- Loading states should be shown while fetching data
- Form validation should be added before API calls
- Success/error messages should be displayed to users



