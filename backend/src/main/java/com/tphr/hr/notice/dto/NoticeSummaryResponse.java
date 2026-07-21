package com.tphr.hr.notice.dto;

import com.tphr.hr.notice.entity.Notice;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record NoticeSummaryResponse(
        Long id,
        String title,
        String noticeTypeName,
        Boolean isImportant,
        String authorName,
        Integer viewCount,
        LocalDate expirationDate,
        LocalDateTime createdAt
) {
    public static NoticeSummaryResponse from(Notice n) {
        return new NoticeSummaryResponse(
                n.getId(),
                n.getTitle(),
                n.getNoticeType().getName(),
                n.getIsImportant(),
                n.getAuthor().getName(),
                n.getViewCount(),
                n.getExpirationDate(),
                n.getCreatedAt()
        );
    }
}
