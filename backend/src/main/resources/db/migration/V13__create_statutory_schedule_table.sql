CREATE TABLE statutory_schedule (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    agency VARCHAR(50),
    category VARCHAR(50),
    target VARCHAR(50),
    deadline DATE NOT NULL,
    head_count INT,
    estimated_amount BIGINT,
    memo VARCHAR(500),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

INSERT INTO statutory_schedule (title, agency, category, target, deadline, head_count, estimated_amount, memo, status, created_at, updated_at) VALUES 
('국민연금 사업장가입자 자격취득신고', '국민연금공단', '취득', '신규 입사자', '2026-07-15', 5, 0, '신규 입사자 5명 취득 신고', 'COMPLETED', NOW(), NOW()),
('건강보험 직장가입자 자격상실신고', '국민건강보험공단', '상실', '퇴사자', '2026-07-14', 2, 0, '퇴사자 2명 상실 신고', 'COMPLETED', NOW(), NOW()),
('근로소득세 원천징수이행상황신고', '국세청', '세금', '전 직원', '2026-08-10', 0, 15000000, '7월 귀속분 원천세 신고', 'PENDING', NOW(), NOW()),
('지방소득세 특별징수분 납부', '관할구청', '세금', '전 직원', '2026-08-10', 0, 1500000, '7월 귀속분 지방소득세 납부', 'PENDING', NOW(), NOW()),
('고용/산재보험 근로내용 확인신고', '근로복지공단', '신고', '일용직', '2026-08-15', 3, 0, '7월 일용근로자 근로내용 신고', 'PENDING', NOW(), NOW());
