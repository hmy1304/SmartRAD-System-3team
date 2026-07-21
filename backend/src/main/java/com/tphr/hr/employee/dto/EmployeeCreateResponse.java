package com.tphr.hr.employee.dto;

/**
 * 직원 등록 직후 응답. 자동 발급된 초기 비밀번호(평문)는 이 응답에서만 1회 노출된다.
 */
public record EmployeeCreateResponse(
        Long id,
        String empNo,
        String name,
        String initialPassword
) {
}
