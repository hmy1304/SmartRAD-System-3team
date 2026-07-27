package com.tphr.hr.statutory.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class StatutoryScheduleRequest {
    private String title;
    private String agency;
    private String category;
    private String target;
    private LocalDate deadline;
    private Integer headCount;
    private Long estimatedAmount;
    private String memo;
}
