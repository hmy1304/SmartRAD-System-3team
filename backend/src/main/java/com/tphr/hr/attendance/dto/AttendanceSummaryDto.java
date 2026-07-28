package com.tphr.hr.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceSummaryDto {
    private String id;
    private String name;
    private String initial;
    private String empNo;
    private String department;
    private String tone;
    private List<String> days; // "normal", "late", "absent", "leave", "planned", "empty"
    private int attend;
    private int late;
    private int absent;
    private int leave;
}
