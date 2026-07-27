package com.tphr.hr.statutory.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StatutoryDashboardSummaryResponse {
    private int thisMonthTotal;
    private int thisMonthCompleted;
    private int urgentCount;
}
