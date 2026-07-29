-- 발령 전 부서 및 직급 정보 컬럼 추가
ALTER TABLE appointment
ADD COLUMN before_department_id BIGINT,
ADD COLUMN before_position_code VARCHAR(50);

ALTER TABLE appointment
ADD CONSTRAINT fk_appointment_before_dept
FOREIGN KEY (before_department_id) REFERENCES department(id);

ALTER TABLE appointment
ADD CONSTRAINT fk_appointment_before_pos
FOREIGN KEY (before_position_code) REFERENCES common_code(code);
