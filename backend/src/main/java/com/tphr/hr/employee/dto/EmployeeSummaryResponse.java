package com.tphr.hr.employee.dto;

import com.tphr.hr.employee.entity.Employee;

import java.time.LocalDate;

public record EmployeeSummaryResponse(
        Long id,
        String empNo,
        String name,
        String departmentName,
        String positionName,
        String jobCategoryName,
        String accountStatus,
        LocalDate joinDate
) {
    public static EmployeeSummaryResponse from(Employee e) {
        return new EmployeeSummaryResponse(
                e.getId(),
                e.getEmpNo(),
                e.getName(),
                e.getDepartment() != null ? e.getDepartment().getName() : null,
                e.getPosition() != null ? e.getPosition().getName() : null,
                e.getJobCategory() != null ? e.getJobCategory().getName() : null,
                e.getAccountStatus(),
                e.getJoinDate()
        );
    }
}
