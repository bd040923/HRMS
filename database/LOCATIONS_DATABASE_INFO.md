# Locations Database Information

## Where to See Locations in Database

### Database Details:
- **Database**: `arithwise_hrms`
- **Schema**: `hrms_data`
- **Table**: `locations`

### View All Locations

```sql
SET search_path TO hrms_data, public;

-- View all locations
SELECT 
    id,
    name,
    city,
    country,
    phone,
    number_of_employees,
    status,
    created_at,
    updated_at
FROM locations
ORDER BY name;
```

### View Indian Locations (Nagpur and Mumbai)

```sql
SELECT 
    id,
    name AS "Location Name",
    city AS "City",
    country AS "Country",
    phone AS "Phone",
    number_of_employees AS "Employees"
FROM hrms_data.locations
WHERE country = 'India'
ORDER BY city;
```

### View Specific Location

```sql
SELECT * FROM hrms_data.locations WHERE id = 1;
```

### Count Locations

```sql
SELECT COUNT(*) as total_locations FROM hrms_data.locations;
```

### Check Table Structure

```sql
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'hrms_data'
AND table_name = 'locations'
ORDER BY ordinal_position;
```

## How to Access in pgAdmin

1. Open **pgAdmin**
2. Connect to your PostgreSQL server
3. Navigate to: **Servers** → **PostgreSQL** → **Databases** → **arithwise_hrms** → **Schemas** → **hrms_data** → **Tables** → **locations**
4. Right-click on `locations` → **View/Edit Data** → **All Rows**

## Table Structure

The `locations` table has the following columns:

| Column Name | Type | Description |
|------------|------|-------------|
| `id` | INTEGER (PRIMARY KEY) | Unique identifier |
| `name` | VARCHAR(100) | Location name (required) |
| `city` | VARCHAR(100) | City |
| `country` | VARCHAR(100) | Country |
| `phone` | VARCHAR(30) | Phone number |
| `fax` | VARCHAR(30) | Fax number |
| `address` | VARCHAR(255) | Street address |
| `zip_code` | VARCHAR(30) | ZIP/Postal code |
| `province` | VARCHAR(100) | State/Province |
| `number_of_employees` | INTEGER | Number of employees at location |
| `status` | VARCHAR(50) | Status (active/inactive) |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

## API Endpoints

- **GET** `/api/locations` - Get all locations (with optional filters: name, city, country)
- **GET** `/api/locations/:id` - Get a single location
- **POST** `/api/locations` - Create a new location
- **PUT** `/api/locations/:id` - Update a location
- **DELETE** `/api/locations/:id` - Delete a location

## Frontend Location

The Locations page is accessible at:
- **URL**: `/admin/locations`
- **File**: `orangehrm/src/client/src/pages/Admin/Locations.tsx`

## Sample Data

The table is pre-populated with:
- **Nagpur Office** - Nagpur, India
- **Mumbai Office** - Mumbai, India

## Notes

- All fields except `name` are optional
- The table uses an `updated_at` trigger to automatically update the timestamp on changes
- Search functionality filters by name, city, and country

