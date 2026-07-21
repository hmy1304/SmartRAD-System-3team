package com.tphr.hr.employee.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * POST /employee-health 요청 바디.
 * checkupItemsJson 은 병원 검진 항목이 병원/연도별로 상이하므로 동적 JSON 문자열로 저장한다.
 */
public record EmployeeHealthCreateRequest(
        @NotNull
        Long employeeId,

        @NotNull
        Integer checkupYear,

        LocalDate checkupDate,

        String checkupTypeCode,

        String institution,

        String result, // 종합 판정 (예: 정상, 관찰요망, 유소견 등)

        String findings,

        String checkupItemsJson // 세부 검사 항목 JSON 문자열
) {
}
