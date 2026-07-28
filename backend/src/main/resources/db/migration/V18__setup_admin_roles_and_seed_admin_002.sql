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
