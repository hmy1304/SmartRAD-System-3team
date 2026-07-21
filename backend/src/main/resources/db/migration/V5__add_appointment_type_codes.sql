-- 인사 발령(Appointment) 유형 코드 시드 데이터
-- POST /appointments 의 appointmentTypeCode 로 사용된다.
INSERT INTO common_code (code, group_code, name, created_at, updated_at) VALUES
('APT_PROMOTE', 'APT', '승진', NOW(), NOW()),
('APT_TRANSFER', 'APT', '전보', NOW(), NOW()),
('APT_DEMOTE', 'APT', '강등', NOW(), NOW()),
('APT_DISPATCH', 'APT', '파견', NOW(), NOW());
