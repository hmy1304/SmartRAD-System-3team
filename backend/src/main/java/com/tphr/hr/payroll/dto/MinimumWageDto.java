package com.tphr.hr.payroll.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class MinimumWageDto {
    private Long id;
    private Integer applyYear;
    private Long hourlyWage;
    private Long monthlyWage;
}
