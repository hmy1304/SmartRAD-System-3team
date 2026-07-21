package com.tphr.hr.system.dto;

import jakarta.validation.constraints.NotNull;

/**
 * PUT /role-groups/{roleGroupId}/permissions/{menuId} 요청 바디.
 * 해당 권한 그룹의 해당 메뉴에 대한 권한을 통째로 지정한다(없으면 신규 생성, 있으면 갱신 - upsert).
 */
public record RolePermissionUpdateRequest(
        @NotNull
        Boolean canRead,

        @NotNull
        Boolean canWrite,

        @NotNull
        Boolean canDelete,

        @NotNull
        Boolean canApprove
) {
}
