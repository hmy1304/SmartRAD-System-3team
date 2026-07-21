package com.tphr.hr.employee.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * PATCH /employees/{id}/account-status 요청 바디.
 * 퇴사자 계정 잠금 등에 사용된다. (LOCKED <-> ACTIVE)
 */
public record AccountStatusUpdateRequest(
        @NotBlank
        @Pattern(regexp = "ACTIVE|LOCKED", message = "accountStatus는 ACTIVE 또는 LOCKED여야 합니다.")
        String accountStatus
) {
}
