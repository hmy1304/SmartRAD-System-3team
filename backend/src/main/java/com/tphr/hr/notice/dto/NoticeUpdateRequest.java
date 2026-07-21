package com.tphr.hr.notice.dto;

import java.time.LocalDate;

/**
 * PATCH /notices/{id} 요청 바디. null 필드는 변경하지 않는다(부분 수정).
 */
public record NoticeUpdateRequest(
        String title,
        String content,
        String noticeTypeCode,
        Boolean isImportant,
        LocalDate expirationDate
) {
}
