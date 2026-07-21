-- 공지사항(Notice) 유형 코드 시드 데이터
-- POST /notices 의 noticeTypeCode 로 사용된다.
INSERT INTO common_code (code, group_code, name, created_at, updated_at) VALUES
('NOTICE_GENERAL', 'NOTICE', '일반', NOW(), NOW()),
('NOTICE_URGENT', 'NOTICE', '긴급', NOW(), NOW());
