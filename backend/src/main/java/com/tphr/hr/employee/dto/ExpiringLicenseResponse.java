package com.tphr.hr.employee.dto;

import com.tphr.hr.employee.entity.EmployeeLicense;

import java.time.LocalDate;

public record ExpiringLicenseResponse(
        Long id,
        Long employeeId,
        String employeeName,
        String departmentName,
        String licenseTypeCode,
        String licenseTypeName,
        String licenseName,
        String licenseNumber,
        LocalDate expirationDate,
        long daysUntilExpiration
) {
    public static ExpiringLicenseResponse from(EmployeeLicense license, LocalDate today) {
        return new ExpiringLicenseResponse(
                license.getId(),
                license.getEmployee().getId(),
                license.getEmployee().getName(),
                license.getEmployee().getDepartment() != null ? license.getEmployee().getDepartment().getName() : null,
                license.getLicenseType().getCode(),
                license.getLicenseType().getName(),
                license.getLicenseName(),
                license.getLicenseNumber(),
                license.getExpirationDate(),
                java.time.temporal.ChronoUnit.DAYS.between(today, license.getExpirationDate())
        );
    }
}
