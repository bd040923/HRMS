# Recruitment/Onboarding Module - Setup Instructions

## ✅ Status: Frontend is Already Functional

The Recruitment/Onboarding page (`/recruitment`) is **already fully functional** and uses real API calls. There is **no dummy data** in the frontend code.

### What's Already Working:
- ✅ All API calls are real (no mock data)
- ✅ Candidate CRUD operations (Create, Read, Update, Delete)
- ✅ Vacancy CRUD operations
- ✅ Filtering and search functionality
- ✅ Job titles dropdown (fetched from backend)
- ✅ Employees dropdown (for hiring managers)
- ✅ All forms are connected to backend APIs

### Display Fallbacks (Not Dummy Data):
- "N/A" is shown when vacancy or hiring manager data is null (this is a display fallback, not dummy data)
- "(Deleted)" is shown when hiring manager employee record doesn't exist (this is a display fallback)
- Placeholder text in input fields (standard UI practice)

---

## 🗄️ Database Setup Required

To make the Recruitment module fully functional, you need to ensure the database tables exist.

### Step 1: Run the SQL Script

Execute the following SQL script in PostgreSQL:

```bash
psql -U bhushan -d arithwise_hrms -f orangehrm/database/SETUP_RECRUITMENT_TABLES.sql
```

Or connect to PostgreSQL and run:

```sql
\i orangehrm/database/SETUP_RECRUITMENT_TABLES.sql
```

### Step 2: Verify Tables Were Created

Run this query to verify:

```sql
SET search_path TO hrms_data, public;

-- Check if tables exist
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_schema = 'hrms_data' AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'hrms_data' 
  AND table_name IN ('job_titles', 'vacancies', 'candidates', 'candidate_vacancies')
ORDER BY table_name;
```

### Step 3: Check Record Counts

```sql
SET search_path TO hrms_data, public;

SELECT 
    'job_titles' as table_name, COUNT(*) as record_count FROM job_titles
UNION ALL
SELECT 
    'vacancies' as table_name, COUNT(*) as record_count FROM vacancies
UNION ALL
SELECT 
    'candidates' as table_name, COUNT(*) as record_count FROM candidates
UNION ALL
SELECT 
    'candidate_vacancies' as table_name, COUNT(*) as record_count FROM candidate_vacancies;
```

---

## 📋 Tables Created

The SQL script creates the following tables:

### 1. `job_titles`
- Required for vacancies (foreign key reference)
- Fields: `id`, `title`, `description`, `status`, `created_at`, `updated_at`

### 2. `vacancies`
- Stores job openings
- Fields: `id`, `name`, `job_title_id`, `hiring_manager_id`, `description`, `number_of_positions`, `status`, `published_date`, `closing_date`, `created_at`, `updated_at`
- Foreign keys: `job_title_id` → `job_titles.id`, `hiring_manager_id` → `employees.id`

### 3. `candidates`
- Stores candidate information
- Fields: `id`, `first_name`, `middle_name`, `last_name`, `email`, `contact_number`, `keywords`, `comment`, `date_of_application`, `status`, `method_of_application`, `resume_file_path`, `consent_to_keep_data`, `created_at`, `updated_at`

### 4. `candidate_vacancies`
- Many-to-many relationship between candidates and vacancies
- Fields: `id`, `candidate_id`, `vacancy_id`, `status`, `applied_date`, `created_at`, `updated_at`
- Foreign keys: `candidate_id` → `candidates.id`, `vacancy_id` → `vacancies.id`

---

## 🚀 Using the Module

Once tables are created:

1. **Add Job Titles** (if not already present):
   - Go to Admin → Job → Job Titles
   - Add job titles that will be used for vacancies

2. **Create Vacancies**:
   - Go to Onboarding → Vacancies tab
   - Click "+ Add" button
   - Fill in vacancy details
   - Select a job title and hiring manager (optional)

3. **Add Candidates**:
   - Go to Onboarding → Candidates tab
   - Click "+ Add" button
   - Fill in candidate information
   - Link to vacancies if needed

4. **Filter and Search**:
   - Use the filter forms to search for candidates or vacancies
   - All filters are functional and query the database

---

## 🔍 Troubleshooting

### Error: "relation 'hrms_data.job_titles' does not exist"
- **Solution**: Run the `SETUP_RECRUITMENT_TABLES.sql` script

### Error: "relation 'hrms_data.employees' does not exist"
- **Solution**: The employees table should already exist. If not, create it first.

### Error: "foreign key constraint fails"
- **Solution**: Ensure referenced records exist:
  - Job titles must exist before creating vacancies
  - Employees must exist before assigning as hiring managers

### No data showing in dropdowns
- **Solution**: Add records first:
  - Add job titles in Admin → Job → Job Titles
  - Add employees (they should already exist from user management)

---

## 📝 Notes

- All tables are created in the `hrms_data` schema
- Foreign key constraints ensure data integrity
- Indexes are created for better query performance
- The script is idempotent - safe to run multiple times
- No sample/dummy data is inserted - add real data through the UI

---

## ✅ Verification Checklist

After running the SQL script, verify:

- [ ] All 4 tables exist (`job_titles`, `vacancies`, `candidates`, `candidate_vacancies`)
- [ ] All indexes are created
- [ ] Foreign key constraints are in place
- [ ] Permissions are granted to `bhushan` user
- [ ] Can access `/recruitment` page without errors
- [ ] Can see empty tables (0 records) or existing data
- [ ] Can create a new vacancy
- [ ] Can create a new candidate
- [ ] Filters work correctly

---

**Last Updated**: 2024-12-16

