
-- V1__init_master_data.sql
-- 1. 부서 테이블
CREATE TABLE department (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_id BIGINT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    FOREIGN KEY (parent_id) REFERENCES department(id)
);

-- 2. 공통 코드 테이블
CREATE TABLE common_code (
    code VARCHAR(50) PRIMARY KEY,
    group_code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL
);

-- 3. 사원 마스터 테이블
CREATE TABLE employee (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    emp_no VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) NULL,
    phone VARCHAR(20) NULL,
    join_date DATE NOT NULL,
    is_shift_worker BOOLEAN NOT NULL DEFAULT FALSE,
    role VARCHAR(20) NOT NULL,
    department_id BIGINT NULL,
    position_code VARCHAR(50) NULL,
    job_category_code VARCHAR(50) NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    FOREIGN KEY (department_id) REFERENCES department(id),
    FOREIGN KEY (position_code) REFERENCES common_code(code),
    FOREIGN KEY (job_category_code) REFERENCES common_code(code)
);

-- 4. 사원 자격증(면허) 테이블 (1:N)
CREATE TABLE employee_license (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    license_type_code VARCHAR(50) NOT NULL,
    license_number VARCHAR(50) NOT NULL,
    issue_date DATE NULL,
    expiration_date DATE NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employee(id),
    FOREIGN KEY (license_type_code) REFERENCES common_code(code)
);

-- 5. 사원 건강검진 테이블 (1:N)
CREATE TABLE employee_health (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    checkup_year INT NOT NULL,
    checkup_date DATE NULL,
    tb_result VARCHAR(20) NULL,
    hepb_result VARCHAR(20) NULL,
    flu_vaccine_status VARCHAR(20) NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employee(id)
);

-- 초기 더미 데이터 세팅 (테스트용)
INSERT INTO department (name, created_at, updated_at) VALUES ('원장실', NOW(), NOW());
INSERT INTO department (name, parent_id, created_at, updated_at) VALUES ('간호본부', 1, NOW(), NOW());
INSERT INTO department (name, parent_id, created_at, updated_at) VALUES ('중환자실', 2, NOW(), NOW());
INSERT INTO department (name, parent_id, created_at, updated_at) VALUES ('응급실', 2, NOW(), NOW());

INSERT INTO common_code (code, group_code, name, created_at, updated_at) VALUES 
('POS_01', 'POS', '수석', NOW(), NOW()),
('POS_02', 'POS', '1급', NOW(), NOW()),
('POS_03', 'POS', '수간호사', NOW(), NOW()),
('JOB_01', 'JOB', '전문의', NOW(), NOW()),
('JOB_02', 'JOB', '간호사', NOW(), NOW()),
('JOB_03', 'JOB', '의료기사', NOW(), NOW()),
('LIC_01', 'LIC', '등록간호사(RN)', NOW(), NOW()),
('LIC_02', 'LIC', '의사면허(DR)', NOW(), NOW());

-- 관리자 테스트 계정 (비밀번호: 1234 의 BCrypt 형태 등 추후 Spring Security 적용 시 암호화 필요. 현재는 평문 1234 입력)
INSERT INTO employee (emp_no, name, password, email, phone, join_date, is_shift_worker, role, department_id, position_code, job_category_code, created_at, updated_at) 
VALUES ('ADMIN-001', '시스템관리자', '1234', 'admin@tphr.com', '010-1234-5678', '2026-01-01', FALSE, 'ROLE_ADMIN', 1, 'POS_01', 'JOB_01', NOW(), NOW());

INSERT INTO employee (emp_no, name, password, email, phone, join_date, is_shift_worker, role, department_id, position_code, job_category_code, created_at, updated_at) 
VALUES ('RN-1004', '김간호', '1234', 'rn1004@tphr.com', '010-1004-1004', '2026-03-01', TRUE, 'ROLE_USER', 3, 'POS_03', 'JOB_02', NOW(), NOW());

-- V2__add_phase2_schema.sql
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

-- V3__add_phase3_schema.sql
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

-- V4__add_appointment_applied_flag.sql
-- 인사 발령의 실제 반영(Employee.department/position 업데이트) 여부를 추적하기 위한 컬럼
ALTER TABLE appointment
ADD COLUMN applied BOOLEAN NOT NULL DEFAULT FALSE;

-- 발령에 따른 호봉 변경이 있는 경우 SalaryGradeHistory 자동 연동 생성을 위한 컬럼
ALTER TABLE appointment
ADD COLUMN after_pay_step INT NULL;

-- V5__add_appointment_type_codes.sql
-- 인사 발령(Appointment) 유형 코드 시드 데이터
-- POST /appointments 의 appointmentTypeCode 로 사용된다.
INSERT INTO common_code (code, group_code, name, created_at, updated_at) VALUES
('APT_PROMOTE', 'APT', '승진', NOW(), NOW()),
('APT_TRANSFER', 'APT', '전보', NOW(), NOW()),
('APT_DEMOTE', 'APT', '강등', NOW(), NOW()),
('APT_DISPATCH', 'APT', '파견', NOW(), NOW());

-- V6__add_notice_type_codes.sql
-- 공지사항(Notice) 유형 코드 시드 데이터
-- POST /notices 의 noticeTypeCode 로 사용된다.
INSERT INTO common_code (code, group_code, name, created_at, updated_at) VALUES
('NOTICE_GENERAL', 'NOTICE', '일반', NOW(), NOW()),
('NOTICE_URGENT', 'NOTICE', '긴급', NOW(), NOW());

-- V7__add_system_admin_seed_data.sql
-- 시스템 관리(공통코드/부서/권한) 모듈 기본 시드 데이터
-- Flyway가 애플리케이션 기동 시 자동으로 실행하므로 수동으로 SQL을 실행할 필요가 없다.

-- 1. 메뉴(권한 매트릭스 대상 화면/기능 단위) 등록
--    message.txt 의 1~7순위 API 그룹 및 시스템 관리 화면을 그대로 매핑한다.
INSERT INTO menu (menu_code, name, description, created_at, updated_at) VALUES
('EMP_MASTER', '직원 등록 및 조회', '신규 직원 등록, 목록/상세 조회, 인적사항 수정, 계정 잠금/해제', NOW(), NOW()),
('APPOINTMENT', '인사 발령', '승진/전보 발령 등록 및 일괄 적용(Batch), 발령 이력 조회', NOW(), NOW()),
('DUTY_SCHEDULE', '듀티표 편성', '월별 3교대(D/E/N) 근무표 편성 및 확정', NOW(), NOW()),
('ATTENDANCE', '근태 관리', '출퇴근 이상자 조회 및 수동 정정', NOW(), NOW()),
('LICENSE_EDU_HEALTH', '자격증/교육/건강검진', '자격증 만료 알림, 의무교육 이수율, 건강검진 결과 관리', NOW(), NOW()),
('PAYROLL', '급여 처리', '급여 자동 계산, 급여 대장 마감, 명세서 조회/발급', NOW(), NOW()),
('APPROVAL', '전자결재', '기안 문서 작성, 결재선 승인, 휴가 신청', NOW(), NOW()),
('NOTICE', '공지사항', '병원 내 공지사항 등록 및 조회', NOW(), NOW()),
('SYSTEM_ADMIN', '시스템 관리', '공통코드, 부서, 권한 그룹 및 메뉴 권한 관리', NOW(), NOW());

