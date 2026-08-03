-- V36: ADMIN-002 (시스템 관리자) 계정의 교대근무자 여부 수정

UPDATE employee SET is_shift_worker = FALSE WHERE emp_no = 'ADMIN-002';
