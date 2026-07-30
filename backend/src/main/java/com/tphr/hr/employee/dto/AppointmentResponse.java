package com.tphr.hr.employee.dto;

import com.tphr.hr.employee.entity.Appointment;

import java.time.LocalDate;

public record AppointmentResponse(
        Long id,
        Long employeeId,
        String employeeName,
        String appointmentTypeCode,
        String appointmentTypeName,
        Long beforeDepartmentId,
        String beforeDepartmentName,
        String beforePositionCode,
        String beforePositionName,
        Long afterDepartmentId,
        String afterDepartmentName,
        String afterPositionCode,
        String afterPositionName,
        Integer afterPayStep,
        LocalDate applyDate,
        Boolean applied,
        String status,
        String note
) {
    public static AppointmentResponse from(Appointment a) {
        return new AppointmentResponse(
                a.getId(),
                a.getEmployee().getId(),
                a.getEmployee().getName(),
                a.getAppointmentType().getCode(),
                a.getAppointmentType().getName(),
                a.getBeforeDepartment() != null ? a.getBeforeDepartment().getId() : null,
                a.getBeforeDepartment() != null ? a.getBeforeDepartment().getName() : null,
                a.getBeforePosition() != null ? a.getBeforePosition().getCode() : null,
                a.getBeforePosition() != null ? a.getBeforePosition().getName() : null,
                a.getAfterDepartment() != null ? a.getAfterDepartment().getId() : null,
                a.getAfterDepartment() != null ? a.getAfterDepartment().getName() : null,
                a.getAfterPosition() != null ? a.getAfterPosition().getCode() : null,
                a.getAfterPosition() != null ? a.getAfterPosition().getName() : null,
                a.getAfterPayStep(),
                a.getApplyDate(),
                a.getApplied(),
                a.getStatus(),
                a.getNote()
        );
    }
}
