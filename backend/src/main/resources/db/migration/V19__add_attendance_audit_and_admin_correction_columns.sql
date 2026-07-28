-- 근태 정정 및 감사를 위한 테이블 스키마 확장 (V19)
ALTER TABLE attendance
    ADD COLUMN is_corrected BOOLEAN DEFAULT FALSE NOT NULL,
    ADD COLUMN correction_reason VARCHAR(500) NULL,
    ADD COLUMN corrected_by VARCHAR(50) NULL;

-- 감사 및 통계 조회를 위한 인덱스 추가
CREATE INDEX idx_attendance_work_date_status ON attendance (work_date, status);
CREATE INDEX idx_attendance_is_corrected ON attendance (is_corrected);
