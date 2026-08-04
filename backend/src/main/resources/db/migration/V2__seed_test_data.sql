
-- V5_1__add_test_data.sql
-- 1. 결재 문서 양식(CommonCode) 테스트 데이터 추가
INSERT INTO common_code (code, group_code, name, description, created_at, updated_at) VALUES 
('DOC_VACATION', 'DOC_TYPE', '휴가계', '연차, 반차 등 휴가 신청서', NOW(), NOW()),
('DOC_WELFARE', 'DOC_TYPE', '경조금 신청서', '결혼, 조의 등 경조금 신청', NOW(), NOW()),
('DOC_CERT', 'DOC_TYPE', '제증명 발급', '재직증명서, 경력증명서 등 발급 신청', NOW(), NOW());

-- V12__update_employee_and_payroll_record.sql
ALTER TABLE employee ADD COLUMN bank_name VARCHAR(50);
ALTER TABLE payroll_record ADD COLUMN transfer_status VARCHAR(20) DEFAULT 'NONE';
ALTER TABLE payroll_record ADD COLUMN transfer_date DATETIME;

-- V20__seed_attendance_test_data.sql
-- 출퇴근 관제 및 정정 페이지 실연동 검증을 위한 2026년 7월 테스트 데이터 시드 (V20)

INSERT INTO attendance (employee_id, work_date, check_in_time, check_out_time, status, note, is_corrected, correction_reason, corrected_by, created_at, updated_at)
VALUES
-- 2026-07-11 당일 데이터
((SELECT id FROM employee WHERE emp_no = 'RAD-1001' LIMIT 1), '2026-07-11', '08:52:00', '18:01:00', '정상', '정상 퇴근', FALSE, NULL, NULL, NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'NUR-1002' LIMIT 1), '2026-07-11', '07:01:00', '15:12:00', '정상', 'D-Shift (Day 07~15) 정상 종료', FALSE, NULL, NULL, NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'RAD-1004' LIMIT 1), '2026-07-11', '09:23:00', NULL, '지각', '23분 지각 · 사유 확인 필요', FALSE, NULL, NULL, NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'HR-1005' LIMIT 1), '2026-07-11', NULL, NULL, '결근', '무단 결근 · 사유서 대기', FALSE, NULL, NULL, NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'EMR-1006' LIMIT 1), '2026-07-11', '08:59:00', '15:30:00', '조기퇴근', '1.5h 조기 퇴근 · 응급실장 결재 승인', FALSE, NULL, NULL, NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'ADM-1007' LIMIT 1), '2026-07-11', '09:15:00', NULL, '지각', '15분 지각 (아침 응급콜 투입 소약)', FALSE, NULL, NULL, NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'LAB-1003' LIMIT 1), '2026-07-11', '06:45:00', '15:20:00', '정상', 'D-Shift (Day) 완료', FALSE, NULL, NULL, NOW(), NOW()),

-- 이다영 간호사의 월간 타임라인 대장 확인용 7월 1일 ~ 10일 기록
((SELECT id FROM employee WHERE emp_no = 'NUR-1002' LIMIT 1), '2026-07-10', '06:50:00', '15:05:00', '정상', 'D-Shift 완료', FALSE, NULL, NULL, NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'NUR-1002' LIMIT 1), '2026-07-09', '06:55:00', '15:30:00', '정상', '초과 근로 30분', FALSE, NULL, NULL, NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'NUR-1002' LIMIT 1), '2026-07-08', '07:25:00', '15:10:00', '정상', '[관리자정정] 응급실 지원 파견으로 시간 소급 처리', TRUE, '응급실 긴급 지원 요청에 의한 태깅 지연 소급 인정', 'ADMIN-001', NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'NUR-1002' LIMIT 1), '2026-07-07', '06:48:00', '15:00:00', '정상', '정상 퇴근', FALSE, NULL, NULL, NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'NUR-1002' LIMIT 1), '2026-07-06', '22:50:00', '07:15:00', '정상', 'N-Shift (Night 23~07) 완료', FALSE, NULL, NULL, NOW(), NOW());

-- V22__add_attendance_seed_data.sql
-- 2026년 7월 테스트용 근태 데이터
-- 'ADMIN-001'과 'RN-1004' 사원에 대한 일부 근태 현황 삽입

