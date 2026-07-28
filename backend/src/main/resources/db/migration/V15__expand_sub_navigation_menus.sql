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

-- (4) 일반직원: ESS 본인 화면(기안 작성, 출퇴근 체크, 명세서 조회, 연차 현황 등) 전용
INSERT INTO role_permission (role_group_id, menu_id, can_read, can_write, can_delete, can_approve, created_at, updated_at)
SELECT rg.id, m.id, TRUE, TRUE, FALSE, FALSE, NOW(), NOW()
FROM role_group rg
CROSS JOIN menu m
WHERE rg.name = '일반직원'
  AND m.menu_code IN ('APPROVAL_DRAFT', 'ATTEND_CHECK');

INSERT INTO role_permission (role_group_id, menu_id, can_read, can_write, can_delete, can_approve, created_at, updated_at)
SELECT rg.id, m.id, TRUE, FALSE, FALSE, FALSE, NOW(), NOW()
FROM role_group rg
CROSS JOIN menu m
WHERE rg.name = '일반직원'
  AND m.menu_code IN ('LEAVE_STATUS', 'PAYROLL_INFO', 'EMP_ORG', 'NOTICE', 'DUTY_SCHEDULE');

INSERT INTO role_permission (role_group_id, menu_id, can_read, can_write, can_delete, can_approve, created_at, updated_at)
SELECT rg.id, m.id, FALSE, FALSE, FALSE, FALSE, NOW(), NOW()
FROM role_group rg
CROSS JOIN menu m
WHERE rg.name = '일반직원'
  AND m.menu_code IN ('APPROVAL_INBOX', 'EMP_LIST', 'APPOINTMENT', 'ATTEND_ADMIN', 'PAYROLL_PROC', 'STATUTORY_REPORT', 'SYSTEM_ROLES', 'SYSTEM_CODE');
