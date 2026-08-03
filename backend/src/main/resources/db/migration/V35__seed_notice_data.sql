-- 1. 공지사항 시드 데이터 추가
INSERT INTO notice (title, content, notice_type_code, is_important, author_id, view_count, expiration_date, created_at, updated_at)
VALUES
('시스템 점검 안내 (주말)', '<p>이번 주 주말(토/일) 동안 인사시스템(SmartRAD) 정기 점검이 진행될 예정입니다.<br>점검 시간 중에는 시스템 접속이 원활하지 않을 수 있으니 양해 부탁드립니다.</p>', 'NOTICE_GENERAL', TRUE, (SELECT id FROM employee WHERE emp_no = 'ADMIN-001' LIMIT 1), 150, DATE_ADD(NOW(), INTERVAL 7 DAY), NOW(), NOW()),
('2026년도 건강검진 실시 안내', '<p>2026년도 전직원 건강검진을 아래와 같이 실시합니다.<br>대상자는 기한 내 검진을 완료해 주시기 바랍니다.</p>', 'NOTICE_GENERAL', FALSE, (SELECT id FROM employee WHERE emp_no = 'ADMIN-001' LIMIT 1), 85, DATE_ADD(NOW(), INTERVAL 30 DAY), NOW(), NOW()),
('[긴급] 감염관리 지침 업데이트 안내', '<p>원내 감염관리 지침이 새롭게 개정되었습니다.<br>전 부서는 첨부된 지침을 숙지하고 현장에 즉각 반영해주시기 바랍니다.</p>', 'NOTICE_URGENT', TRUE, (SELECT id FROM employee WHERE emp_no = 'ADMIN-001' LIMIT 1), 210, DATE_ADD(NOW(), INTERVAL 3 DAY), NOW(), NOW()),
('하계 휴가 사용 촉진의 건', '<p>부서장님들은 직원들의 하계 휴가 사용 계획을 취합하여 이번주 내로 결재를 올려주시기 바랍니다.</p>', 'NOTICE_GENERAL', FALSE, (SELECT id FROM employee WHERE emp_no = 'ADMIN-001' LIMIT 1), 45, NULL, NOW(), NOW());
