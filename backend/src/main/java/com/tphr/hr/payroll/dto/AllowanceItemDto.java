package com.tphr.hr.payroll.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class AllowanceItemDto {
    private Long id;
    private String name;
    private String taxType;
    private String amountType;
    private String amountOrRate;
    private String calculationBasis;
}
