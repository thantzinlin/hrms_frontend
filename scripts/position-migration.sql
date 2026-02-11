-- Position feature migration (run manually if not using Flyway)
-- Prerequisite: employees and other existing tables already created

-- 1. Create positions table
CREATE TABLE positions (
    position_id   BIGINT IDENTITY(1,1) NOT NULL,
    position_name VARCHAR(255) NOT NULL,
    description   VARCHAR(500),
    is_active     BIT NOT NULL DEFAULT 1,
    version       INT NOT NULL DEFAULT 0,
    is_deleted    BIT NOT NULL DEFAULT 0,
    created_by    VARCHAR(255),
    update_by     VARCHAR(255),
    created_at    DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at    DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT pk_positions PRIMARY KEY (position_id)
);

-- 2. Add position_id to employees
ALTER TABLE employees
ADD position_id BIGINT NULL;

ALTER TABLE employees
ADD CONSTRAINT fk_employee_position
    FOREIGN KEY (position_id)
    REFERENCES positions(position_id);

-- 3. Sample data (optional)
-- INSERT INTO positions (position_name, description, is_active, created_by)
-- VALUES
-- ('Software Engineer', 'Develops and maintains software applications', 1, 'system'),
-- ('HR Manager', 'Manages human resources operations', 1, 'system'),
-- ('Project Manager', 'Leads and coordinates projects', 1, 'system');
