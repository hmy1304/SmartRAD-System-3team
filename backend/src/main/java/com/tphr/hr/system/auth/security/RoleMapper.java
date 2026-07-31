package com.tphr.hr.system.auth.security;

/**
 * 권한 그룹(role_group.name) <-> Spring Security 권한 문자열 매핑.
 *
 * 매핑이 적용되는 지점이 두 곳이라는 점에 주의할 것.
 *   1) 로그인 시점  : CustomUserDetails.getAuthorities() 가 그룹명 -> ROLE_* 로 변환
 *   2) 요청 시점    : JwtTokenProvider.getAuthentication() 이 JWT auth 클레임을 복원
 *
 * 이때 클레임에 담기는 값은 (1)에서 이미 변환된 "ROLE_ADMIN" 같은 값이다.
 * 따라서 (2)에서 mapToRole 을 그대로 다시 태우면 switch 의 default 에 걸려
 * 모든 권한이 ROLE_USER 로 강등된다. 복원에는 반드시 fromClaim 을 쓸 것.
 */
public final class RoleMapper {

    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_HR = "ROLE_HR";
    public static final String ROLE_MANAGER = "ROLE_MANAGER";
    public static final String ROLE_USER = "ROLE_USER";

    private static final String ROLE_PREFIX = "ROLE_";

    private RoleMapper() {
    }

    /**
     * 권한 그룹명 -> 권한 문자열. (로그인 시점 전용)
     * 키는 db/migration 에 실제로 시드된 그룹명과 일치해야 한다.
     */
    public static String mapToRole(String groupName) {
        if (groupName == null) return ROLE_USER;

        switch (groupName.trim()) {
            case "최고관리자":
            case "시스템 관리자":
                return ROLE_ADMIN;
            case "인사담당자":
            case "인사관리자": // Legacy fallback
                return ROLE_HR;
            case "수간호사":
            case "부서장": // Legacy fallback
                return ROLE_MANAGER;
            default:
                return ROLE_USER;
        }
    }

    /**
     * JWT auth 클레임 값 -> 권한 문자열. (요청 시점 전용)
     *
     * 클레임에는 createToken 이 담은 권한 문자열이 그대로 들어있다.
     * ROLE_ADMIN 뿐 아니라 Spring Security 가 부여하는 FACTOR_PASSWORD 같은 값도
     * 섞여 오므로, 이미 권한 토큰 형태면 변환하지 않고 통과시킨다.
     * 구버전 토큰에는 한글 권한 그룹명이 들어있을 수 있어 그 경우만 mapToRole 을 태운다.
     */
    public static String fromClaim(String claim) {
        if (claim == null || claim.isBlank()) return ROLE_USER;

        String trimmed = claim.trim();
        if (isAuthorityToken(trimmed)) {
            return trimmed;
        }
        return mapToRole(trimmed);
    }

    /** ROLE_ADMIN, FACTOR_PASSWORD 처럼 이미 변환이 끝난 권한 토큰인지 판별한다. */
    private static boolean isAuthorityToken(String value) {
        if (value.startsWith(ROLE_PREFIX)) return true;
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            boolean allowed = (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c == '_';
            if (!allowed) return false;
        }
        return true;
    }
}
