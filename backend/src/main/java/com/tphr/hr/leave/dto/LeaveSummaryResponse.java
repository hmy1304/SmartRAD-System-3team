package com.tphr.hr.leave.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveSummaryResponse {

    // 5대 KPI 수치
    private Double totalAllocatedDays; // 전체 부여 연차
    private Double totalUsedDays;      // 사용 연차
    private Double usedPercentage;     // 사용 연차 비율 (33.3%)
    private Double totalRemainingDays; // 잔여 연차
    private Long thisMonthApplications;// 이번달 신청 건수
    private Long pendingApplications;  // 승인 대기 건수
    private Long riskEmployeeCount;    // 연차 소진 경고 인원 수

    // 우측 위젯 통계 리스트
    private List<TypeStatDto> typeStats;
    private List<RiskEmployeeDto> riskEmployees;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TypeStatDto {
        private String type;      // 연차, 반차, 병가, 기타
        private Long count;       // 건수
        private Double percentage;// 비율
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RiskEmployeeDto {
        private Long employeeId;
        private String name;
        private String initial;
        private String department;
        private Double remainingDays;
        private String tone;      // red, orange
        private String tagStyle;  // riskOne, riskTwo
    }
}
