package com.tphr.hr.system.dto;

import com.tphr.hr.employee.entity.Department;

import java.time.LocalDateTime;

public record DepartmentResponse(
        Long id,
        String name,
        Long parentId,
        String parentName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static DepartmentResponse from(Department d) {
        return new DepartmentResponse(
                d.getId(),
                d.getName(),
                d.getParent() != null ? d.getParent().getId() : null,
                d.getParent() != null ? d.getParent().getName() : null,
                d.getCreatedAt(),
                d.getUpdatedAt()
        );
    }
}