-- 2. 권한 그룹 등록
INSERT INTO role_group (name, description, created_at, updated_at) VALUES
('최고관리자', '전체 메뉴에 대한 모든 권한을 가진 시스템 관리자', NOW(), NOW()),
('인사담당자', '인사 행정 전반(직원/발령/근태/급여/전자결재)을 처리하는 인사팀 권한', NOW(), NOW()),
('수간호사', '소속 병동의 듀티표 편성과 근태 확인, 결재를 담당하는 부서장급 권한', NOW(), NOW()),
('일반직원', '본인 조회 및 휴가 등 전자결재 기안만 가능한 기본 권한', NOW(), NOW());

-- 3. 권한 그룹별 메뉴 권한 매트릭스
--    최고관리자: 전체 메뉴 CRUD + 결재 권한 모두 허용
INSERT INTO role_permission (role_group_id, menu_id, can_read, can_write, can_delete, can_approve, created_at, updated_at)
SELECT rg.id, m.id, TRUE, TRUE, TRUE, TRUE, NOW(), NOW()
FROM role_group rg
CROSS JOIN menu m
WHERE rg.name = '최고관리자';

--    인사담당자: 시스템 관리(권한 그룹 신설 등)를 제외한 인사 행정 전반에 읽기/쓰기, 결재 승인 가능
INSERT INTO role_permission (role_group_id, menu_id, can_read, can_write, can_delete, can_approve, created_at, updated_at)
SELECT rg.id, m.id, TRUE, TRUE, FALSE, TRUE, NOW(), NOW()
FROM role_group rg
CROSS JOIN menu m
WHERE rg.name = '인사담당자'
  AND m.menu_code IN ('EMP_MASTER', 'APPOINTMENT', 'ATTENDANCE', 'LICENSE_EDU_HEALTH', 'PAYROLL', 'APPROVAL', 'NOTICE');

INSERT INTO role_permission (role_group_id, menu_id, can_read, can_write, can_delete, can_approve, created_at, updated_at)
SELECT rg.id, m.id, TRUE, FALSE, FALSE, FALSE, NOW(), NOW()
FROM role_group rg
CROSS JOIN menu m
WHERE rg.name = '인사담당자'
  AND m.menu_code IN ('DUTY_SCHEDULE', 'SYSTEM_ADMIN');

--    수간호사: 듀티표 편성/근태는 직접 관리, 그 외 본인 소속 정보는 조회 위주, 휴가 등 결재는 승인 가능
INSERT INTO role_permission (role_group_id, menu_id, can_read, can_write, can_delete, can_approve, created_at, updated_at)
SELECT rg.id, m.id, TRUE, TRUE, FALSE, FALSE, NOW(), NOW()
FROM role_group rg
CROSS JOIN menu m
WHERE rg.name = '수간호사'
  AND m.menu_code IN ('DUTY_SCHEDULE', 'ATTENDANCE');

INSERT INTO role_permission (role_group_id, menu_id, can_read, can_write, can_delete, can_approve, created_at, updated_at)
SELECT rg.id, m.id, TRUE, FALSE, FALSE, TRUE, NOW(), NOW()
FROM role_group rg
CROSS JOIN menu m
WHERE rg.name = '수간호사'
  AND m.menu_code = 'APPROVAL';

INSERT INTO role_permission (role_group_id, menu_id, can_read, can_write, can_delete, can_approve, created_at, updated_at)
SELECT rg.id, m.id, TRUE, FALSE, FALSE, FALSE, NOW(), NOW()
FROM role_group rg
CROSS JOIN menu m
WHERE rg.name = '수간호사'
  AND m.menu_code IN ('EMP_MASTER', 'LICENSE_EDU_HEALTH', 'NOTICE');

--    일반직원: 본인 조회 위주 + 전자결재 기안만 가능(승인 권한 없음)
INSERT INTO role_permission (role_group_id, menu_id, can_read, can_write, can_delete, can_approve, created_at, updated_at)
SELECT rg.id, m.id, TRUE, FALSE, FALSE, FALSE, NOW(), NOW()
FROM role_group rg
CROSS JOIN menu m
WHERE rg.name = '일반직원'
  AND m.menu_code IN ('LICENSE_EDU_HEALTH', 'PAYROLL', 'NOTICE', 'DUTY_SCHEDULE');

INSERT INTO role_permission (role_group_id, menu_id, can_read, can_write, can_delete, can_approve, created_at, updated_at)
SELECT rg.id, m.id, TRUE, TRUE, FALSE, FALSE, NOW(), NOW()
FROM role_group rg
CROSS JOIN menu m
WHERE rg.name = '일반직원'
  AND m.menu_code = 'APPROVAL';

-- 4. 기존 테스트 계정에 권한 그룹 배정 (V2에서 role 컬럼을 role_group_id로 대체한 뒤 미배정 상태였음)
UPDATE employee SET role_group_id = (SELECT id FROM role_group WHERE name = '최고관리자')
WHERE emp_no = 'ADMIN-001';

UPDATE employee SET role_group_id = (SELECT id FROM role_group WHERE name = '수간호사')
WHERE emp_no = 'RN-1004';

-- V8__add_employment_status_codes.sql
-- 8. 재직 상태(EMP_STS) 관련 공통 코드 및 테스트 이력 추가

-- 공통 코드 그룹 추가 여부 (CommonCode는 group_code도 자체 컬럼이므로 그냥 넣으면 됨)
INSERT INTO common_code (code, group_code, name, description, is_active, sort_order, created_at, updated_at) VALUES 
('STS_ACTIVE', 'EMP_STS', '재직', '현재 정상 근무 중인 상태', TRUE, 1, NOW(), NOW()),
('STS_LEAVE', 'EMP_STS', '휴직', '육아휴직, 병가 등 장기 휴직 상태', TRUE, 2, NOW(), NOW()),
('STS_RETIRE', 'EMP_STS', '퇴직', '퇴사자', TRUE, 3, NOW(), NOW());

-- 테스트를 위해 사원 한 명을 더 추가하고, 그 사원에게 '휴직' 이력을 하나 넣어준다.
-- 사번: RN-2001 (신규 간호사), 부서는 중환자실(3)
INSERT INTO employee (emp_no, name, password, email, phone, join_date, is_shift_worker, role_group_id, department_id, position_code, job_category_code, created_at, updated_at) 
VALUES ('RN-2001', '이휴직', '1234', 'rn2001@tphr.com', '010-2001-2001', '2026-05-01', TRUE, (SELECT id FROM role_group WHERE name = '일반직원'), 3, 'POS_03', 'JOB_02', NOW(), NOW());

-- 이휴직 사원(ID: 3)은 2026년 8월 10일부터 8월 30일까지 휴직(STS_LEAVE) 처리
INSERT INTO employment_history (employee_id, type_code, start_date, end_date, reason, created_at, updated_at) 
VALUES (
    (SELECT id FROM employee WHERE emp_no = 'RN-2001'), 
    'STS_LEAVE', 
    '2026-08-10', 
    '2026-08-30', 
    '건강상 이유로 3주 휴직', 
    NOW(), 
    NOW()
);

