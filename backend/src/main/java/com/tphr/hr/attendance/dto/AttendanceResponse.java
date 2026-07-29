package com.tphr.hr.attendance.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Builder
public class AttendanceResponse {
    private Long id;
    private Long employeeId;
    private String empNo;
    private String employeeName;
    private String departmentName;
    private String positionName;
    private LocalDate workDate;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private String status;
    private String note;
    private Boolean isCorrected;
    private String correctionReason;
    private String correctedBy;
}
