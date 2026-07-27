package com.tphr.hr.employee.dto;

/**
 * GET /employees 검색 조건. 부서별, 직급별, 재직상태별(계정상태) 필터링에 사용.
 */
public record EmployeeSearchCondition(
        Long departmentId,
        String positionCode,
        String accountStatus,
        String keyword, // 이름/사번 검색
        Long roleGroupId
) {
}
