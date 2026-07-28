-- 출퇴근 관제 및 정정 페이지 실연동 검증을 위한 2026년 7월 테스트 데이터 시드 (V20)

INSERT INTO attendance (employee_id, work_date, check_in_time, check_out_time, status, note, is_corrected, correction_reason, corrected_by, created_at, updated_at)
VALUES
-- 2026-07-11 당일 데이터
((SELECT id FROM employee WHERE emp_no = 'RAD-1001' LIMIT 1), '2026-07-11', '08:52:00', '18:01:00', '정상', '정상 퇴근', FALSE, NULL, NULL, NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'NUR-1002' LIMIT 1), '2026-07-11', '07:01:00', '15:12:00', '정상', 'D-Shift (Day 07~15) 정상 종료', FALSE, NULL, NULL, NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'RAD-1004' LIMIT 1), '2026-07-11', '09:23:00', NULL, '지각', '23분 지각 · 사유 확인 필요', FALSE, NULL, NULL, NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'HR-1005' LIMIT 1), '2026-07-11', NULL, NULL, '결근', '무단 결근 · 사유서 대기', FALSE, NULL, NULL, NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'EMR-1006' LIMIT 1), '2026-07-11', '08:59:00', '15:30:00', '조기퇴근', '1.5h 조기 퇴근 · 응급실장 결재 승인', FALSE, NULL, NULL, NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'ADM-1007' LIMIT 1), '2026-07-11', '09:15:00', NULL, '지각', '15분 지각 (아침 응급콜 투입 소약)', FALSE, NULL, NULL, NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'LAB-1003' LIMIT 1), '2026-07-11', '06:45:00', '15:20:00', '정상', 'D-Shift (Day) 완료', FALSE, NULL, NULL, NOW(), NOW()),

-- 이다영 간호사의 월간 타임라인 대장 확인용 7월 1일 ~ 10일 기록
((SELECT id FROM employee WHERE emp_no = 'NUR-1002' LIMIT 1), '2026-07-10', '06:50:00', '15:05:00', '정상', 'D-Shift 완료', FALSE, NULL, NULL, NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'NUR-1002' LIMIT 1), '2026-07-09', '06:55:00', '15:30:00', '정상', '초과 근로 30분', FALSE, NULL, NULL, NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'NUR-1002' LIMIT 1), '2026-07-08', '07:25:00', '15:10:00', '정상', '[관리자정정] 응급실 지원 파견으로 시간 소급 처리', TRUE, '응급실 긴급 지원 요청에 의한 태깅 지연 소급 인정', 'ADMIN-001', NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'NUR-1002' LIMIT 1), '2026-07-07', '06:48:00', '15:00:00', '정상', '정상 퇴근', FALSE, NULL, NULL, NOW(), NOW()),
((SELECT id FROM employee WHERE emp_no = 'NUR-1002' LIMIT 1), '2026-07-06', '22:50:00', '07:15:00', '정상', 'N-Shift (Night 23~07) 완료', FALSE, NULL, NULL, NOW(), NOW());
