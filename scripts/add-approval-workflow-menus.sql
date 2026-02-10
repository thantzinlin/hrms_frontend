-- =============================================================================
-- Add menu entries for Approval Workflow and Org Hierarchy
-- Run after your menus table is populated (e.g. after insert-menus.sql or
-- user-role-menu.sql). Adjust parent menu names if your schema differs.
-- =============================================================================

-- Pending Approvals (under Leave Management) - SQL Server
INSERT INTO menus (menu_name, module_code, parent_id, url, icon, sequence, created_by)
SELECT TOP 1 'Pending Approvals', 'HRMS', m.menu_id, '/approvals', 'check-circle', 3, 'system'
FROM menus m
WHERE m.menu_name = 'Leave Management' AND m.parent_id IS NULL
AND NOT EXISTS (SELECT 1 FROM menus WHERE url = '/approvals');

-- Org Hierarchy (under Employee Management) - SQL Server
INSERT INTO menus (menu_name, module_code, parent_id, url, icon, sequence, created_by)
SELECT TOP 1 'Org Hierarchy', 'HRMS', m.menu_id, '/org/hierarchy', 'git-branch', 4, 'system'
FROM menus m
WHERE m.menu_name = 'Employee Management' AND m.parent_id IS NULL
AND NOT EXISTS (SELECT 1 FROM menus WHERE url = '/org/hierarchy');

-- Grant to roles: run after inserting menus (adjust role_name list to match your DB)
-- INSERT INTO role_menu (role_id, menu_id, created_by)
-- SELECT r.role_id, m.menu_id, 'system'
-- FROM roles r CROSS JOIN menus m
-- WHERE m.url IN ('/approvals', '/org/hierarchy')
-- AND r.role_name IN ('SUPER_ADMIN', 'HR_ADMIN', 'MANAGER', 'ADMIN', 'HR')
-- AND NOT EXISTS (SELECT 1 FROM role_menu rm WHERE rm.role_id = r.role_id AND rm.menu_id = m.menu_id);
