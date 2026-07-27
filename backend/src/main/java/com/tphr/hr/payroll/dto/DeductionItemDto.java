package com.tphr.hr.payroll.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class DeductionItemDto {
    private Long id;
    private String name;
    private String category;
    private String deductionType;
    private String rateOrAmount;
}
