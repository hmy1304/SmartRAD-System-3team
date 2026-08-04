-- V37__fix_base_salary_and_positions.sql
-- Fix actual_amount being NULL for existing base_salary entries which causes payroll calculation to fail.
-- Also add missing job_titles (positions) used by employees that were not in base_salary.

UPDATE base_salary SET actual_amount = 4500000 WHERE job_title = '수간호사' AND actual_amount IS NULL;
UPDATE base_salary SET actual_amount = 3300000 WHERE job_title = '일반간호사' AND actual_amount IS NULL;
UPDATE base_salary SET actual_amount = 9000000 WHERE job_title = '의사(전문의)' AND actual_amount IS NULL;
UPDATE base_salary SET actual_amount = 3000000 WHERE job_title = '행정직원' AND actual_amount IS NULL;

INSERT INTO base_salary (job_title, min_amount, max_amount, actual_amount)
SELECT '수석', 5000000, 6000000, 5500000
WHERE NOT EXISTS (SELECT 1 FROM base_salary WHERE job_title = '수석');

INSERT INTO base_salary (job_title, min_amount, max_amount, actual_amount)
SELECT '1급', 4000000, 5000000, 4500000
WHERE NOT EXISTS (SELECT 1 FROM base_salary WHERE job_title = '1급');
