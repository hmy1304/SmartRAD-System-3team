package com.tphr.hr.statutory.dto;

import com.tphr.hr.statutory.entity.StatutorySchedule;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class StatutoryScheduleResponse {
    private Long id;
    private String title;
    private String agency;
    private String category;
    private String target;
    private LocalDate deadline;
    private Integer headCount;
    private Long estimatedAmount;
    private String memo;
    private String status;

    public static StatutoryScheduleResponse from(StatutorySchedule entity) {
        return StatutoryScheduleResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .agency(entity.getAgency())
                .category(entity.getCategory())
                .target(entity.getTarget())
                .deadline(entity.getDeadline())
                .headCount(entity.getHeadCount())
                .estimatedAmount(entity.getEstimatedAmount())
                .memo(entity.getMemo())
                .status(entity.getStatus())
                .build();
    }
}
