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
