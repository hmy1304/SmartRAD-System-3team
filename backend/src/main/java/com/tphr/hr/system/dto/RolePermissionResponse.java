package com.tphr.hr.system.dto;

import com.tphr.hr.system.entity.RolePermission;

public record RolePermissionResponse(
        Long id,
        Long roleGroupId,
        String roleGroupName,
        Long menuId,
        String menuCode,
        String menuName,
        Boolean canRead,
        Boolean canWrite,
        Boolean canDelete,
        Boolean canApprove
) {
    public static RolePermissionResponse from(RolePermission p) {
        return new RolePermissionResponse(
                p.getId(),
                p.getRoleGroup().getId(),
                p.getRoleGroup().getName(),
                p.getMenu().getId(),
                p.getMenu().getMenuCode(),
                p.getMenu().getName(),
                p.getCanRead(),
                p.getCanWrite(),
                p.getCanDelete(),
                p.getCanApprove()
        );
    }
}
