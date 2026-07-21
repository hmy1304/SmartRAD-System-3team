package com.tphr.hr.employee.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

/**
 * POST /appointments/batch 요청 바디.
 * 특정 날짜(applyDate) 기준으로 여러 건의 발령을 한 번에 등록/적용한다.
 */
public record AppointmentBatchRequest(
        @NotNull
        LocalDate applyDate,

        @NotEmpty
        @Valid
        List<AppointmentBatchItem> items
) {
    public record AppointmentBatchItem(
            @NotNull
            Long employeeId,

            @NotNull
            String appointmentTypeCode,

            Long afterDepartmentId,

            String afterPositionCode,

            Integer afterPayStep,

            String note
    ) {
    }
}
