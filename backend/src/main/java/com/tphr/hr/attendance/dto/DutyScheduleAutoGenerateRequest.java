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
public class DutyScheduleAutoGenerateRequest {
    private Long requesterId; // 권한 검사를 위해 누가 요청했는지
    
    @Builder.Default
    private Integer maxNightPerMonth = 6; // 나이트 월 상한 (기본값 6)
    
    @Builder.Default
    private Boolean requireSenior = false; // 시니어 배치 옵션 (기본값 false)
}
