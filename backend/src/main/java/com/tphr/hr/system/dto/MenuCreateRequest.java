package com.tphr.hr.system.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * POST /menus 요청 바디. 예: menuCode="DUTY_SCHEDULE", name="듀티표 편성" 처럼
 * 권한(RolePermission) 매트릭스의 대상이 되는 화면/기능 단위를 등록한다.
 */
public record MenuCreateRequest(
        @NotBlank
        String menuCode,

        @NotBlank
        String name,

        String description
) {
}
