package com.tphr.hr.approval.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ApprovalDraftResponse {
    private DraftSummaryDto summary;
    private DraftTabsDto tabs;
    private List<DraftDocumentDto> documents;

    @Getter
    @Builder
    public static class DraftSummaryDto {
        private int totalDrafts;
        private int pendingDrafts;
        private int approvedThisMonth;
        private int rejectedDrafts;
        private int temporaryDrafts;
    }

    @Getter
    @Builder
    public static class DraftTabsDto {
        private int inProgress;
        private int rejected;
        private int approved;
        private int temporary;
    }

    @Getter
    @Builder
    public static class DraftDocumentDto {
        private String id;
        private String number; // "DOC-20250101-001" or string ID
        private String title;
        private String attachment;
        private String kind; // e.g. "approval", "vacation"
        private String kindLabel; // e.g. "일반기안", "휴가신청"
        private String createdAt; // e.g. "2025. 01. 01 10:00"
        private String approverInitial; // e.g. "김"
        private String approver; // e.g. "김대표(대표이사)"
        private String status; // "pending", "rejected", "approved", "draft"
        private String statusLabel; // "결재중", "반려", "결재완료", "임시저장"
        private String deadline; // "2025. 01. 10"
        private boolean deadlineWarning;
        private boolean temporary;
    }
}
