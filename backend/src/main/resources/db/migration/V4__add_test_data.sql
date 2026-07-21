-- 1. 결재 문서 양식(CommonCode) 테스트 데이터 추가
INSERT INTO common_code (code, group_code, name, description, created_at, updated_at) VALUES 
('DOC_VACATION', 'DOC_TYPE', '휴가계', '연차, 반차 등 휴가 신청서', NOW(), NOW()),
('DOC_WELFARE', 'DOC_TYPE', '경조금 신청서', '결혼, 조의 등 경조금 신청', NOW(), NOW()),
('DOC_CERT', 'DOC_TYPE', '제증명 발급', '재직증명서, 경력증명서 등 발급 신청', NOW(), NOW());
