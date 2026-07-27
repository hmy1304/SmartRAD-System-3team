ALTER TABLE employee ADD COLUMN bank_name VARCHAR(50);
ALTER TABLE payroll_record ADD COLUMN transfer_status VARCHAR(20) DEFAULT 'NONE';
ALTER TABLE payroll_record ADD COLUMN transfer_date DATETIME;
