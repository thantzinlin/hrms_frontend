-- =============================================================================
-- HRMS Menu URL and Icon Update Script
-- =============================================================================
-- Purpose: Update menu url and icon to match Angular frontend route structure.
--          Parent-child relationships (parent_id) are NOT changed.
--          No menu items are removed; only url and icon columns are updated.
-- Run: Execute against your HRMS database (e.g. MySQL / PostgreSQL).
-- =============================================================================

-- Root / parent menus (url = NULL for expandable parents)
UPDATE menus SET url = NULL, icon = 'users'       WHERE menu_name = 'Employee Management';
UPDATE menus SET url = NULL, icon = 'clock'       WHERE menu_name = 'Attendance';
UPDATE menus SET url = NULL, icon = 'calendar'    WHERE menu_name = 'Leave Management';
UPDATE menus SET url = NULL, icon = 'dollar-sign' WHERE menu_name = 'Payroll';
UPDATE menus SET url = NULL, icon = 'bar-chart'   WHERE menu_name = 'Reports';
UPDATE menus SET url = NULL, icon = 'settings'    WHERE menu_name = 'System Settings';

-- Dashboard (Angular maps /dashboard to default route /)
UPDATE menus SET url = '/dashboard', icon = 'dashboard' WHERE menu_name = 'Dashboard';

-- Employee Management children
UPDATE menus SET url = '/employees',  icon = 'user'     WHERE menu_name = 'Employees';
UPDATE menus SET url = '/departments', icon = 'layers' WHERE menu_name = 'Departments';
UPDATE menus SET url = '/positions', icon = 'briefcase' WHERE menu_name = 'Positions';

-- Attendance children
UPDATE menus SET url = '/attendance', icon = 'clock' WHERE menu_name = 'Attendance Records';

-- Leave Management children
UPDATE menus SET url = '/leaves',      icon = 'calendar' WHERE menu_name = 'Leave Requests';
UPDATE menus SET url = '/leave-types', icon = 'list'     WHERE menu_name = 'Leave Types';

-- Payroll children
UPDATE menus SET url = '/salary-structure', icon = 'dollar-sign' WHERE menu_name = 'Salary Structure';
UPDATE menus SET url = '/payroll',          icon = 'credit-card' WHERE menu_name = 'Payroll Process';

-- System Settings children
UPDATE menus SET url = '/users', icon = 'users'  WHERE menu_name = 'Users';
UPDATE menus SET url = '/roles', icon = 'shield' WHERE menu_name = 'Roles';

-- =============================================================================
-- Optional: If your DB has an "Overtime" or "Holidays" menu, uncomment and
-- adjust menu_name to match your schema:
-- UPDATE menus SET url = '/overtime', icon = 'overtime' WHERE menu_name = 'Overtime';
-- UPDATE menus SET url = '/admin/holidays', icon = 'calendar' WHERE menu_name = 'Holidays';
-- =============================================================================
