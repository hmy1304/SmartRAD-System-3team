package com.tphr.hr.system.dto;

/**
 * PATCH /common-codes/{code} 요청 바디. null 필드는 변경하지 않는다(부분 수정).
 * isActive=false 로 넘기면 사용여부를 끄는 방식으로 비활성화(soft delete)한다.
 */
public record CommonCodeUpdateRequest(
        String name,
        String description,
        Integer sortOrder,
        Boolean isActive
) {
}
