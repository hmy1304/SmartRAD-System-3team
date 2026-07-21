package com.tphr.hr.system.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * POST /departments 요청 바디. parentId 가 없으면 최상위 부서로 생성된다.
 */
public record DepartmentCreateRequest(
        @NotBlank
        String name,

        Long parentId
) {
}
