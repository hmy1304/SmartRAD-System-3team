-- 인사 발령의 실제 반영(Employee.department/position 업데이트) 여부를 추적하기 위한 컬럼
ALTER TABLE appointment
ADD COLUMN applied BOOLEAN NOT NULL DEFAULT FALSE;

-- 발령에 따른 호봉 변경이 있는 경우 SalaryGradeHistory 자동 연동 생성을 위한 컬럼
ALTER TABLE appointment
ADD COLUMN after_pay_step INT NULL;
