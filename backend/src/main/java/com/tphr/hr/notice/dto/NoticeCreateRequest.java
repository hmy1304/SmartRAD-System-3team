package com.tphr.hr.notice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record NoticeCreateRequest(
        @NotNull
        Long authorId,

        @NotBlank
        String title,

        @NotBlank
        String content,

        @NotBlank
        String noticeTypeCode, // 일반, 긴급 등 CommonCode

        Boolean isImportant, // 상단 고정 여부 (기본 false)

        LocalDate expirationDate // 없으면 무기한 게시
) {
}
