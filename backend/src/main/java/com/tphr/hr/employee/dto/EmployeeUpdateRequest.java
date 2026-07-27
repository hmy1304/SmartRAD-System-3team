package com.tphr.hr.employee.dto;

import jakarta.validation.constraints.Email;

import java.time.LocalDate;

/**
 * PATCH /employees/{id} 요청 바디. null 필드는 변경하지 않는다(부분 수정).
 */
public record EmployeeUpdateRequest(
        String name,

        @Email
        String email,

        String phone,

        String gender,

        LocalDate birthDate,

        String address,

        String internalPhone,

        String emergencyContact,

        String emergencyRelation,

        Long departmentId,

        String positionCode,

        String jobCategoryCode,

        String employmentTypeCode,

        String hireRouteCode,

        String workTypeCode,

        String workWard,

        Integer payStep,

        String payrollTypeCode,

        Integer payrollDate,

        String bankAccount,

        String bankName,

        String taxTypeCode,

        Long roleGroupId,

        Boolean isShiftWorker
) {
}
