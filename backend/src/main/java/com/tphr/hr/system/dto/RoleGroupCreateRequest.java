package com.tphr.hr.system.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * POST /role-groups 요청 바디. 예: "수간호사", "인사담당자", "최고관리자" 등 권한 그룹 신설.
 */
public record RoleGroupCreateRequest(
        @NotBlank
        String name,

        String description
) {
}
