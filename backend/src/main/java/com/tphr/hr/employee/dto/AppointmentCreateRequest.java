package com.tphr.hr.employee.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * POST /appointments 요청 바디.
 * afterDepartmentId / afterPositionCode 중 변경되는 항목만 채워서 보낸다.
 */
public record AppointmentCreateRequest(
        @NotNull
        Long employeeId,

        @NotNull
        String appointmentTypeCode, // 승진/전보 등 CommonCode

        Long afterDepartmentId,

        String afterPositionCode,

        Integer afterPayStep, // 호봉 변경이 있는 경우 SalaryGradeHistory 연동에 사용

        @NotNull
        LocalDate applyDate,

        String note
) {
}