INSERT INTO attendance (employee_id, work_date, check_in_time, check_out_time, status, created_at, updated_at)
SELECT id, '2026-07-01', '08:50:00', '18:10:00', 'NORMAL', NOW(), NOW() FROM employee WHERE emp_no = 'ADMIN-001';

INSERT INTO attendance (employee_id, work_date, check_in_time, check_out_time, status, created_at, updated_at)
SELECT id, '2026-07-02', '08:55:00', '18:05:00', 'NORMAL', NOW(), NOW() FROM employee WHERE emp_no = 'ADMIN-001';

INSERT INTO attendance (employee_id, work_date, check_in_time, check_out_time, status, created_at, updated_at)
SELECT id, '2026-07-03', '09:15:00', '18:00:00', 'LATE', NOW(), NOW() FROM employee WHERE emp_no = 'ADMIN-001';

INSERT INTO attendance (employee_id, work_date, check_in_time, check_out_time, status, created_at, updated_at)
SELECT id, '2026-07-06', '08:45:00', '18:30:00', 'NORMAL', NOW(), NOW() FROM employee WHERE emp_no = 'ADMIN-001';

-- RN-1004 (수간호사)
INSERT INTO attendance (employee_id, work_date, check_in_time, check_out_time, status, created_at, updated_at)
SELECT id, '2026-07-01', '07:50:00', '16:10:00', 'NORMAL', NOW(), NOW() FROM employee WHERE emp_no = 'RN-1004';

INSERT INTO attendance (employee_id, work_date, check_in_time, check_out_time, status, created_at, updated_at)
SELECT id, '2026-07-02', '07:55:00', '16:05:00', 'NORMAL', NOW(), NOW() FROM employee WHERE emp_no = 'RN-1004';

INSERT INTO attendance (employee_id, work_date, check_in_time, check_out_time, status, created_at, updated_at)
SELECT id, '2026-07-03', '08:15:00', '16:00:00', 'LATE', NOW(), NOW() FROM employee WHERE emp_no = 'RN-1004';

INSERT INTO attendance (employee_id, work_date, check_in_time, check_out_time, status, created_at, updated_at)
SELECT id, '2026-07-06', NULL, NULL, 'ABSENT', NOW(), NOW() FROM employee WHERE emp_no = 'RN-1004';

INSERT INTO attendance (employee_id, work_date, check_in_time, check_out_time, status, created_at, updated_at)
SELECT id, '2026-07-07', '07:45:00', '16:30:00', 'NORMAL', NOW(), NOW() FROM employee WHERE emp_no = 'RN-1004';

-- 휴가 예시
INSERT INTO attendance (employee_id, work_date, check_in_time, check_out_time, status, created_at, updated_at)
SELECT id, '2026-07-08', NULL, NULL, 'LEAVE', NOW(), NOW() FROM employee WHERE emp_no = 'RN-1004';

-- V25__add_more_shift_workers.sql
-- 25. 듀티표 편성을 위해 더 많은 교대 근무자(더미 사원) 추가 및 수정

-- 기존 더미 데이터 중 일반 직원들의 is_shift_worker 값을 TRUE로 업데이트 (테스트용)
UPDATE employee 
SET is_shift_worker = TRUE 
WHERE emp_no != 'ADMIN-001' AND name != '시스템관리자';

-- 각 부서(간호부, 중환자실, 응급실, 영상의학과 등)에 교대 근무자 여러 명 추가
INSERT INTO employee (emp_no, name, password, email, phone, join_date, is_shift_worker, role_group_id, department_id, position_code, job_category_code, created_at, updated_at) 
VALUES 
-- 간호부 (department_id = 2) 추가 사원
('RN-1011', '김간호1', '1234', 'rn1011@tphr.com', '010-1011-1011', '2023-01-01', TRUE, (SELECT id FROM role_group WHERE name = '일반직원' LIMIT 1), (SELECT id FROM department WHERE name = '간호부' LIMIT 1), 'POS_03', 'JOB_02', NOW(), NOW()),
('RN-1012', '이간호2', '1234', 'rn1012@tphr.com', '010-1012-1012', '2023-02-01', TRUE, (SELECT id FROM role_group WHERE name = '일반직원' LIMIT 1), (SELECT id FROM department WHERE name = '간호부' LIMIT 1), 'POS_03', 'JOB_02', NOW(), NOW()),
('RN-1013', '박간호3', '1234', 'rn1013@tphr.com', '010-1013-1013', '2023-03-01', TRUE, (SELECT id FROM role_group WHERE name = '일반직원' LIMIT 1), (SELECT id FROM department WHERE name = '간호부' LIMIT 1), 'POS_03', 'JOB_02', NOW(), NOW()),
('RN-1014', '최간호4', '1234', 'rn1014@tphr.com', '010-1014-1014', '2023-04-01', TRUE, (SELECT id FROM role_group WHERE name = '일반직원' LIMIT 1), (SELECT id FROM department WHERE name = '간호부' LIMIT 1), 'POS_03', 'JOB_02', NOW(), NOW()),
('RN-1015', '정간호5', '1234', 'rn1015@tphr.com', '010-1015-1015', '2023-05-01', TRUE, (SELECT id FROM role_group WHERE name = '일반직원' LIMIT 1), (SELECT id FROM department WHERE name = '간호부' LIMIT 1), 'POS_03', 'JOB_02', NOW(), NOW()),

