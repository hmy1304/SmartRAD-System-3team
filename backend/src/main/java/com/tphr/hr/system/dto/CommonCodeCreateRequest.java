package com.tphr.hr.system.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * POST /common-codes 요청 바디.
 * 직급 신설(POS), 새 자격증 유형(LIC) 등 드롭다운에 쓰일 코드를 등록할 때 사용한다.
 */
public record CommonCodeCreateRequest(
        @NotBlank
        String code, // 예: POS_04

        @NotBlank
        String groupCode, // 예: POS, JOB, LIC, APT, NOTICE 등

        @NotBlank
        String name, // 예: 주임간호사

        String description,

        Integer sortOrder
) {
}
