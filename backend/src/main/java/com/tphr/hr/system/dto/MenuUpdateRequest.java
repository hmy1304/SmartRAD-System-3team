package com.tphr.hr.system.dto;

/**
 * PATCH /menus/{id} 요청 바디. null 필드는 변경하지 않는다(부분 수정).
 * menuCode는 여러 테이블(RolePermission 등)에서 식별자로 참조되므로 생성 후 변경하지 않는다.
 */
public record MenuUpdateRequest(
        String name,
        String description
) {
}