-- V9__add_shift_codes.sql
INSERT INTO common_code (code, group_code, name, description, is_active, sort_order, created_at, updated_at) VALUES 
('D', 'SHIFT', '데이', '데이 근무 (07:00 ~ 15:00)', TRUE, 1, NOW(), NOW()),
('E', 'SHIFT', '이브닝', '이브닝 근무 (15:00 ~ 23:00)', TRUE, 2, NOW(), NOW()),
('N', 'SHIFT', '나이트', '나이트 근무 (23:00 ~ 07:00)', TRUE, 3, NOW(), NOW()),
('OFF', 'SHIFT', '오프', '휴무', TRUE, 4, NOW(), NOW());

-- V10__update_admin_password_to_bcrypt.sql
-- Spring Security JWT 도입에 따른 테스트 계정 비밀번호(1234) BCrypt 암호화 처리
UPDATE employee 
SET password = '$2a$10$BFNR9GCXC2ZIXQ5SmsBH4OyOE.yzEttSBVGGr3yUxf0s/OMe42/ha' 
WHERE emp_no IN ('ADMIN-001', 'RN-1004');

-- V11__create_payroll_settings_tables.sql
CREATE TABLE base_salary (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_title VARCHAR(50) NOT NULL,
    min_amount BIGINT NOT NULL,
    max_amount BIGINT NOT NULL,
    actual_amount BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE allowance_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    tax_type VARCHAR(20) NOT NULL, -- 과세, 비과세
    amount_type VARCHAR(20) NOT NULL, -- 정액, 비율
    amount_or_rate VARCHAR(50) NOT NULL, -- e.g., 50%, 150%, 정액
    calculation_basis VARCHAR(100), -- e.g., 시간당 통상임금 * 0.5
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE deduction_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    category VARCHAR(20) NOT NULL, -- 법정, 자체
    deduction_type VARCHAR(20) NOT NULL, -- 기본급*요율, 건강보험료*요율, 간이세액표, 정액
    rate_or_amount VARCHAR(50) NOT NULL, -- e.g., 4.5%, 3.545%, 간이세액표, 30000
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE minimum_wage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    apply_year INT NOT NULL,
    hourly_wage BIGINT NOT NULL,
    monthly_wage BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed Data
INSERT INTO base_salary (job_title, min_amount, max_amount, actual_amount) VALUES
('간호부장', 5200000, 6100000, 5840000),
('수간호사', 4100000, 4900000, NULL),
('일반간호사', 2800000, 3800000, NULL),
('의사(전문의)', 7500000, 11000000, NULL),
('행정직원', 2500000, 3400000, NULL);

INSERT INTO allowance_item (name, tax_type, amount_type, amount_or_rate, calculation_basis) VALUES
('야간근무수당', '과세', '비율', '50%', '시간당 통상임금 * 0.5'),
('연장근무수당', '과세', '비율', '150%', NULL),
('휴일근무수당', '과세', '비율', '150%', NULL),
('직책수당', '과세', '정액', '정액', NULL),
('특수업무수당', '과세', '정액', '정액', NULL);

INSERT INTO deduction_item (name, category, deduction_type, rate_or_amount) VALUES
('국민연금', '법정', '기본급*요율', '4.5%'),
('건강보험', '법정', '기본급*요율', '3.545%'),
('장기요양보험', '법정', '건강보험료*요율', '0.9182%'),
('고용보험', '법정', '기본급*요율', '0.9%'),
('소득세', '법정', '간이세액표', '간이세액표'),
('노조비', '자체', '정액', '30000');

INSERT INTO minimum_wage (apply_year, hourly_wage, monthly_wage) VALUES
(2026, 10030, 2096270);

-- V13__create_statutory_schedule_table.sql
CREATE TABLE statutory_schedule (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    agency VARCHAR(50),
    category VARCHAR(50),
    target VARCHAR(50),
    deadline DATE NOT NULL,
    head_count INT,
    estimated_amount BIGINT,
    memo VARCHAR(500),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

INSERT INTO statutory_schedule (title, agency, category, target, deadline, head_count, estimated_amount, memo, status, created_at, updated_at) VALUES 
('국민연금 사업장가입자 자격취득신고', '국민연금공단', '취득', '신규 입사자', '2026-07-15', 5, 0, '신규 입사자 5명 취득 신고', 'COMPLETED', NOW(), NOW()),
('건강보험 직장가입자 자격상실신고', '국민건강보험공단', '상실', '퇴사자', '2026-07-14', 2, 0, '퇴사자 2명 상실 신고', 'COMPLETED', NOW(), NOW()),
('근로소득세 원천징수이행상황신고', '국세청', '세금', '전 직원', '2026-08-10', 0, 15000000, '7월 귀속분 원천세 신고', 'PENDING', NOW(), NOW()),
('지방소득세 특별징수분 납부', '관할구청', '세금', '전 직원', '2026-08-10', 0, 1500000, '7월 귀속분 지방소득세 납부', 'PENDING', NOW(), NOW()),
('고용/산재보험 근로내용 확인신고', '근로복지공단', '신고', '일용직', '2026-08-15', 3, 0, '7월 일용근로자 근로내용 신고', 'PENDING', NOW(), NOW());

-- V14__fix_admin_password_again.sql
-- Fix ADMIN-001, RN-1004, RN-2001 (and all plaintext '1234') passwords to correctly match the BCrypt hash for '1234'
UPDATE employee 
SET password = '$2a$10$Wt4s64H3mVRZNx0CFzUmW.6hmDF8PFANNna4OdivYVoayHXPH..fm' 
WHERE emp_no IN ('ADMIN-001', 'RN-1004', 'RN-2001') OR password = '1234';

-- V15__expand_sub_navigation_menus.sql
-- V15: 메뉴 권한 단위를 상위 대분류 9개에서 실제 네비게이션 15개 하위 화면 단위로 확대 및 재구성

-- 1. 기존 권한 및 메뉴 데이터 초기화 (외래키 제약조건 순서 유의)
DELETE FROM role_permission;
DELETE FROM menu;

-- 2. 실제 대시보드 하위 네비게이션 15개 항목 등록
INSERT INTO menu (menu_code, name, description, created_at, updated_at) VALUES
('APPROVAL_INBOX', '결재 수신함', '결재 대기 및 진행 문서 승인/반려 처리', NOW(), NOW()),
('APPROVAL_DRAFT', '기안 문서 작성', '휴가 및 사내 업무 기안 문서 작성', NOW(), NOW()),
('EMP_LIST', '직원 등록 및 조회', '신규 직원 초대/등록, 인적사항 조회 및 수정', NOW(), NOW()),
('EMP_ORG', '조직도 조회', '부서 및 구성원 전사 조직도 조회', NOW(), NOW()),
('APPOINTMENT', '인사 발령', '승진/전보 발령 등록, 일괄 배치 및 발령 이력 관리', NOW(), NOW()),
('DUTY_SCHEDULE', '듀티표 편성', '월별 병동 3교대(D/E/N) 근무표 편성 및 확정', NOW(), NOW()),
('ATTEND_ADMIN', '근태 이상자 관리', '출퇴근 이상 내역 조회 및 관리자 수동 정정 처리', NOW(), NOW()),
('ATTEND_CHECK', '출퇴근 타임스탬프', '개인 출근/퇴근 실시간 기록', NOW(), NOW()),
('LEAVE_STATUS', '연차/휴가 현황', '개인 및 부서 연차 발생, 소진, 잔여 현황 관리', NOW(), NOW()),
('PAYROLL_INFO', '급여 명세서 조회', '월별 본인 급여 및 상여금 명세서 열람/발급', NOW(), NOW()),
('PAYROLL_PROC', '급여 대장 마감', '급여 대장 계산 및 공제금 확정, 마감 처리', NOW(), NOW()),
('STATUTORY_REPORT', '법정 필수 신고', '건강보험/국민연금 등 공단 의무 법정 신고문서 생성 및 제출', NOW(), NOW()),
('SYSTEM_ROLES', '권한 및 메뉴 설정', '직위/직군별 권한 그룹 생성 및 접근 권한 매핑 관리', NOW(), NOW()),
('SYSTEM_CODE', '공통코드 및 부서 관리', '사내 조직 부서 단위 및 시스템 기본 공통 코드 관리', NOW(), NOW()),
('NOTICE', '공지사항', '전사 및 부서 내 공식 안내/공지사항 열람 및 등록', NOW(), NOW());

-- 3. 권한 그룹별 초기 15개 세부 메뉴 권한 매칭

-- (1) 최고관리자: 15개 메뉴 전체 권한 허용
INSERT INTO role_permission (role_group_id, menu_id, can_read, can_write, can_delete, can_approve, created_at, updated_at)
SELECT rg.id, m.id, TRUE, TRUE, TRUE, TRUE, NOW(), NOW()
FROM role_group rg
CROSS JOIN menu m
WHERE rg.name = '최고관리자';

-- (2) 인사담당자: 인사/근태/급여/법정신고/전자결재 전반 허용 (시스템 관리 및 듀티표 제외)
INSERT INTO role_permission (role_group_id, menu_id, can_read, can_write, can_delete, can_approve, created_at, updated_at)
SELECT rg.id, m.id, TRUE, TRUE, TRUE, TRUE, NOW(), NOW()
FROM role_group rg
CROSS JOIN menu m
WHERE rg.name = '인사담당자'
  AND m.menu_code IN ('APPROVAL_INBOX', 'APPROVAL_DRAFT', 'EMP_LIST', 'EMP_ORG', 'APPOINTMENT', 'ATTEND_ADMIN', 'ATTEND_CHECK', 'LEAVE_STATUS', 'PAYROLL_INFO', 'PAYROLL_PROC', 'STATUTORY_REPORT', 'NOTICE');

INSERT INTO role_permission (role_group_id, menu_id, can_read, can_write, can_delete, can_approve, created_at, updated_at)
SELECT rg.id, m.id, TRUE, FALSE, FALSE, FALSE, NOW(), NOW()
FROM role_group rg
CROSS JOIN menu m
WHERE rg.name = '인사담당자'
  AND m.menu_code IN ('DUTY_SCHEDULE', 'SYSTEM_ROLES', 'SYSTEM_CODE');

-- (3) 수간호사: 듀티표 및 결재 승인권 허용, ESS 본인 정보 조회 허용, 인사/마감 페이지 차단
INSERT INTO role_permission (role_group_id, menu_id, can_read, can_write, can_delete, can_approve, created_at, updated_at)
SELECT rg.id, m.id, TRUE, TRUE, FALSE, TRUE, NOW(), NOW()
FROM role_group rg
CROSS JOIN menu m
WHERE rg.name = '수간호사'
  AND m.menu_code IN ('DUTY_SCHEDULE', 'APPROVAL_INBOX');

INSERT INTO role_permission (role_group_id, menu_id, can_read, can_write, can_delete, can_approve, created_at, updated_at)
SELECT rg.id, m.id, TRUE, TRUE, FALSE, FALSE, NOW(), NOW()
FROM role_group rg
CROSS JOIN menu m
WHERE rg.name = '수간호사'
  AND m.menu_code IN ('APPROVAL_DRAFT', 'ATTEND_CHECK', 'LEAVE_STATUS', 'PAYROLL_INFO', 'NOTICE', 'EMP_ORG');

INSERT INTO role_permission (role_group_id, menu_id, can_read, can_write, can_delete, can_approve, created_at, updated_at)
SELECT rg.id, m.id, FALSE, FALSE, FALSE, FALSE, NOW(), NOW()
FROM role_group rg
CROSS JOIN menu m
WHERE rg.name = '수간호사'
  AND m.menu_code IN ('EMP_LIST', 'APPOINTMENT', 'ATTEND_ADMIN', 'PAYROLL_PROC', 'STATUTORY_REPORT', 'SYSTEM_ROLES', 'SYSTEM_CODE');

-- (4) 일반직원: ESS 본인 화면(기안 작성, 명세서 조회 등) 전용
INSERT INTO role_permission (role_group_id, menu_id, can_read, can_write, can_delete, can_approve, created_at, updated_at)
SELECT rg.id, m.id, TRUE, TRUE, FALSE, FALSE, NOW(), NOW()
FROM role_group rg
CROSS JOIN menu m
WHERE rg.name = '일반직원'
  AND m.menu_code IN ('APPROVAL_DRAFT');

INSERT INTO role_permission (role_group_id, menu_id, can_read, can_write, can_delete, can_approve, created_at, updated_at)
SELECT rg.id, m.id, TRUE, FALSE, FALSE, FALSE, NOW(), NOW()
FROM role_group rg
CROSS JOIN menu m
WHERE rg.name = '일반직원'
  AND m.menu_code IN ('EMP_ORG', 'NOTICE', 'DUTY_SCHEDULE');

INSERT INTO role_permission (role_group_id, menu_id, can_read, can_write, can_delete, can_approve, created_at, updated_at)
SELECT rg.id, m.id, FALSE, FALSE, FALSE, FALSE, NOW(), NOW()
FROM role_group rg
CROSS JOIN menu m
WHERE rg.name = '일반직원'
  AND m.menu_code IN ('ATTEND_CHECK', 'ATTENDANCE', 'PAYROLL_INFO', 'EMP_MASTER', 'LEAVE_STATUS', 'APPROVAL_INBOX', 'EMP_LIST', 'APPOINTMENT', 'ATTEND_ADMIN', 'PAYROLL_PROC', 'STATUTORY_REPORT', 'SYSTEM_ROLES', 'SYSTEM_CODE');

-- V16__create_leave_management_tables.sql
-- 16. 휴가 관리(Leave Management) 전용 DB 테이블 및 풍부한 월별/연도별 시드 데이터 생성

-- 1) 사원별 연차 할당 및 소진 대장 테이블 (employee_leave_quota)
CREATE TABLE employee_leave_quota (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    year INT NOT NULL,
    total_days DOUBLE NOT NULL DEFAULT 15.0,
    used_days DOUBLE NOT NULL DEFAULT 0.0,
    remaining_days DOUBLE NOT NULL DEFAULT 15.0,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employee(id),
    UNIQUE KEY uk_emp_year (employee_id, year)
);

-- 2) 휴가 신청 및 결재 내역 테이블 (leave_application)
CREATE TABLE leave_application (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    leave_type VARCHAR(30) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days DOUBLE NOT NULL,
    proxy_employee_name VARCHAR(100) NULL,
    approver_name VARCHAR(100) NULL,
    status VARCHAR(20) NOT NULL DEFAULT '승인대기',
    note VARCHAR(255) NULL,
    remain_text VARCHAR(100) NULL,
    remain_type VARCHAR(20) NULL DEFAULT 'normal',
    attachment_path VARCHAR(500) NULL,
    attachment_name VARCHAR(255) NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employee(id)
);

