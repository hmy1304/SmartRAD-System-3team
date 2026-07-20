-- 1. 권한 그룹 및 메뉴 테이블 생성
CREATE TABLE role_group (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL
);

CREATE TABLE menu (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    menu_code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL
);

CREATE TABLE role_permission (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_group_id BIGINT NOT NULL,
    menu_id BIGINT NOT NULL,
    can_read BOOLEAN NOT NULL DEFAULT FALSE,
    can_write BOOLEAN NOT NULL DEFAULT FALSE,
    can_delete BOOLEAN NOT NULL DEFAULT FALSE,
    can_approve BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    FOREIGN KEY (role_group_id) REFERENCES role_group(id),
    FOREIGN KEY (menu_id) REFERENCES menu(id)
);

-- 2. 기존 Employee 테이블 확장
ALTER TABLE employee 
DROP COLUMN role,
ADD COLUMN role_group_id BIGINT,
ADD COLUMN account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN gender VARCHAR(10),
ADD COLUMN birth_date DATE,
ADD COLUMN address VARCHAR(255),
ADD COLUMN internal_phone VARCHAR(20),
ADD COLUMN emergency_contact VARCHAR(20),
ADD COLUMN emergency_relation VARCHAR(20),
ADD COLUMN employment_type_code VARCHAR(50),
ADD COLUMN hire_route_code VARCHAR(50),
ADD COLUMN work_type_code VARCHAR(50),
ADD COLUMN work_ward VARCHAR(50),
ADD COLUMN pay_step INT,
ADD COLUMN payroll_type_code VARCHAR(50),
ADD COLUMN payroll_date INT,
ADD COLUMN bank_account VARCHAR(50),
ADD COLUMN tax_type_code VARCHAR(50);

ALTER TABLE employee
ADD CONSTRAINT fk_employee_role_group FOREIGN KEY (role_group_id) REFERENCES role_group(id);

-- 3. 인사 이력 테이블 생성
CREATE TABLE employment_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    type_code VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    reason VARCHAR(255),
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employee(id)
);

CREATE TABLE salary_grade_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    position_code VARCHAR(50) NOT NULL,
    pay_step INT NOT NULL,
    apply_date DATE NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employee(id)
);

CREATE TABLE employee_education (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    edu_type_code VARCHAR(50) NOT NULL,
    completion_date DATE NOT NULL,
    expiration_date DATE,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employee(id)
);

CREATE TABLE appointment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    appointment_type_code VARCHAR(50) NOT NULL,
    after_department_id BIGINT,
    after_position_code VARCHAR(50),
    apply_date DATE NOT NULL,
    note VARCHAR(255),
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employee(id),
    FOREIGN KEY (after_department_id) REFERENCES department(id)
);

-- 4. 급여 테이블 생성
CREATE TABLE payroll_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    payroll_year INT NOT NULL,
    payroll_month INT NOT NULL,
    base_salary DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_allowance DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_deduction DECIMAL(15,2) NOT NULL DEFAULT 0,
    net_pay DECIMAL(15,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employee(id)
);

CREATE TABLE payroll_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payroll_record_id BIGINT NOT NULL,
    item_type VARCHAR(20) NOT NULL,
    item_name VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    FOREIGN KEY (payroll_record_id) REFERENCES payroll_record(id)
);

-- 5. 기존 Employee_License 테이블 확장 (만료일 등)
ALTER TABLE employee_license 
ADD COLUMN license_name VARCHAR(100),
ADD COLUMN issuing_org VARCHAR(100),
ADD COLUMN specialty VARCHAR(100);

-- 6. 기존 Employee_Health 테이블 변경 (JSON 채택)
ALTER TABLE employee_health
DROP COLUMN tb_result,
DROP COLUMN hepb_result,
DROP COLUMN flu_vaccine_status,
ADD COLUMN checkup_type_code VARCHAR(50),
ADD COLUMN institution VARCHAR(100),
ADD COLUMN result VARCHAR(50),
ADD COLUMN findings TEXT,
ADD COLUMN checkup_items_json JSON;
