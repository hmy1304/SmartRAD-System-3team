package com.tphr.hr.employee.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * POST /employees 요청 바디.
 * 비밀번호는 서버에서 자동 발급하므로 요청에 포함하지 않는다.
 */
public record EmployeeCreateRequest(

        @NotBlank
        String empNo,

        @NotBlank
        String name,

        @Email
        String email,

        String phone,

        @NotNull
        LocalDate joinDate,

        Boolean isShiftWorker,

        String gender,

        LocalDate birthDate,

        String address,

        String internalPhone,

        String emergencyContact,

        String emergencyRelation,

        @NotNull
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

        String taxTypeCode,

        Long roleGroupId
) {
}
