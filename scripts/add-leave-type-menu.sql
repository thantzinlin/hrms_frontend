-- =============================================================================
-- Add Leave Type Setup menu under Leave Management
-- Run after your menus table is populated.
-- =============================================================================

-- Leave Types (under Leave Management) - SQL Server
INSERT INTO menus (menu_name, module_code, parent_id, url, icon, sequence, created_by)
SELECT TOP 1 'Leave Types', 'HRMS', m.menu_id, '/admin/leave-types', 'calendar', 2, 'system'
FROM menus m
WHERE m.menu_name = 'Leave Management' AND m.parent_id IS NULL
AND NOT EXISTS (SELECT 1 FROM menus WHERE url = '/admin/leave-types');
