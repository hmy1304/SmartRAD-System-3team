package com.tphr.hr.payroll.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class BaseSalaryDto {
    private Long id;
    private String jobTitle;
    private Long minAmount;
    private Long maxAmount;
    private Long actualAmount;
}
