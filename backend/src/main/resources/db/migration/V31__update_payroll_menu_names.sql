-- V31: 급여 관련 메뉴 이름 프론트엔드 표기(네비게이션)와 통일
UPDATE menu 
SET 
  name = '급여 기본 정보 관리', 
  description = '직원별 연봉/기본급 및 수당/공제 기준표 설정' 
WHERE menu_code = 'PAYROLL_INFO';

UPDATE menu 
SET 
  name = '급여 처리', 
  description = '전 직원 월별 급여 정산 및 급여 대장 생성' 
WHERE menu_code = 'PAYROLL_PROC';
