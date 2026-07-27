CREATE TABLE base_salary (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_title VARCHAR(50) NOT NULL,
    min_amount BIGINT NOT NULL,
    max_amount BIGINT NOT NULL,
    actual_amount BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE allowance_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    tax_type VARCHAR(20) NOT NULL, -- 과세, 비과세
    amount_type VARCHAR(20) NOT NULL, -- 정액, 비율
    amount_or_rate VARCHAR(50) NOT NULL, -- e.g., 50%, 150%, 정액
    calculation_basis VARCHAR(100), -- e.g., 시간당 통상임금 * 0.5
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE deduction_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    category VARCHAR(20) NOT NULL, -- 법정, 자체
    deduction_type VARCHAR(20) NOT NULL, -- 기본급*요율, 건강보험료*요율, 간이세액표, 정액
    rate_or_amount VARCHAR(50) NOT NULL, -- e.g., 4.5%, 3.545%, 간이세액표, 30000
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE minimum_wage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    apply_year INT NOT NULL,
    hourly_wage BIGINT NOT NULL,
    monthly_wage BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed Data
INSERT INTO base_salary (job_title, min_amount, max_amount, actual_amount) VALUES
('간호부장', 5200000, 6100000, 5840000),
('수간호사', 4100000, 4900000, NULL),
('일반간호사', 2800000, 3800000, NULL),
('의사(전문의)', 7500000, 11000000, NULL),
('행정직원', 2500000, 3400000, NULL);

INSERT INTO allowance_item (name, tax_type, amount_type, amount_or_rate, calculation_basis) VALUES
('야간근무수당', '과세', '비율', '50%', '시간당 통상임금 * 0.5'),
('연장근무수당', '과세', '비율', '150%', NULL),
('휴일근무수당', '과세', '비율', '150%', NULL),
('직책수당', '과세', '정액', '정액', NULL),
('특수업무수당', '과세', '정액', '정액', NULL);

INSERT INTO deduction_item (name, category, deduction_type, rate_or_amount) VALUES
('국민연금', '법정', '기본급*요율', '4.5%'),
('건강보험', '법정', '기본급*요율', '3.545%'),
('장기요양보험', '법정', '건강보험료*요율', '0.9182%'),
('고용보험', '법정', '기본급*요율', '0.9%'),
('소득세', '법정', '간이세액표', '간이세액표'),
('노조비', '자체', '정액', '30000');

INSERT INTO minimum_wage (apply_year, hourly_wage, monthly_wage) VALUES
(2026, 10030, 2096270);
