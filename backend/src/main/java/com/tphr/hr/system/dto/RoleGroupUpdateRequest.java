package com.tphr.hr.system.dto;

/**
 * PATCH /role-groups/{id} 요청 바디. null 필드는 변경하지 않는다(부분 수정).
 */
public record RoleGroupUpdateRequest(
        String name,
        String description
) {
}