-- 3) 신규 부서 및 직급, 사원 시드 데이터 추가
INSERT INTO department (name, created_at, updated_at) VALUES 
('영상의학과', NOW(), NOW()),
('간호부', NOW(), NOW()),
('진단검사의학과', NOW(), NOW()),
('인사총무팀', NOW(), NOW()),
('응급의학과', NOW(), NOW()),
('원무과', NOW(), NOW());

-- 사원 시드 추가
INSERT INTO employee (emp_no, name, password, email, phone, join_date, is_shift_worker, role_group_id, department_id, position_code, job_category_code, created_at, updated_at) VALUES
('RAD-1001', '박시준', '1234', 'park@tphr.com', '010-1111-2222', '2020-03-01', FALSE, (SELECT id FROM role_group WHERE name = '일반직원'), (SELECT id FROM department WHERE name = '영상의학과' LIMIT 1), 'POS_01', 'JOB_01', NOW(), NOW()),
('NUR-1002', '이다영', '1234', 'lee@tphr.com', '010-2222-3333', '2021-04-01', TRUE, (SELECT id FROM role_group WHERE name = '일반직원'), (SELECT id FROM department WHERE name = '간호부' LIMIT 1), 'POS_03', 'JOB_02', NOW(), NOW()),
('LAB-1003', '김민서', '1234', 'kim.ms@tphr.com', '010-3333-4444', '2023-01-01', FALSE, (SELECT id FROM role_group WHERE name = '일반직원'), (SELECT id FROM department WHERE name = '진단검사의학과' LIMIT 1), 'POS_02', 'JOB_03', NOW(), NOW()),
('RAD-1004', '신유나', '1234', 'shin@tphr.com', '010-4444-5555', '2022-05-01', FALSE, (SELECT id FROM role_group WHERE name = '일반직원'), (SELECT id FROM department WHERE name = '영상의학과' LIMIT 1), 'POS_02', 'JOB_03', NOW(), NOW()),
('HR-1005', '최지은', '1234', 'choi.je@tphr.com', '010-5555-6666', '2019-07-01', FALSE, (SELECT id FROM role_group WHERE name = '일반직원'), (SELECT id FROM department WHERE name = '인사총무팀' LIMIT 1), 'POS_01', 'JOB_01', NOW(), NOW()),
('EMR-1006', '정우진', '1234', 'jung@tphr.com', '010-6666-7777', '2025-03-01', TRUE, (SELECT id FROM role_group WHERE name = '일반직원'), (SELECT id FROM department WHERE name = '응급의학과' LIMIT 1), 'POS_03', 'JOB_01', NOW(), NOW()),
('ADM-1007', '배준혁', '1234', 'bae@tphr.com', '010-7777-8888', '2021-09-01', FALSE, (SELECT id FROM role_group WHERE name = '일반직원'), (SELECT id FROM department WHERE name = '원무과' LIMIT 1), 'POS_02', 'JOB_01', NOW(), NOW()),
('HR-9999', '김관리', '1234', 'kim.admin@tphr.com', '010-9999-9999', '2018-01-01', FALSE, (SELECT id FROM role_group WHERE name = '최고관리자'), (SELECT id FROM department WHERE name = '인사총무팀' LIMIT 1), 'POS_01', 'JOB_01', NOW(), NOW());

