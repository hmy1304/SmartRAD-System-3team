package com.tphr.hr.notice.dto;

import com.tphr.hr.notice.entity.Notice;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record NoticeResponse(
        Long id,
        String title,
        String content,
        String noticeTypeCode,
        String noticeTypeName,
        Boolean isImportant,
        Long authorId,
        String authorName,
        Integer viewCount,
        LocalDate expirationDate,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static NoticeResponse from(Notice n) {
        return new NoticeResponse(
                n.getId(),
                n.getTitle(),
                n.getContent(),
                n.getNoticeType().getCode(),
                n.getNoticeType().getName(),
                n.getIsImportant(),
                n.getAuthor().getId(),
                n.getAuthor().getName(),
                n.getViewCount(),
                n.getExpirationDate(),
                n.getCreatedAt(),
                n.getUpdatedAt()
        );
    }
}
