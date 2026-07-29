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