-- 4) 2025년도 및 2026년도 사원별 연차 할당 (employee_leave_quota) 시드 데이터
-- [2025년도 대장]
INSERT INTO employee_leave_quota (employee_id, year, total_days, used_days, remaining_days, created_at, updated_at) VALUES
((SELECT id FROM employee WHERE emp_no = 'RAD-1001'), 2025, 15.0, 15.0, 0.0, NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'NUR-1002'), 2025, 15.0, 12.0, 3.0, NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'LAB-1003'), 2025, 15.0, 10.0, 5.0, NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'RAD-1004'), 2025, 15.0, 8.5, 6.5, NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'HR-1005'), 2025, 15.0, 14.5, 0.5, NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'EMR-1006'), 2025, 12.0, 11.0, 1.0, NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'ADM-1007'), 2025, 15.0, 9.0, 6.0, NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'HR-9999'), 2025, 20.0, 18.0, 2.0, NOW(), NOW());

-- [2026년도 대장]
INSERT INTO employee_leave_quota (employee_id, year, total_days, used_days, remaining_days, created_at, updated_at) VALUES
((SELECT id FROM employee WHERE emp_no = 'RAD-1001'), 2026, 16.0, 5.0, 11.0, NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'NUR-1002'), 2026, 16.0, 9.5, 6.5, NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'LAB-1003'), 2026, 15.0, 11.0, 4.0, NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'RAD-1004'), 2026, 15.0, 3.0, 12.0, NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'HR-1005'), 2026, 16.0, 15.0, 1.0, NOW(), NOW()), -- 잔여 1일 (소진 위험군)
((SELECT id FROM employee WHERE emp_no = 'EMR-1006'), 2026, 15.0, 13.0, 2.0, NOW(), NOW()), -- 잔여 2일 (소진 위험군)
((SELECT id FROM employee WHERE emp_no = 'ADM-1007'), 2026, 15.0, 13.0, 2.0, NOW(), NOW()), -- 잔여 2일 (소진 위험군)
((SELECT id FROM employee WHERE emp_no = 'HR-9999'), 2026, 21.0, 6.0, 15.0, NOW(), NOW());

-- 5) 년도별 / 월별(5월, 6월, 7월) 테스트 휴가 신청 내역 (leave_application) 시드 데이터
-- [2025년 5월 ~ 6월 과거 휴가 내역]
INSERT INTO leave_application (employee_id, leave_type, start_date, end_date, days, proxy_employee_name, approver_name, status, note, remain_text, remain_type, created_at, updated_at) VALUES
((SELECT id FROM employee WHERE emp_no = 'RAD-1001'), '연차', '2025-05-12', '2025-05-14', 3.0, '신유나 대리', '김관리', '승인완료', '25년도 봄휴가', '15일 → 12일', 'normal', '2025-05-01 10:00:00', NOW()),
((SELECT id FROM employee WHERE emp_no = 'NUR-1002'), '반차 (오후)', '2025-05-22', '2025-05-22', 0.5, '최지은 과장', '김관리', '승인완료', '', '12일 → 11.5일', 'normal', '2025-05-18 14:00:00', NOW()),
((SELECT id FROM employee WHERE emp_no = 'LAB-1003'), '병가', '2025-06-03', '2025-06-05', 3.0, '박시준 부장', '김관리', '승인완료', '독감 치료', '진단서 첨부', 'doc', '2025-06-01 09:00:00', NOW()),
((SELECT id FROM employee WHERE emp_no = 'HR-1005'), '연차', '2025-06-18', '2025-06-20', 3.0, '배준혁 주임', '김관리', '승인완료', '가족 여행', '4일 → 1일', 'danger', '2025-06-10 11:00:00', NOW());

