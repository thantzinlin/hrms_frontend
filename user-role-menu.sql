CREATE TABLE users (
    user_id     VARCHAR(50) NOT NULL,
    username    VARCHAR(50) NOT NULL,
    password    VARCHAR(255) NOT NULL,
    email       VARCHAR(100) UNIQUE,
    resettoken VARCHAR(255) DEFAULT NULL,
    is_verified BIT NOT NULL DEFAULT 0,
    version     INT NOT NULL DEFAULT 0,
    is_deleted  BIT NOT NULL DEFAULT 0,
    created_by VARCHAR(50),
    update_by  VARCHAR(50),
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT pk_users PRIMARY KEY (user_id)
);

CREATE TABLE roles (
    role_id     BIGINT IDENTITY(1,1) NOT NULL,
    role_name   VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    version     INT NOT NULL DEFAULT 0,
    is_deleted  BIT NOT NULL DEFAULT 0,
    created_by VARCHAR(50),
    update_by  VARCHAR(50),
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT pk_roles PRIMARY KEY (role_id)
);

CREATE TABLE menus (
    menu_id     BIGINT IDENTITY(1,1) NOT NULL,
    menu_name   VARCHAR(100) NOT NULL,
    module_code VARCHAR(50) NOT NULL,
    parent_id   BIGINT NULL,
    url         VARCHAR(255),
    icon        VARCHAR(50),
    sequence    INT DEFAULT 0,
    version     INT NOT NULL DEFAULT 0,
    is_deleted  BIT NOT NULL DEFAULT 0,
    created_by VARCHAR(50),
    update_by  VARCHAR(50),
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT pk_menus PRIMARY KEY (menu_id),
    CONSTRAINT fk_menus_parent
        FOREIGN KEY (parent_id)
        REFERENCES menus(menu_id)
);

CREATE TABLE user_role (
    user_id     VARCHAR(50) NOT NULL,
    role_id     BIGINT NOT NULL,
    version     INT NOT NULL DEFAULT 0,
    is_deleted  BIT NOT NULL DEFAULT 0,
    created_by VARCHAR(50),
    update_by  VARCHAR(50),
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT pk_user_role PRIMARY KEY (user_id, role_id),

    CONSTRAINT fk_user_role_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_role_role
        FOREIGN KEY (role_id)
        REFERENCES roles(role_id)
        ON DELETE CASCADE
);


