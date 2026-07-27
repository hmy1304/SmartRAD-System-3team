package com.tphr.hr.payroll.dto;

import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;

@Getter
@Builder
public class PayrollSummaryResponse {
    private Integer targetCount;
    private BigDecimal totalAmount;
    private Integer pendingCount;
    private Integer transferFailedCount;
}
