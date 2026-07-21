package com.tphr.hr.employee.dto;

public record EducationCompletionRateResponse(
        Long departmentId,
        String departmentName,
        int year,
        long totalEmployeeCount,
        long completedEmployeeCount,
        double completionRate // 0 ~ 100 (%)
) {
}
