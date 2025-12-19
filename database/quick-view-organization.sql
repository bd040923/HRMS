-- ============================================================================
-- QUICK VIEW: Organization General Information
-- Copy and paste this into pgAdmin Query Tool to quickly see your data
-- ============================================================================

SET search_path TO hrms_data, public;

SELECT 
    name AS "Organization Name",
    registration_number AS "Registration #",
    tax_id AS "Tax ID",
    phone AS "Phone",
    email AS "Email",
    city AS "City",
    country AS "Country",
    number_of_employees AS "Employees",
    updated_at AS "Last Updated"
FROM organization_gen_info
WHERE id = 1;

