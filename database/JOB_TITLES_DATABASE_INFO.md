# Job Titles Database Information

## Where to See Job Titles in Database

### Database Details:
- **Database**: `arithwise_hrms`
- **Schema**: `hrms_data`
- **Table**: `job_titles`

### View All Job Titles

```sql
SET search_path TO hrms_data, public;

-- View all job titles
SELECT 
    id,
    title,
    description,
    status,
    created_at,
    updated_at
FROM job_titles
ORDER BY title;
```

### View Job Titles Count

```sql
SELECT COUNT(*) as total_job_titles FROM hrms_data.job_titles;
```

### Delete All Dummy/Test Entries

```sql
-- Option 1: Delete all entries (use with caution!)
DELETE FROM hrms_data.job_titles;

-- Option 2: Delete specific entries by ID
DELETE FROM hrms_data.job_titles WHERE id IN (1, 2, 3, 4, 5, 6, 7, 8);

-- Option 3: Delete entries with empty descriptions (if you want to keep ones with descriptions)
DELETE FROM hrms_data.job_titles WHERE description = '' OR description IS NULL;
```

### Check Table Structure

```sql
-- View table columns and constraints
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'hrms_data'
AND table_name = 'job_titles'
ORDER BY ordinal_position;
```

### Insert Sample Job Title (for testing)

```sql
INSERT INTO hrms_data.job_titles (title, description, status)
VALUES ('Software Engineer', 'Develops and maintains software applications', 'active')
RETURNING id, title, description, status;
```

## How to Access in pgAdmin

1. Open **pgAdmin**
2. Connect to your PostgreSQL server
3. Navigate to: **Servers** → **PostgreSQL** → **Databases** → **arithwise_hrms** → **Schemas** → **hrms_data** → **Tables** → **job_titles**
4. Right-click on `job_titles` → **View/Edit Data** → **All Rows**

## API Endpoints

- **GET** `/api/job-titles` - Get all job titles
- **POST** `/api/job-titles` - Create a new job title
- **PUT** `/api/job-titles/:id` - Update a job title
- **DELETE** `/api/job-titles/:id` - Delete a job title

## Frontend Location

The Job Titles page is accessible at:
- **URL**: `/admin/job/job-titles`
- **File**: `orangehrm/src/client/src/pages/Admin/JobTitles.tsx`



