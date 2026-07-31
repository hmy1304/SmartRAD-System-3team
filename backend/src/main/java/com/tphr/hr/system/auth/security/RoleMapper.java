package com.tphr.hr.system.auth.security;

public class RoleMapper {

    public static String mapToRole(String groupName) {
        if (groupName == null) return "ROLE_USER";

        switch (groupName.trim()) {
            case "최고관리자":
            case "시스템 관리자":
                return "ROLE_ADMIN";
            case "인사담당자":
            case "인사관리자": // Legacy fallback
                return "ROLE_HR";
            case "수간호사":
            case "부서장": // Legacy fallback
                return "ROLE_MANAGER";
            default:
                return "ROLE_USER";
        }
    }
}
