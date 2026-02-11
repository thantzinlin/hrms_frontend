

-- Table for Department entity
CREATE TABLE departments (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    version INT NOT NULL DEFAULT 0,
    is_deleted BIT NOT NULL DEFAULT 0,
    created_by VARCHAR(255),
    update_by VARCHAR(255),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);
-- Table for Employee entity
CREATE TABLE employees (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    employee_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255),
    join_date DATETIME2 NOT NULL,
    status VARCHAR(255) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    department_id BIGINT,
    position VARCHAR(255),
    version INT NOT NULL DEFAULT 0,
    is_deleted BIT NOT NULL DEFAULT 0,
    created_by VARCHAR(255),
    update_by VARCHAR(255),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id), -- Assuming 'users' table exists for User entity
    CONSTRAINT fk_department FOREIGN KEY (department_id) REFERENCES departments(id) -- Assuming 'departments' table exists for Department entity
);

-- Table for Attendance entity
CREATE TABLE attendance (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    check_in_time DATETIME2,
    check_out_time DATETIME2,
    date DATE NOT NULL,
    CONSTRAINT fk_employee_attendance FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Table for LeaveRequest entity
CREATE TABLE leave_requests (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(255),
    status VARCHAR(20) NOT NULL,
    leave_type VARCHAR(50) NOT NULL,
    version INT NOT NULL DEFAULT 0,
    is_deleted BIT NOT NULL DEFAULT 0,
    created_by VARCHAR(255),
    update_by VARCHAR(255),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_employee_leave FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Table for OvertimeRequest entity
CREATE TABLE overtime_requests (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    date DATE NOT NULL,
    hours FLOAT NOT NULL,
    reason VARCHAR(255),
    status VARCHAR(20) NOT NULL,
    version INT NOT NULL DEFAULT 0,
    is_deleted BIT NOT NULL DEFAULT 0,
    created_by VARCHAR(255),
    update_by VARCHAR(255),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_employee_overtime FOREIGN KEY (employee_id) REFERENCES employees(id)
);


-- Table for Holiday entity
CREATE TABLE holidays (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    version INT NOT NULL DEFAULT 0,
    is_deleted BIT NOT NULL DEFAULT 0,
    created_by VARCHAR(255),
    update_by VARCHAR(255),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);
