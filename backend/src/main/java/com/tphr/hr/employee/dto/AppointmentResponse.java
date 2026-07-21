package com.tphr.hr.employee.dto;

import com.tphr.hr.employee.entity.Appointment;

import java.time.LocalDate;

public record AppointmentResponse(
        Long id,
        Long employeeId,
        String employeeName,
        String appointmentTypeCode,
        String appointmentTypeName,
        Long afterDepartmentId,
        String afterDepartmentName,
        String afterPositionCode,
        String afterPositionName,
        Integer afterPayStep,
        LocalDate applyDate,
        Boolean applied,
        String note
) {
    public static AppointmentResponse from(Appointment a) {
        return new AppointmentResponse(
                a.getId(),
                a.getEmployee().getId(),
                a.getEmployee().getName(),
                a.getAppointmentType().getCode(),
                a.getAppointmentType().getName(),
                a.getAfterDepartment() != null ? a.getAfterDepartment().getId() : null,
                a.getAfterDepartment() != null ? a.getAfterDepartment().getName() : null,
                a.getAfterPosition() != null ? a.getAfterPosition().getCode() : null,
                a.getAfterPosition() != null ? a.getAfterPosition().getName() : null,
                a.getAfterPayStep(),
                a.getApplyDate(),
                a.getApplied(),
                a.getNote()
        );
    }
}
