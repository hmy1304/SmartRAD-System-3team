package com.tphr.hr.employee.dto;

import com.tphr.hr.employee.entity.Employee;

import java.time.LocalDate;

public record EmployeeResponse(
        Long id,
        String empNo,
        String name,
        String email,
        String phone,
        LocalDate joinDate,
        Boolean isShiftWorker,
        String accountStatus,
        String gender,
        LocalDate birthDate,
        String address,
        String internalPhone,
        String emergencyContact,
        String emergencyRelation,
        Long departmentId,
        String departmentName,
        String positionCode,
        String positionName,
        String jobCategoryCode,
        String jobCategoryName,
        String employmentTypeCode,
        String employmentTypeName,
        String hireRouteCode,
        String workTypeCode,
        String workWard,
        Integer payStep,
        String payrollTypeCode,
        Integer payrollDate,
        String bankAccount,
        String taxTypeCode,
        Long roleGroupId,
        String roleGroupName
) {
    public static EmployeeResponse from(Employee e) {
        return new EmployeeResponse(
                e.getId(),
                e.getEmpNo(),
                e.getName(),
                e.getEmail(),
                e.getPhone(),
                e.getJoinDate(),
                e.getIsShiftWorker(),
                e.getAccountStatus(),
                e.getGender(),
                e.getBirthDate(),
                e.getAddress(),
                e.getInternalPhone(),
                e.getEmergencyContact(),
                e.getEmergencyRelation(),
                e.getDepartment() != null ? e.getDepartment().getId() : null,
                e.getDepartment() != null ? e.getDepartment().getName() : null,
                e.getPosition() != null ? e.getPosition().getCode() : null,
                e.getPosition() != null ? e.getPosition().getName() : null,
                e.getJobCategory() != null ? e.getJobCategory().getCode() : null,
                e.getJobCategory() != null ? e.getJobCategory().getName() : null,
                e.getEmploymentType() != null ? e.getEmploymentType().getCode() : null,
                e.getEmploymentType() != null ? e.getEmploymentType().getName() : null,
                e.getHireRoute() != null ? e.getHireRoute().getCode() : null,
                e.getWorkType() != null ? e.getWorkType().getCode() : null,
                e.getWorkWard(),
                e.getPayStep(),
                e.getPayrollType() != null ? e.getPayrollType().getCode() : null,
                e.getPayrollDate(),
                e.getBankAccount(),
                e.getTaxType() != null ? e.getTaxType().getCode() : null,
                e.getRoleGroup() != null ? e.getRoleGroup().getId() : null,
                e.getRoleGroup() != null ? e.getRoleGroup().getName() : null
        );
    }
}
