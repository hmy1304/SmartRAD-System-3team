package com.tphr.hr.system.dto;

import com.tphr.hr.employee.entity.Department;

import java.util.List;

/**
 * GET /departments/tree 응답. 조직도 화면에서 계층형으로 그리기 위한 재귀 구조.
 */
public record DepartmentTreeResponse(
        Long id,
        String name,
        List<DepartmentTreeResponse> children
) {
    public static DepartmentTreeResponse from(Department d) {
        List<DepartmentTreeResponse> childNodes = d.getChildren().stream()
                .map(DepartmentTreeResponse::from)
                .toList();
        return new DepartmentTreeResponse(d.getId(), d.getName(), childNodes);
    }
}
