package com.tphr.hr.system.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    
    private String accessToken;
    private Long employeeId;
    private String empNo;
    private String name;
    private String departmentName;
    private String positionName;
    private String roleGroupName;
    private java.util.List<com.tphr.hr.system.dto.RolePermissionResponse> permissions;
}
