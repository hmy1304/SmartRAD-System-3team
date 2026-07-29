package com.tphr.hr.system.dto;

import java.time.LocalDate;

public record DepartmentUpdateRequest(
        String name,
        String nameEn,
        String deptCode,
        Long managerId,
        String location,
        String phone,
        LocalDate establishedDate,
        String description,
        Long parentId
) {}
