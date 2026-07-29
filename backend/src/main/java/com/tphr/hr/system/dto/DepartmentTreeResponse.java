package com.tphr.hr.system.dto;

import java.time.LocalDate;
import java.util.List;

public record DepartmentTreeResponse(
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
        Long memberCount,
        Long totalSubMemberCount,
        List<DepartmentTreeResponse> children
) {}
