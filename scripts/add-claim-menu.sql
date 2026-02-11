-- =============================================================================
-- Add Claims (Expense Claims) and Claim Types menus
-- Run after your menus table is populated.
-- =============================================================================

-- 1. Add Claims as top-level menu (after Overtime)
INSERT INTO menus (menu_name, module_code, parent_id, url, icon, sequence, created_by)
SELECT TOP 1 'Claims', 'HRMS', NULL, '/claims', 'receipt', 6, 'system'
FROM (SELECT 1 AS x) t
WHERE NOT EXISTS (SELECT 1 FROM menus WHERE url = '/claims');

-- 2. Add Claim Types under System Settings (admin setup)
INSERT INTO menus (menu_name, module_code, parent_id, url, icon, sequence, created_by)
SELECT TOP 1 'Claim Types', 'HRMS', m.menu_id, '/admin/claim-types', 'list', 10, 'system'
FROM menus m
WHERE m.menu_name = 'System Settings' AND m.parent_id IS NULL
AND NOT EXISTS (SELECT 1 FROM menus WHERE url = '/admin/claim-types');