-- 중환자실 (department_id = 3) 추가 사원
('ICU-2011', '강중환1', '1234', 'icu2011@tphr.com', '010-2011-2011', '2022-01-01', TRUE, (SELECT id FROM role_group WHERE name = '일반직원' LIMIT 1), (SELECT id FROM department WHERE name = '중환자실' LIMIT 1), 'POS_03', 'JOB_02', NOW(), NOW()),
('ICU-2012', '조중환2', '1234', 'icu2012@tphr.com', '010-2012-2012', '2022-02-01', TRUE, (SELECT id FROM role_group WHERE name = '일반직원' LIMIT 1), (SELECT id FROM department WHERE name = '중환자실' LIMIT 1), 'POS_03', 'JOB_02', NOW(), NOW()),
('ICU-2013', '윤중환3', '1234', 'icu2013@tphr.com', '010-2013-2013', '2022-03-01', TRUE, (SELECT id FROM role_group WHERE name = '일반직원' LIMIT 1), (SELECT id FROM department WHERE name = '중환자실' LIMIT 1), 'POS_03', 'JOB_02', NOW(), NOW()),
('ICU-2014', '장중환4', '1234', 'icu2014@tphr.com', '010-2014-2014', '2022-04-01', TRUE, (SELECT id FROM role_group WHERE name = '일반직원' LIMIT 1), (SELECT id FROM department WHERE name = '중환자실' LIMIT 1), 'POS_03', 'JOB_02', NOW(), NOW()),

-- 응급실 (department_id = 4) 추가 사원
('ER-3011', '임응급1', '1234', 'er3011@tphr.com', '010-3011-3011', '2024-01-01', TRUE, (SELECT id FROM role_group WHERE name = '일반직원' LIMIT 1), (SELECT id FROM department WHERE name = '응급실' LIMIT 1), 'POS_03', 'JOB_02', NOW(), NOW()),
('ER-3012', '한응급2', '1234', 'er3012@tphr.com', '010-3012-3012', '2024-02-01', TRUE, (SELECT id FROM role_group WHERE name = '일반직원' LIMIT 1), (SELECT id FROM department WHERE name = '응급실' LIMIT 1), 'POS_03', 'JOB_02', NOW(), NOW()),
('ER-3013', '오응급3', '1234', 'er3013@tphr.com', '010-3013-3013', '2024-03-01', TRUE, (SELECT id FROM role_group WHERE name = '일반직원' LIMIT 1), (SELECT id FROM department WHERE name = '응급실' LIMIT 1), 'POS_03', 'JOB_02', NOW(), NOW());

-- V27__add_appointment_dummy_data.sql
-- 보직변경 코드 추가
INSERT INTO common_code (code, group_code, name, created_at, updated_at) VALUES
('APT_ROLE', 'APT', '보직변경', NOW(), NOW());

-- 발령 데이터 삽입 (과거 완료된 발령 및 미래 예정된 발령 등)
-- employee id 1: ADMIN-001 (현재 부서 1, 직급 POS_01)
-- employee id 2: RN-1004 (현재 부서 3, 직급 POS_03)
-- employee id 3: RN-2001 (현재 부서 3, 직급 POS_03)

