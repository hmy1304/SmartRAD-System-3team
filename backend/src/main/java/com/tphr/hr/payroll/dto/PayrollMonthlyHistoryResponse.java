package com.tphr.hr.payroll.dto;

import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;

@Getter
@Builder
public class PayrollMonthlyHistoryResponse {
    private Integer year;
    private Integer month;
    private Integer employeeCount;
    private BigDecimal totalGrossAmount;
    private BigDecimal totalDeductionAmount;
    private BigDecimal totalNetAmount;
}
