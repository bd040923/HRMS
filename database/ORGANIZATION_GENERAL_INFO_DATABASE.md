# Organization General Information - Database Location

## Where to See Organization General Information in Database

### Database Details:
- **Database**: `arithwise_hrms`
- **Schema**: `hrms_data`
- **Table**: `organization_gen_info`

### View Organization General Information

```sql
SET search_path TO hrms_data, public;

-- View all organization information
SELECT 
    id,
    name,
    registration_number,
    tax_id,
    phone,
    fax,
    email,
    street1,
    street2,
    city,
    province,
    zip_code,
    country,
    note,
    number_of_employees,
    created_at,
    updated_at
FROM organization_gen_info;
```

### View Specific Fields

```sql
-- View just the main fields
SELECT 
    name AS "Organization Name",
    registration_number AS "Registration Number",
    tax_id AS "Tax ID",
    phone AS "Phone",
    email AS "Email",
    city AS "City",
    country AS "Country"
FROM hrms_data.organization_gen_info
WHERE id = 1;
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
AND table_name = 'organization_gen_info'
ORDER BY ordinal_position;
```

### Update Organization Information (Manual)

```sql
-- Update organization information directly in database
UPDATE hrms_data.organization_gen_info
SET 
    name = 'Your Organization Name',
    registration_number = 'REG123',
    tax_id = 'TAX456',
    phone = '123-456-7890',
    email = 'info@organization.com',
    city = 'Your City',
    country = 'Your Country',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 1;
```

## How to Access in pgAdmin

1. Open **pgAdmin**
2. Connect to your PostgreSQL server
3. Navigate to: **Servers** → **PostgreSQL** → **Databases** → **arithwise_hrms** → **Schemas** → **hrms_data** → **Tables** → **organization_gen_info**
4. Right-click on `organization_gen_info` → **View/Edit Data** → **All Rows**

## Table Structure

The `organization_gen_info` table has the following columns:

| Column Name | Type | Description |
|------------|------|-------------|
| `id` | INTEGER (PRIMARY KEY) | Unique identifier (always 1 for single organization) |
| `name` | VARCHAR(100) | Organization name (required) |
| `registration_number` | VARCHAR(30) | Business registration number |
| `tax_id` | VARCHAR(30) | Tax identification number |
| `phone` | VARCHAR(30) | Phone number |
| `fax` | VARCHAR(30) | Fax number |
| `email` | VARCHAR(100) | Email address |
| `street1` | VARCHAR(100) | Street address line 1 |
| `street2` | VARCHAR(100) | Street address line 2 |
| `city` | VARCHAR(100) | City |
| `province` | VARCHAR(100) | State/Province |
| `zip_code` | VARCHAR(30) | ZIP/Postal code |
| `country` | VARCHAR(100) | Country |
| `note` | TEXT | Additional notes |
| `number_of_employees` | INTEGER | Number of employees |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

## API Endpoints

- **GET** `/api/organization/general-information` - Get organization general information
- **PUT** `/api/organization/general-information` - Update organization general information

## Frontend Location

The Organization General Information page is accessible at:
- **URL**: `/admin/organization/general-information`
- **File**: `orangehrm/src/client/src/pages/Admin/GeneralInformation.tsx`

## Notes

- There is typically only **one record** in this table (id = 1)
- The table uses an `updated_at` trigger to automatically update the timestamp on changes
- All fields except `name` are optional

