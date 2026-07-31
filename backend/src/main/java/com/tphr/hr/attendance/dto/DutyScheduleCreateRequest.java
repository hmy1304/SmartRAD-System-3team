package com.tphr.hr.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DutyScheduleCreateRequest {
    private Long departmentId;
    private Integer scheduleYear;
    private Integer scheduleMonth;
    private Long requesterId; // 권한 검사를 위해 누가 요청했는지 (JWT 대체재)
}
