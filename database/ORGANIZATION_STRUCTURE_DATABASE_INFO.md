# Organization Structure Database Information

## Where to See Organization Structure in Database

### Database Details:
- **Database**: `arithwise_hrms`
- **Schema**: `hrms_data`
- **Table**: `organization_structure`

### View Organization Structure

```sql
SET search_path TO hrms_data, public;

-- View all organization units
SELECT 
    id,
    name,
    unit_id,
    description,
    parent_id,
    level,
    status,
    created_at,
    updated_at
FROM organization_structure
ORDER BY level, name;
```

### View Hierarchical Structure

```sql
-- View with parent names
SELECT 
    os.id,
    os.name,
    os.unit_id,
    os.level,
    os.parent_id,
    parent.name AS parent_name
FROM hrms_data.organization_structure os
LEFT JOIN hrms_data.organization_structure parent ON os.parent_id = parent.id
ORDER BY os.level, os.name;
```

### View Root Organization

```sql
SELECT * FROM hrms_data.organization_structure 
WHERE parent_id IS NULL;
```

### View Children of a Specific Unit

```sql
-- Replace :parent_id with the ID you want to check
SELECT * FROM hrms_data.organization_structure 
WHERE parent_id = 1
ORDER BY name;
```

## How to Access in pgAdmin

1. Open **pgAdmin**
2. Connect to your PostgreSQL server
3. Navigate to: **Servers** → **PostgreSQL** → **Databases** → **arithwise_hrms** → **Schemas** → **hrms_data** → **Tables** → **organization_structure**
4. Right-click on `organization_structure` → **View/Edit Data** → **All Rows**

## Table Structure

The `organization_structure` table has the following columns:

| Column Name | Type | Description |
|------------|------|-------------|
| `id` | INTEGER (PRIMARY KEY) | Unique identifier |
| `name` | VARCHAR(100) | Unit name (required) |
| `unit_id` | VARCHAR(50) | Unit identifier/code |
| `description` | TEXT | Unit description |
| `parent_id` | INTEGER | Parent unit ID (for hierarchy) |
| `level` | INTEGER | Hierarchy level (0 = root) |
| `status` | VARCHAR(50) | Status (active/inactive) |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

## API Endpoints

- **GET** `/api/organization/structure` - Get hierarchical organization structure
- **POST** `/api/organization/structure` - Create a new organization unit
- **PUT** `/api/organization/structure/:id` - Update an organization unit
- **DELETE** `/api/organization/structure/:id` - Delete an organization unit

## Frontend Location

The Organization Structure page is accessible at:
- **URL**: `/admin/structure`
- **File**: `orangehrm/src/client/src/pages/Admin/Structure.tsx`

## Notes

- The structure is hierarchical with parent-child relationships
- Root organization (arithwise_hrms) has `parent_id = NULL` and `level = 0`
- Child units reference their parent via `parent_id`
- Deleting a parent unit will cascade delete all children (CASCADE)
- The table uses an `updated_at` trigger to automatically update the timestamp on changes