-- [2026년 5월 휴가 내역]
INSERT INTO leave_application (employee_id, leave_type, start_date, end_date, days, proxy_employee_name, approver_name, status, note, remain_text, remain_type, created_at, updated_at) VALUES
((SELECT id FROM employee WHERE emp_no = 'RAD-1004'), '연차', '2026-05-04', '2026-05-04', 1.0, '박시준 부장', '김관리', '승인완료', '어린이날 샌드위치 연차', '15일 → 14일', 'normal', '2026-04-28 09:00:00', NOW()),
((SELECT id FROM employee WHERE emp_no = 'EMR-1006'), '반차 (오전)', '2026-05-15', '2026-05-15', 0.5, '—', '김관리', '승인완료', '병원 진료', '14일 → 13.5일', 'normal', '2026-05-12 15:30:00', NOW()),
((SELECT id FROM employee WHERE emp_no = 'HR-9999'), '기타', '2026-05-20', '2026-05-21', 2.0, '최지은 과장', '김관리', '승인완료', '외부 강의 지원', '21일 → 19일', 'normal', '2026-05-15 11:00:00', NOW());

-- [2026년 6월 휴가 내역]
INSERT INTO leave_application (employee_id, leave_type, start_date, end_date, days, proxy_employee_name, approver_name, status, note, remain_text, remain_type, created_at, updated_at) VALUES
((SELECT id FROM employee WHERE emp_no = 'LAB-1003'), '연차', '2026-06-11', '2026-06-12', 2.0, '박시준 부장', '김관리', '승인완료', '개인 정비', '12일 → 10일', 'normal', '2026-06-05 10:00:00', NOW()),
((SELECT id FROM employee WHERE emp_no = 'ADM-1007'), '반차 (오후)', '2026-06-25', '2026-06-25', 0.5, '—', '김관리', '승인완료', '은행 업무', '9일 → 8.5일', 'normal', '2026-06-20 14:00:00', NOW()),
((SELECT id FROM employee WHERE emp_no = 'NUR-1002'), '연차', '2026-06-29', '2026-06-30', 2.0, '최지은 과장', '김관리', '승인완료', '이른 상반기 휴가', '11.5일 → 9.5일', 'normal', '2026-06-15 09:00:00', NOW());

-- [2026년 7월 휴가 내역 (메인 대시보드)]
INSERT INTO leave_application (employee_id, leave_type, start_date, end_date, days, proxy_employee_name, approver_name, status, note, remain_text, remain_type, created_at, updated_at) VALUES
((SELECT id FROM employee WHERE emp_no = 'RAD-1001'), '연차', '2026-07-14', '2026-07-15', 2.0, '오하늘 과장', '김관리', '승인완료', '—', '13일 → 11일', 'normal', '2026-07-08 09:00:00', NOW()),
((SELECT id FROM employee WHERE emp_no = 'NUR-1002'), '반차 (오후)', '2026-07-15', '2026-07-15', 0.5, '최지은 과장', '김관리', '승인대기', '', '6.5일 → 6.0일', 'normal', '2026-07-11 10:30:00', NOW()),
((SELECT id FROM employee WHERE emp_no = 'LAB-1003'), '연차', '2026-07-21', '2026-07-25', 5.0, '박시준 부장', '김관리', '승인대기', '', '9일 → 4일', 'normal', '2026-07-10 14:15:00', NOW()),
((SELECT id FROM employee WHERE emp_no = 'RAD-1004'), '병가', '2026-07-16', '2026-07-18', 3.0, '오하늘 과장', '김관리', '승인완료', '진단서 확인 완료', '진단서 첨부', 'doc', '2026-07-09 11:20:00', NOW()),
((SELECT id FROM employee WHERE emp_no = 'HR-1005'), '연차', '2026-07-12', '2026-07-13', 2.0, '박시준 부장', '—', '반려', '연차 초과', '1일 → -1일!', 'danger', '2026-07-11 08:45:00', NOW()),
((SELECT id FROM employee WHERE emp_no = 'EMR-1006'), '반차 (오전)', '2026-07-12', '2026-07-12', 0.5, '—', '김관리', '승인완료', '—', '2.5일 → 2.0일', 'normal', '2026-07-11 13:00:00', NOW()),
((SELECT id FROM employee WHERE emp_no = 'ADM-1007'), '연차', '2026-07-28', '2026-07-30', 3.0, '—', '김관리', '승인대기', '', '5일 → 2일', 'normal', '2026-07-11 16:20:00', NOW());

-- V17__update_admin_department_to_management_team.sql
-- V17: 시스템 관리자 등 관리자의 기본 소속 부서를 '원장실'에서 '관리팀'으로 수정
UPDATE department SET name = '관리팀', updated_at = NOW() WHERE name = '원장실' OR id = 1;

-- V18__setup_admin_roles_and_seed_admin_002.sql
-- V18: ADMIN-001(최고관리자 마스터 계정)과 ADMIN-002(시스템 관리자 일반 직급 계정) 역할 및 시드 분리

-- 1. ADMIN-001의 이름을 '최고관리자'로 확정 (소속: 관리팀, 직급: 최고관리자 역할)
UPDATE employee SET name = '최고관리자' WHERE emp_no = 'ADMIN-001';

-- 2. 신규 권한 그룹 '시스템 관리자' 추가 (체크박스로 권한이 제어되는 관리 직급)
INSERT INTO role_group (name, description, created_at, updated_at)
VALUES ('시스템 관리자', '시스템 및 메뉴 권한 관리를 담당하는 관리자 직급 (체크박스 설정에 의해 통제됨)', NOW(), NOW());

-- 3. '시스템 관리자' 그룹에 기본 15개 메뉴 권한 전부 부여
INSERT INTO role_permission (role_group_id, menu_id, can_read, can_write, can_delete, can_approve, created_at, updated_at)
SELECT rg.id, m.id, TRUE, TRUE, TRUE, TRUE, NOW(), NOW()
FROM role_group rg
CROSS JOIN menu m
WHERE rg.name = '시스템 관리자';