CREATE TABLE role_menu (
    role_id     BIGINT NOT NULL,
    menu_id     BIGINT NOT NULL,
    version     INT NOT NULL DEFAULT 0,
    is_deleted  BIT NOT NULL DEFAULT 0,
    created_by VARCHAR(50),
    update_by  VARCHAR(50),
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT pk_role_menu PRIMARY KEY (role_id, menu_id),

    CONSTRAINT fk_role_menu_role
        FOREIGN KEY (role_id)
        REFERENCES roles(role_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_role_menu_menu
        FOREIGN KEY (menu_id)
        REFERENCES menus(menu_id)
        ON DELETE CASCADE
);



INSERT INTO users (user_id, username, password, email, created_by)
VALUES
('U001', 'superadmin', 'admin123', 'superadmin@company.com', 'system'),
('U002', 'hradmin', 'hr123', 'hr@company.com', 'system'),
('U003', 'manager1', 'manager123', 'manager@company.com', 'system'),
('U004', 'employee1', 'emp123', 'employee@company.com', 'system');

INSERT INTO roles (role_name, description, created_by)
VALUES
('SUPER_ADMIN', 'Full system access', 'system'),
('HR_ADMIN', 'HR administration role', 'system'),
('MANAGER', 'Manager role', 'system'),
('EMPLOYEE', 'Employee self-service role', 'system');



INSERT INTO menus (menu_name, module_code, parent_id, url, icon, sequence, created_by)
VALUES
('Dashboard', 'CORE', NULL, '/dashboard', 'dashboard', 1, 'system'),
('Employee Management', 'HRMS', NULL, NULL, 'users', 2, 'system'),
('Attendance', 'HRMS', NULL, NULL, 'clock', 3, 'system'),
('Leave Management', 'HRMS', NULL, NULL, 'calendar', 4, 'system'),
('Payroll', 'HRMS', NULL, NULL, 'dollar-sign', 5, 'system'),
('Reports', 'HRMS', NULL, NULL, 'bar-chart', 6, 'system'),
('System Settings', 'CORE', NULL, NULL, 'settings', 7, 'system');

INSERT INTO menus (menu_name, module_code, parent_id, url, icon, sequence, created_by)
VALUES
-- Employee Management
('Employees', 'HRMS',
 (SELECT menu_id FROM menus WHERE menu_name = 'Employee Management'),
 '/employees', 'user', 1, 'system'),

('Departments', 'HRMS',
 (SELECT menu_id FROM menus WHERE menu_name = 'Employee Management'),
 '/departments', 'layers', 2, 'system'),

('Positions', 'HRMS',
 (SELECT menu_id FROM menus WHERE menu_name = 'Employee Management'),
 '/positions', 'briefcase', 3, 'system'),

-- Attendance
('Attendance Records', 'HRMS',
 (SELECT menu_id FROM menus WHERE menu_name = 'Attendance'),
 '/attendance', 'clock', 1, 'system'),

-- Leave
('Leave Requests', 'HRMS',
 (SELECT menu_id FROM menus WHERE menu_name = 'Leave Management'),
 '/leaves', 'calendar', 1, 'system'),

('Leave Types', 'HRMS',
 (SELECT menu_id FROM menus WHERE menu_name = 'Leave Management'),
 '/leave-types', 'list', 2, 'system'),

-- Payroll
('Salary Structure', 'HRMS',
 (SELECT menu_id FROM menus WHERE menu_name = 'Payroll'),
 '/salary-structure', 'dollar-sign', 1, 'system'),

('Payroll Process', 'HRMS',
 (SELECT menu_id FROM menus WHERE menu_name = 'Payroll'),
 '/payroll', 'credit-card', 2, 'system'),

-- Settings
('Users', 'CORE',
 (SELECT menu_id FROM menus WHERE menu_name = 'System Settings'),
 '/users', 'users', 1, 'system'),

('Roles', 'CORE',
 (SELECT menu_id FROM menus WHERE menu_name = 'System Settings'),
 '/roles', 'shield', 2, 'system');

INSERT INTO user_role (user_id, role_id, created_by)
VALUES
('U001', (SELECT role_id FROM roles WHERE role_name = 'SUPER_ADMIN'), 'system'),
('U002', (SELECT role_id FROM roles WHERE role_name = 'HR_ADMIN'), 'system'),
('U003', (SELECT role_id FROM roles WHERE role_name = 'MANAGER'), 'system'),
('U004', (SELECT role_id FROM roles WHERE role_name = 'EMPLOYEE'), 'system');

INSERT INTO role_menu (role_id, menu_id, created_by)
SELECT 
    (SELECT role_id FROM roles WHERE role_name = 'SUPER_ADMIN'),
    menu_id,
    'system'
FROM menus;


INSERT INTO role_menu (role_id, menu_id, created_by)
SELECT 
    (SELECT role_id FROM roles WHERE role_name = 'HR_ADMIN'),
    menu_id,
    'system'
FROM menus
WHERE module_code IN ('HRMS', 'CORE');

INSERT INTO role_menu (role_id, menu_id, created_by)
SELECT
    (SELECT role_id FROM roles WHERE role_name = 'MANAGER'),
    menu_id,
    'system'
FROM menus
WHERE menu_name IN (
    'Dashboard',
    'Attendance',
    'Leave Management',
    'Attendance Records',
    'Leave Requests',
    'Reports'
);


INSERT INTO role_menu (role_id, menu_id, created_by)
SELECT
    (SELECT role_id FROM roles WHERE role_name = 'EMPLOYEE'),
    menu_id,
    'system'
FROM menus
WHERE menu_name IN (
    'Dashboard',
    'Attendance Records',
    'Leave Requests'
);