INSERT INTO appointment (employee_id, appointment_type_code, before_department_id, before_position_code, after_department_id, after_position_code, apply_date, note, applied, created_at, updated_at) VALUES
-- 완료된 발령 (apply_date가 과거, applied = true)
(1, 'APT_PROMOTE', 1, 'POS_02', 1, 'POS_01', '2026-07-01', '성과 우수 승진', true, NOW(), NOW()),
(2, 'APT_TRANSFER', 2, 'POS_03', 3, 'POS_03', '2026-07-05', '부서 이동', true, NOW(), NOW()),

-- 오늘 또는 어제 처리된 발령 (applied = true)
(3, 'APT_ROLE', 3, 'POS_02', 3, 'POS_03', '2026-07-08', '직책 변경', true, NOW(), NOW()),

-- 대기중인 발령 (apply_date가 미래, applied = false)
(4, 'APT_PROMOTE', 4, 'POS_02', 4, 'POS_01', '2026-08-01', '하반기 정기 승진', false, NOW(), NOW()),
(5, 'APT_TRANSFER', 2, 'POS_03', 3, 'POS_03', '2026-08-15', '인력 재배치', false, NOW(), NOW());

-- V29__fix_duplicate_payroll_records.sql
-- 1. 중복된 급여 기록 중 나중에 생성된(id가 더 큰) 기록에 연결된 payroll_detail 삭제
DELETE pd FROM payroll_detail pd
JOIN payroll_record pr ON pd.payroll_record_id = pr.id
JOIN payroll_record pr2 ON pr.employee_id = pr2.employee_id
    AND pr.payroll_year = pr2.payroll_year
    AND pr.payroll_month = pr2.payroll_month
    AND pr.id > pr2.id;

-- 2. 중복된 급여 기록 삭제 (id가 더 큰 것들을 삭제)
DELETE p1 FROM payroll_record p1
JOIN payroll_record p2
ON p1.employee_id = p2.employee_id
AND p1.payroll_year = p2.payroll_year
AND p1.payroll_month = p2.payroll_month
AND p1.id > p2.id;

-- 3. 유니크 제약 조건 추가 (추후 중복 방지)
ALTER TABLE payroll_record
ADD CONSTRAINT uq_payroll_record_emp_year_month UNIQUE (employee_id, payroll_year, payroll_month);

-- V35__seed_notice_data.sql
-- 1. 공지사항 시드 데이터 추가
INSERT INTO notice (title, content, notice_type_code, is_important, author_id, view_count, expiration_date, created_at, updated_at)
VALUES
('시스템 점검 안내 (주말)', '<p>이번 주 주말(토/일) 동안 인사시스템(SmartRAD) 정기 점검이 진행될 예정입니다.<br>점검 시간 중에는 시스템 접속이 원활하지 않을 수 있으니 양해 부탁드립니다.</p>', 'NOTICE_GENERAL', TRUE, (SELECT id FROM employee WHERE emp_no = 'ADMIN-001' LIMIT 1), 150, DATE_ADD(NOW(), INTERVAL 7 DAY), NOW(), NOW()),
('2026년도 건강검진 실시 안내', '<p>2026년도 전직원 건강검진을 아래와 같이 실시합니다.<br>대상자는 기한 내 검진을 완료해 주시기 바랍니다.</p>', 'NOTICE_GENERAL', FALSE, (SELECT id FROM employee WHERE emp_no = 'ADMIN-001' LIMIT 1), 85, DATE_ADD(NOW(), INTERVAL 30 DAY), NOW(), NOW()),
('[긴급] 감염관리 지침 업데이트 안내', '<p>원내 감염관리 지침이 새롭게 개정되었습니다.<br>전 부서는 첨부된 지침을 숙지하고 현장에 즉각 반영해주시기 바랍니다.</p>', 'NOTICE_URGENT', TRUE, (SELECT id FROM employee WHERE emp_no = 'ADMIN-001' LIMIT 1), 210, DATE_ADD(NOW(), INTERVAL 3 DAY), NOW(), NOW()),
('하계 휴가 사용 촉진의 건', '<p>부서장님들은 직원들의 하계 휴가 사용 계획을 취합하여 이번주 내로 결재를 올려주시기 바랍니다.</p>', 'NOTICE_GENERAL', FALSE, (SELECT id FROM employee WHERE emp_no = 'ADMIN-001' LIMIT 1), 45, NULL, NOW(), NOW());
