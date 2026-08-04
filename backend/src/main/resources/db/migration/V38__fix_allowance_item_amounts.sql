-- V38__fix_allowance_item_amounts.sql
-- Fix amount_or_rate for allowance items being '정액' instead of numeric values,
-- which caused IllegalArgumentException during payroll calculation.

UPDATE allowance_item SET amount_or_rate = '100000' WHERE name = '직책수당' AND amount_or_rate = '정액';
UPDATE allowance_item SET amount_or_rate = '50000' WHERE name = '특수업무수당' AND amount_or_rate = '정액';
