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
