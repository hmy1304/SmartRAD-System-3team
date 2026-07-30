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
