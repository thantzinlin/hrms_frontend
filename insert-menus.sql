-- =============================================================================
-- Menu route INSERT script (references menus table from user-role-menu.sql)
-- Table: menus (menu_id, menu_name, module_code, parent_id, url, icon, sequence,
--              version, is_deleted, created_by, update_by, created_at, updated_at)
--
-- Use CASE A when menus table is EMPTY (e.g. fresh install).
-- Use CASE B when you already ran user-role-menu.sql and only need extra routes.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- CASE A: Full menu tree (run when menus table is empty)
-- -----------------------------------------------------------------------------

-- Root / parent menus (no parent_id)
INSERT INTO menus (menu_name, module_code, parent_id, url, icon, sequence, created_by)
VALUES
('Dashboard', 'CORE', NULL, '/', 'dashboard', 1, 'system'),
('Employee Management', 'HRMS', NULL, NULL, 'users', 2, 'system'),
('Attendance', 'HRMS', NULL, NULL, 'clock', 3, 'system'),
('Leave Management', 'HRMS', NULL, NULL, 'calendar', 4, 'system'),
('Overtime', 'HRMS', NULL, NULL, 'clock', 5, 'system'),
('Payroll', 'HRMS', NULL, NULL, 'dollar-sign', 6, 'system'),
('Reports', 'HRMS', NULL, NULL, 'bar-chart', 7, 'system'),
('System Settings', 'CORE', NULL, NULL, 'settings', 8, 'system');

-- Child menus (parent_id via SELECT)
INSERT INTO menus (menu_name, module_code, parent_id, url, icon, sequence, created_by)
VALUES
-- Employee Management
('Employees', 'HRMS',
 (SELECT menu_id FROM menus WHERE menu_name = 'Employee Management' AND parent_id IS NULL),
 '/employees', 'user', 1, 'system'),

('Departments', 'HRMS',
 (SELECT menu_id FROM menus WHERE menu_name = 'Employee Management' AND parent_id IS NULL),
 '/departments', 'layers', 2, 'system'),

('Positions', 'HRMS',
 (SELECT menu_id FROM menus WHERE menu_name = 'Employee Management' AND parent_id IS NULL),
 '/positions', 'briefcase', 3, 'system'),

-- Attendance
('Attendance Records', 'HRMS',
 (SELECT menu_id FROM menus WHERE menu_name = 'Attendance' AND parent_id IS NULL),
 '/attendance', 'clock', 1, 'system'),

-- Leave Management
('Leave Requests', 'HRMS',
 (SELECT menu_id FROM menus WHERE menu_name = 'Leave Management' AND parent_id IS NULL),
 '/leaves', 'calendar', 1, 'system'),

('Leave Types', 'HRMS',
 (SELECT menu_id FROM menus WHERE menu_name = 'Leave Management' AND parent_id IS NULL),
 '/leave-types', 'list', 2, 'system'),

-- Overtime
('Overtime Requests', 'HRMS',
 (SELECT menu_id FROM menus WHERE menu_name = 'Overtime' AND parent_id IS NULL),
 '/overtime', 'clock', 1, 'system'),

-- Payroll
('Salary Structure', 'HRMS',
 (SELECT menu_id FROM menus WHERE menu_name = 'Payroll' AND parent_id IS NULL),
 '/salary-structure', 'dollar-sign', 1, 'system'),

('Payroll Process', 'HRMS',
 (SELECT menu_id FROM menus WHERE menu_name = 'Payroll' AND parent_id IS NULL),
 '/payroll', 'credit-card', 2, 'system'),

-- System Settings (admin setup routes)
('Holidays', 'CORE',
 (SELECT menu_id FROM menus WHERE menu_name = 'System Settings' AND parent_id IS NULL),
 '/admin/holidays', 'calendar', 1, 'system'),

('Users', 'CORE',
 (SELECT menu_id FROM menus WHERE menu_name = 'System Settings' AND parent_id IS NULL),
 '/users', 'users', 2, 'system'),

('Roles', 'CORE',
 (SELECT menu_id FROM menus WHERE menu_name = 'System Settings' AND parent_id IS NULL),
 '/admin/roles', 'shield', 3, 'system'),

('Menus', 'CORE',
 (SELECT menu_id FROM menus WHERE menu_name = 'System Settings' AND parent_id IS NULL),
 '/admin/menus', 'list', 4, 'system'),

('Role-Menu Mapping', 'CORE',
 (SELECT menu_id FROM menus WHERE menu_name = 'System Settings' AND parent_id IS NULL),
 '/admin/role-menus', 'layers', 5, 'system');


-- -----------------------------------------------------------------------------
-- CASE B: Additional menu routes only (run AFTER user-role-menu.sql if you
--         already have root + child menus and only need these routes)
-- Uncomment and run this block instead of CASE A when menus already exist.
-- -----------------------------------------------------------------------------
/*
-- Overtime parent + child (if not already in user-role-menu.sql)
INSERT INTO menus (menu_name, module_code, parent_id, url, icon, sequence, created_by)
VALUES ('Overtime', 'HRMS', NULL, NULL, 'clock', 5, 'system');

INSERT INTO menus (menu_name, module_code, parent_id, url, icon, sequence, created_by)
VALUES ('Overtime Requests', 'HRMS',
 (SELECT menu_id FROM menus WHERE menu_name = 'Overtime' AND parent_id IS NULL),
 '/overtime', 'clock', 1, 'system');

-- System Settings children: Holidays, Roles (admin path), Menus, Role-Menu Mapping
INSERT INTO menus (menu_name, module_code, parent_id, url, icon, sequence, created_by)
VALUES
('Holidays', 'CORE',
 (SELECT menu_id FROM menus WHERE menu_name = 'System Settings' AND parent_id IS NULL),
 '/admin/holidays', 'calendar', 1, 'system'),
('Roles', 'CORE',
 (SELECT menu_id FROM menus WHERE menu_name = 'System Settings' AND parent_id IS NULL),
 '/admin/roles', 'shield', 3, 'system'),
('Menus', 'CORE',
 (SELECT menu_id FROM menus WHERE menu_name = 'System Settings' AND parent_id IS NULL),
 '/admin/menus', 'list', 4, 'system'),
('Role-Menu Mapping', 'CORE',
 (SELECT menu_id FROM menus WHERE menu_name = 'System Settings' AND parent_id IS NULL),
 '/admin/role-menus', 'layers', 5, 'system');
*/
