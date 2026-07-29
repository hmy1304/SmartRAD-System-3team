package com.tphr.hr.approval.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class ApprovalInboxResponse {
    private ApprovalSummaryDto summary;
    private List<ApprovalDocumentDto> documents;
    private List<ApprovalCommentDto> comments;

    @Getter
    @Builder
    public static class ApprovalSummaryDto {
        private int totalPending;
        private int urgentPending;
        private int dueToday;
        private int processedThisMonth;
        private int approvalRate;
    }

    @Getter
    @Builder
    public static class ApprovalDocumentDto {
        private String id; // prefixed string, e.g. "LEAVE-1"
        private String priority; // "urgent" | "normal"
        private String priorityLabel; // e.g. "긴급", "일반"
        private String title;
        private String attachment; // e.g. "첨부 1" or ""
        private String drafter;
        private String drafterInitial;
        private String drafterDepartment;
        private String drafterRole;
        private String avatarTone; // "blue" | "green" | "purple" | "yellow" | "red"
        private String requestedAt; // e.g. "2026. 07. 29 10:00"
        private String dDay; // e.g. "D-0", "D-3"
        private String description;
        private String fileName;
        private String fileMeta;
    }

    @Getter
    @Builder
    public static class ApprovalCommentDto {
        private Long id;
        private String documentId; // "LEAVE-1"
        private String initial;
        private String name;
        private String tag; // "결재자"
        private String time;
        private String content;
        private String avatarTone;
    }
}
