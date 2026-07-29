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
<<<<<<< HEAD
=======
    private Boolean isActive;
>>>>>>> e4aeb421f7d3e5cae72099ee9ba963ba6ea31d3f
}
