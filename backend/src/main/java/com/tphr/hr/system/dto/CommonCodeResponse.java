package com.tphr.hr.system.dto;

import com.tphr.hr.system.entity.CommonCode;

import java.time.LocalDateTime;

public record CommonCodeResponse(
        String code,
        String groupCode,
        String name,
        String description,
        Boolean isActive,
        Integer sortOrder,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static CommonCodeResponse from(CommonCode c) {
        return new CommonCodeResponse(
                c.getCode(),
                c.getGroupCode(),
                c.getName(),
                c.getDescription(),
                c.getIsActive(),
                c.getSortOrder(),
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }
}
