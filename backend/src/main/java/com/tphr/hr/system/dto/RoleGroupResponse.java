package com.tphr.hr.system.dto;

import com.tphr.hr.system.entity.RoleGroup;

import java.time.LocalDateTime;

public record RoleGroupResponse(
        Long id,
        String name,
        String description,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static RoleGroupResponse from(RoleGroup rg) {
        return new RoleGroupResponse(
                rg.getId(),
                rg.getName(),
                rg.getDescription(),
                rg.getCreatedAt(),
                rg.getUpdatedAt()
        );
    }
}
