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
