-- ============================================================================
-- QUICK QUERY: View Organization General Information
-- Run this in pgAdmin or psql to see the saved organization data
-- ============================================================================

SET search_path TO hrms_data, public;

-- View all organization information
SELECT 
    id,
    name AS "Organization Name",
    registration_number AS "Registration Number",
    tax_id AS "Tax ID",
    phone AS "Phone",
    fax AS "Fax",
    email AS "Email",
    street1 AS "Address Line 1",
    street2 AS "Address Line 2",
    city AS "City",
    province AS "State/Province",
    zip_code AS "ZIP Code",
    country AS "Country",
    note AS "Notes",
    number_of_employees AS "Number of Employees",
    created_at AS "Created At",
    updated_at AS "Last Updated"
FROM organization_gen_info
WHERE id = 1;

-- If no data exists, you'll see an empty result
-- The table will be created automatically when you save data from the UI

