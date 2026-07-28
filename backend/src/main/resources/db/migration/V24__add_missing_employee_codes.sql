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
