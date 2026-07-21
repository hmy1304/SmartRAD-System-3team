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
  AND m.menu_code IN ('EMP_MASTER', 'ATTENDANCE', 'LICENSE_EDU_HEALTH', 'PAYROLL', 'NOTICE');

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
