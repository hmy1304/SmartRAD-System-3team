package com.tphr.hr.payroll.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class PayrollSettingsSummaryDto {
    private List<BaseSalaryDto> baseSalaries;
    private List<AllowanceItemDto> allowanceItems;
    private List<DeductionItemDto> deductionItems;
    private MinimumWageDto minimumWage;
<<<<<<< HEAD
=======
    
    private Long averageBaseSalary;
    private Integer allowanceCount;
    private Integer deductionCount;
    private String applicableMonth;
>>>>>>> e4aeb421f7d3e5cae72099ee9ba963ba6ea31d3f
}