-- 4. 'ADMIN-002' (시스템 관리자) 테스트 계정 신설
INSERT INTO employee (emp_no, name, password, email, phone, join_date, is_shift_worker, role_group_id, department_id, position_code, job_category_code, created_at, updated_at)
VALUES (
    'ADMIN-002', 
    '시스템 관리자', 
    '$2a$10$Wt4s64H3mVRZNx0CFzUmW.6hmDF8PFANNna4OdivYVoayHXPH..fm', 
    'sys.admin@tphr.com', 
    '010-2002-2002', 
    '2026-01-02', 
    FALSE, 
    (SELECT id FROM role_group WHERE name = '시스템 관리자'), 
    (SELECT id FROM department WHERE name = '관리팀' LIMIT 1), 
    'POS_01', 
    'JOB_01', 
    NOW(), 
    NOW()
);

-- V19__add_attendance_audit_and_admin_correction_columns.sql
-- 근태 정정 및 감사를 위한 테이블 스키마 확장 (V19)
ALTER TABLE attendance
    ADD COLUMN is_corrected BOOLEAN DEFAULT FALSE NOT NULL,
    ADD COLUMN correction_reason VARCHAR(500) NULL,
    ADD COLUMN corrected_by VARCHAR(50) NULL;

-- 감사 및 통계 조회를 위한 인덱스 추가
CREATE INDEX idx_attendance_work_date_status ON attendance (work_date, status);
CREATE INDEX idx_attendance_is_corrected ON attendance (is_corrected);

-- V21__add_is_active_to_allowance_and_deduction.sql
ALTER TABLE allowance_item ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE deduction_item ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- V23__add_al_shift_code.sql
INSERT INTO common_code (code, group_code, name, description, is_active, sort_order, created_at, updated_at) VALUES 
('AL', 'SHIFT', '연차', '연차 휴가', TRUE, 5, NOW(), NOW());

-- V24__add_missing_employee_codes.sql
-- 24. 프론트엔드 직원 등록 폼에서 사용하는 누락된 공통 코드 추가

-- 고용 형태 (EMP_TYPE)
INSERT INTO common_code (code, group_code, name, description, is_active, sort_order, created_at, updated_at) VALUES 
('EMP_FULL', 'EMP_TYPE', '정규직', '정규직', TRUE, 1, NOW(), NOW()),
('EMP_CONT', 'EMP_TYPE', '계약직', '계약직', TRUE, 2, NOW(), NOW()),
('EMP_PART', 'EMP_TYPE', '아르바이트/파트타임', '아르바이트/파트타임', TRUE, 3, NOW(), NOW());

-- 입사 경로 (HIRE_ROUTE)
INSERT INTO common_code (code, group_code, name, description, is_active, sort_order, created_at, updated_at) VALUES 
('HIRE_OPEN', 'HIRE_ROUTE', '공채', '공개 채용', TRUE, 1, NOW(), NOW()),
('HIRE_SPEC', 'HIRE_ROUTE', '특채', '특별 채용', TRUE, 2, NOW(), NOW());

-- 근무 형태 (WORK_TYPE)
INSERT INTO common_code (code, group_code, name, description, is_active, sort_order, created_at, updated_at) VALUES 
('WORK_IN', 'WORK_TYPE', '내근직', '내근직', TRUE, 1, NOW(), NOW()),
('WORK_OUT', 'WORK_TYPE', '외근직', '외근직', TRUE, 2, NOW(), NOW());

-- 급여 형태 (PAY_TYPE)
INSERT INTO common_code (code, group_code, name, description, is_active, sort_order, created_at, updated_at) VALUES 
('PAY_SALARY', 'PAY_TYPE', '연봉제', '연봉제', TRUE, 1, NOW(), NOW()),
('PAY_MONTH', 'PAY_TYPE', '월급제', '월급제', TRUE, 2, NOW(), NOW());

-- 세금 유형 (TAX_TYPE)
INSERT INTO common_code (code, group_code, name, description, is_active, sort_order, created_at, updated_at) VALUES 
('TAX_EARNED', 'TAX_TYPE', '근로소득', '근로소득', TRUE, 1, NOW(), NOW());

-- V26__add_before_fields_to_appointment.sql
-- 발령 전 부서 및 직급 정보 컬럼 추가
ALTER TABLE appointment
ADD COLUMN before_department_id BIGINT,
ADD COLUMN before_position_code VARCHAR(50);

ALTER TABLE appointment
ADD CONSTRAINT fk_appointment_before_dept
FOREIGN KEY (before_department_id) REFERENCES department(id);

ALTER TABLE appointment
ADD CONSTRAINT fk_appointment_before_pos
FOREIGN KEY (before_position_code) REFERENCES common_code(code);

-- V28__create_approval_comment_table.sql
CREATE TABLE approval_comment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id_str VARCHAR(50) NOT NULL,
    employee_id BIGINT NOT NULL,
    content VARCHAR(1000) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_approval_comment_employee FOREIGN KEY (employee_id) REFERENCES employee(id)
);

-- V30__add_rich_department_fields_and_seed.sql
-- 1. 새로운 7대 속성 컬럼 추가 및 외래 키(부서장) 설정
ALTER TABLE department
ADD COLUMN dept_code VARCHAR(50) UNIQUE,
ADD COLUMN name_en VARCHAR(100),
ADD COLUMN manager_id BIGINT,
ADD COLUMN location VARCHAR(150),
ADD COLUMN phone VARCHAR(50),
ADD COLUMN established_date DATE,
ADD COLUMN description TEXT;

ALTER TABLE department
ADD CONSTRAINT fk_dept_manager
FOREIGN KEY (manager_id) REFERENCES employee(id) ON DELETE SET NULL;

-- 2. 기존 부서 이름 정규화 (원장실 -> 병원장)
UPDATE department SET name = '병원장' WHERE name = '원장실' OR name = '관리팀';

-- 3. 부족한 부문(Division) 데이터 신규 삽입
INSERT INTO department (name, parent_id, created_at, updated_at)
SELECT '진료부문', (SELECT id FROM (SELECT id FROM department WHERE name = '병원장' LIMIT 1) AS t), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM department WHERE name = '진료부문');

INSERT INTO department (name, parent_id, created_at, updated_at)
SELECT '간호부문', (SELECT id FROM (SELECT id FROM department WHERE name = '병원장' LIMIT 1) AS t), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM department WHERE name = '간호부문');

INSERT INTO department (name, parent_id, created_at, updated_at)
SELECT '행정지원부문', (SELECT id FROM (SELECT id FROM department WHERE name = '병원장' LIMIT 1) AS t), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM department WHERE name = '행정지원부문');

-- 약제부, 시설관리팀 누락 추가
INSERT INTO department (name, created_at, updated_at)
SELECT '약제부', NOW(), NOW() WHERE NOT EXISTS (SELECT 1 FROM department WHERE name = '약제부');

INSERT INTO department (name, created_at, updated_at)
SELECT '시설관리팀', NOW(), NOW() WHERE NOT EXISTS (SELECT 1 FROM department WHERE name = '시설관리팀');

INSERT INTO department (name, created_at, updated_at)
SELECT '감염관리실', NOW(), NOW() WHERE NOT EXISTS (SELECT 1 FROM department WHERE name = '감염관리실');

-- 4. 부서 계층(Tree) 연결 (Figma 명세 기준)
-- 진료부문 산하
UPDATE department SET parent_id = (SELECT id FROM (SELECT id FROM department WHERE name = '진료부문' LIMIT 1) AS t)
WHERE name IN ('영상의학과', '진단검사의학과', '응급의학과', '응급실', '약제부');

