-- 근무 형태 (WORK_TYPE) 추가 (프론트엔드와 맞춤)
INSERT INTO common_code (code, group_code, name, description, is_active, sort_order, created_at, updated_at) VALUES 
('WORK_DAY', 'WORK_TYPE', '상근', '상근', TRUE, 3, NOW(), NOW()),
('WORK_SHIFT', 'WORK_TYPE', '교대', '교대', TRUE, 4, NOW(), NOW());
