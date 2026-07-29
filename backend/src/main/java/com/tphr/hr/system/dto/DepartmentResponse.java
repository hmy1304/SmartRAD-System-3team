package com.tphr.hr.system.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record DepartmentResponse(
        Long id,
        String name,
        String deptCode,
        String nameEn,
        Long managerId,
        String managerName,
        String managerPosition,
        String location,
        String phone,
        LocalDate establishedDate,
        String description,
        Long parentId,
        String parentName,
        Long memberCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