-- 간호부문 산하
UPDATE department SET parent_id = (SELECT id FROM (SELECT id FROM department WHERE name = '간호부문' LIMIT 1) AS t)
WHERE name IN ('간호부', '간호본부', '감염관리실', '중환자실');

-- 행정지원부문 산하
UPDATE department SET parent_id = (SELECT id FROM (SELECT id FROM department WHERE name = '행정지원부문' LIMIT 1) AS t)
WHERE name IN ('원무과', '인사총무팀', '시설관리팀');

-- 5. 기본 상세 정보(Mockup) 및 임시 부서코드 업데이트
UPDATE department SET dept_code = CONCAT('DEPT-', LPAD(id, 4, '0')) WHERE dept_code IS NULL;

-- 영상의학과 특수 데이터 주입 (피그마 상세 디자인 맵핑용)
UPDATE department 
SET 
    dept_code = 'DEPT-1002',
    name_en = 'Radiology',
    manager_id = (SELECT id FROM employee WHERE name = '박시준' LIMIT 1),
    location = '본관 3층',
    phone = '02-1234-3300',
    established_date = '2008-04-01',
    description = 'X-ray, CT, MRI 등 영상 진단 및 판독 업무를 담당하며, 응급의학과·진료부문 산하 검사 협진을 지원합니다.'
WHERE name = '영상의학과';

-- 간호부 상세
UPDATE department 
SET 
    name_en = 'Nursing Department',
    manager_id = (SELECT id FROM employee WHERE name = '이다영' LIMIT 1),
    location = '신관 2층',
    phone = '02-1234-4400',
    established_date = '2010-01-01',
    description = '입원 및 외래 환자 간호, 3교대 듀티 배정 및 환자 안위 관리 전담.'
WHERE name = '간호부';

-- 인사총무팀 상세
UPDATE department 
SET 
    name_en = 'HR & General Affairs',
    manager_id = (SELECT id FROM employee WHERE name = '시스템관리자' LIMIT 1),
    location = '행정동 5층',
    phone = '02-1234-5500',
    established_date = '2015-05-15',
    description = '전사 인사 관리, 채용, 급여 정산 및 시설 총무를 관할합니다.'
WHERE name = '인사총무팀';

-- V31__add_status_to_appointment.sql
ALTER TABLE appointment
ADD COLUMN status VARCHAR(20) DEFAULT 'WAITING';

-- V32__add_work_day_and_shift_codes.sql
-- 근무 형태 (WORK_TYPE) 추가 (프론트엔드와 맞춤)
INSERT INTO common_code (code, group_code, name, description, is_active, sort_order, created_at, updated_at) VALUES 
('WORK_DAY', 'WORK_TYPE', '상근', '상근', TRUE, 3, NOW(), NOW()),
('WORK_SHIFT', 'WORK_TYPE', '교대', '교대', TRUE, 4, NOW(), NOW());

-- V33__update_payroll_menu_names.sql
-- V31: 급여 관련 메뉴 이름 프론트엔드 표기(네비게이션)와 통일
UPDATE menu 
SET 
  name = '급여 기본 정보 관리', 
  description = '직원별 연봉/기본급 및 수당/공제 기준표 설정' 
WHERE menu_code = 'PAYROLL_INFO';

UPDATE menu 
SET 
  name = '급여 처리', 
  description = '전 직원 월별 급여 정산 및 급여 대장 생성' 
WHERE menu_code = 'PAYROLL_PROC';

-- V34__update_system_menu_names_to_match_sidebar.sql
-- V32__update_system_menu_names_to_match_sidebar.sql

UPDATE menu SET name = '결재 대기함' WHERE menu_code = 'APPROVAL_INBOX';
UPDATE menu SET name = '기안 문서함' WHERE menu_code = 'APPROVAL_DRAFT';
UPDATE menu SET name = '직원관리' WHERE menu_code = 'EMP_LIST';
UPDATE menu SET name = '조직관리' WHERE menu_code = 'EMP_ORG';
UPDATE menu SET name = '인사발령 관리' WHERE menu_code = 'APPOINTMENT';
UPDATE menu SET name = '듀티표 편성' WHERE menu_code = 'DUTY_SCHEDULE';
UPDATE menu SET name = '출퇴근 관리' WHERE menu_code = 'ATTEND_ADMIN';
UPDATE menu SET name = '근태 연동' WHERE menu_code = 'ATTEND_CHECK';
UPDATE menu SET name = '휴가 관리' WHERE menu_code = 'LEAVE_STATUS';
UPDATE menu SET name = '기본 정보 관리' WHERE menu_code = 'PAYROLL_INFO';
UPDATE menu SET name = '급여 처리' WHERE menu_code = 'PAYROLL_PROC';
UPDATE menu SET name = '법정 신고' WHERE menu_code = 'STATUTORY_REPORT';
UPDATE menu SET name = '권한 그룹 및 메뉴 관리' WHERE menu_code = 'SYSTEM_ROLES';
UPDATE menu SET name = '공통 코드 설정' WHERE menu_code = 'SYSTEM_CODE';

-- V36__fix_admin_002_shift_worker.sql
-- V36: ADMIN-002 (시스템 관리자) 계정의 교대근무자 여부 수정

UPDATE employee SET is_shift_worker = FALSE WHERE emp_no = 'ADMIN-002';

-- V37__fix_base_salary_and_positions.sql
-- V37__fix_base_salary_and_positions.sql
-- Fix actual_amount being NULL for existing base_salary entries which causes payroll calculation to fail.
-- Also add missing job_titles (positions) used by employees that were not in base_salary.

UPDATE base_salary SET actual_amount = 4500000 WHERE job_title = '수간호사' AND actual_amount IS NULL;
UPDATE base_salary SET actual_amount = 3300000 WHERE job_title = '일반간호사' AND actual_amount IS NULL;
UPDATE base_salary SET actual_amount = 9000000 WHERE job_title = '의사(전문의)' AND actual_amount IS NULL;
UPDATE base_salary SET actual_amount = 3000000 WHERE job_title = '행정직원' AND actual_amount IS NULL;

INSERT INTO base_salary (job_title, min_amount, max_amount, actual_amount)
SELECT '수석', 5000000, 6000000, 5500000
WHERE NOT EXISTS (SELECT 1 FROM base_salary WHERE job_title = '수석');

INSERT INTO base_salary (job_title, min_amount, max_amount, actual_amount)
SELECT '1급', 4000000, 5000000, 4500000
WHERE NOT EXISTS (SELECT 1 FROM base_salary WHERE job_title = '1급');

-- V38__fix_allowance_item_amounts.sql
-- V38__fix_allowance_item_amounts.sql
-- Fix amount_or_rate for allowance items being '정액' instead of numeric values,
-- which caused IllegalArgumentException during payroll calculation.

UPDATE allowance_item SET amount_or_rate = '100000' WHERE name = '직책수당' AND amount_or_rate = '정액';
UPDATE allowance_item SET amount_or_rate = '50000' WHERE name = '특수업무수당' AND amount_or_rate = '정액';
