-- 1. 전자결재 테이블 생성
CREATE TABLE approval_document (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    doc_number VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    doc_type_code VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    drafted_by BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    FOREIGN KEY (drafted_by) REFERENCES employee(id),
    FOREIGN KEY (doc_type_code) REFERENCES common_code(code)
);

CREATE TABLE approval_line (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id BIGINT NOT NULL,
    sequence INT NOT NULL,
    approver_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'WAITING',
    approved_at DATETIME(6),
    reject_reason VARCHAR(255),
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    FOREIGN KEY (document_id) REFERENCES approval_document(id),
    FOREIGN KEY (approver_id) REFERENCES employee(id)
);

CREATE TABLE approval_attachment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size_kb INT,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    FOREIGN KEY (document_id) REFERENCES approval_document(id)
);

-- 2. 공지사항 테이블 생성
CREATE TABLE notice (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    notice_type_code VARCHAR(50) NOT NULL,
    is_important BOOLEAN NOT NULL DEFAULT FALSE,
    author_id BIGINT NOT NULL,
    view_count INT NOT NULL DEFAULT 0,
    expiration_date DATE,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    FOREIGN KEY (author_id) REFERENCES employee(id),
    FOREIGN KEY (notice_type_code) REFERENCES common_code(code)
);

-- 3. 근태 및 듀티표 테이블 생성
CREATE TABLE attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    work_date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    status VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    note VARCHAR(255),
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employee(id)
);

CREATE TABLE duty_schedule (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    department_id BIGINT NOT NULL,
    schedule_year INT NOT NULL,
    schedule_month INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    FOREIGN KEY (department_id) REFERENCES department(id)
);

CREATE TABLE duty_schedule_entry (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    duty_schedule_id BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,
    work_date DATE NOT NULL,
    shift_type_code VARCHAR(50) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    FOREIGN KEY (duty_schedule_id) REFERENCES duty_schedule(id),
    FOREIGN KEY (employee_id) REFERENCES employee(id),
    FOREIGN KEY (shift_type_code) REFERENCES common_code(code)
);
