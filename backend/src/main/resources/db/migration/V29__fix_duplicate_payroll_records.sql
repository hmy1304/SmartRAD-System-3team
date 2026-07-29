-- 1. 중복된 급여 기록 중 나중에 생성된(id가 더 큰) 기록에 연결된 payroll_detail 삭제
DELETE pd FROM payroll_detail pd
JOIN payroll_record pr ON pd.payroll_record_id = pr.id
JOIN payroll_record pr2 ON pr.employee_id = pr2.employee_id
    AND pr.payroll_year = pr2.payroll_year
    AND pr.payroll_month = pr2.payroll_month
    AND pr.id > pr2.id;

-- 2. 중복된 급여 기록 삭제 (id가 더 큰 것들을 삭제)
DELETE p1 FROM payroll_record p1
JOIN payroll_record p2
ON p1.employee_id = p2.employee_id
AND p1.payroll_year = p2.payroll_year
AND p1.payroll_month = p2.payroll_month
AND p1.id > p2.id;

-- 3. 유니크 제약 조건 추가 (추후 중복 방지)
ALTER TABLE payroll_record
ADD CONSTRAINT uq_payroll_record_emp_year_month UNIQUE (employee_id, payroll_year, payroll_month);
