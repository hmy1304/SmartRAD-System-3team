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
}
