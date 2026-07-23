package com.tphr.hr.statutory.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class StatutoryYearlyStatsResponse {
    private int year;
    private List<MonthlyStat> monthlyStats;

    @Getter
    @Builder
    public static class MonthlyStat {
        private int month;
        private int totalCount;
        private int completedCount;
    }
}
