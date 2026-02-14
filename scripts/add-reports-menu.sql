-- =============================================================================
-- Add Reports menu for the reporting module
-- Run after your menus table is populated.
-- =============================================================================

-- 1. Add Reports parent menu if not exists
INSERT INTO menus (menu_name, module_code, parent_id, url, icon, sequence, created_by)
SELECT TOP 1 'Reports', 'HRMS', NULL, NULL, 'bar-chart', 7, 'system'
FROM (SELECT 1 AS x) t
WHERE NOT EXISTS (SELECT 1 FROM menus WHERE menu_name = 'Reports' AND parent_id IS NULL);

-- 2. Add HR Reports child menu with /reports route
INSERT INTO menus (menu_name, module_code, parent_id, url, icon, sequence, created_by)
SELECT TOP 1 'HR Reports', 'HRMS', m.menu_id, '/reports', 'bar-chart', 1, 'system'
FROM menus m
WHERE m.menu_name = 'Reports' AND m.parent_id IS NULL
AND NOT EXISTS (SELECT 1 FROM menus WHERE url = '/reports');
