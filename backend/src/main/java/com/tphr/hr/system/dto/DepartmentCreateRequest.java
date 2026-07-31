package com.tphr.hr.system.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record DepartmentCreateRequest(
        @NotBlank(message = "부서명은 필수입니다.")
        String name,
        String nameEn,
        @NotBlank(message = "부서코드는 필수입니다.")
        String deptCode,
        Long managerId,
        String location,
        String phone,
        LocalDate establishedDate,
        String description,
        Long parentId
) {}
