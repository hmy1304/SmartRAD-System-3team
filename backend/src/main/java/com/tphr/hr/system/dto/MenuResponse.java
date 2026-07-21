package com.tphr.hr.system.dto;

import com.tphr.hr.system.entity.Menu;

import java.time.LocalDateTime;

public record MenuResponse(
        Long id,
        String menuCode,
        String name,
        String description,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static MenuResponse from(Menu m) {
        return new MenuResponse(
                m.getId(),
                m.getMenuCode(),
                m.getName(),
                m.getDescription(),
                m.getCreatedAt(),
                m.getUpdatedAt()
        );
    }
}
