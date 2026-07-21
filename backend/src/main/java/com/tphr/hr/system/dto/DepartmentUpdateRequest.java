package com.tphr.hr.system.dto;

/**
 * PATCH /departments/{id} 요청 바디. null 필드는 변경하지 않는다(부분 수정).
 */
public record DepartmentUpdateRequest(
        String name,
        Long parentId
) {
}
