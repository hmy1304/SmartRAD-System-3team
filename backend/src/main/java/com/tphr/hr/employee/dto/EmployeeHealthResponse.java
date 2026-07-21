package com.tphr.hr.employee.dto;

import com.tphr.hr.employee.entity.EmployeeHealth;

import java.time.LocalDate;

public record EmployeeHealthResponse(
        Long id,
        Long employeeId,
        String employeeName,
        String departmentName,
        Integer checkupYear,
        LocalDate checkupDate,
        String checkupTypeCode,
        String checkupTypeName,
        String institution,
        String result,
        String findings,
        String checkupItemsJson
) {
    public static EmployeeHealthResponse from(EmployeeHealth h) {
        return new EmployeeHealthResponse(
                h.getId(),
                h.getEmployee().getId(),
                h.getEmployee().getName(),
                h.getEmployee().getDepartment() != null ? h.getEmployee().getDepartment().getName() : null,
                h.getCheckupYear(),
                h.getCheckupDate(),
                h.getCheckupType() != null ? h.getCheckupType().getCode() : null,
                h.getCheckupType() != null ? h.getCheckupType().getName() : null,
                h.getInstitution(),
                h.getResult(),
                h.getFindings(),
                h.getCheckupItemsJson()
        );
    }
}
