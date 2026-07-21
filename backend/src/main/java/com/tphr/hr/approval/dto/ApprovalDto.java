package com.tphr.hr.approval.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class ApprovalDto {

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        private String title;
        private String docTypeCode; // e.g., "DOC_VACATION", "DOC_WELFARE"
        private String content; // JSON string or HTML text
        private Long draftedById;
        private List<Long> approverIds; // 순차적 결재선 사번 목록
        private List<String> attachmentFileNames; // 임시 메타데이터용 파일명 리스트
    }

    @Getter
    @Builder
    public static class Response {
        private Long id;
        private String docNumber;
        private String title;
        private String docTypeName;
        private String draftedByName;
        private String status; // DRAFT, IN_PROGRESS, COMPLETED, REJECTED
        private LocalDateTime createdAt;
    }

    @Getter
    @Builder
    public static class LineResponse {
        private Long id;
        private Integer sequence;
        private String approverName;
        private String status; // WAITING, APPROVED, REJECTED
        private LocalDateTime approvedAt;
        private String rejectReason;
    }

    @Getter
    @Builder
    public static class AttachmentResponse {
        private Long id;
        private String fileName;
        private String filePath;
        private Integer fileSizeKb;
    }

    @Getter
    @Builder
    public static class DetailResponse {
        private Response document;
        private String content;
        private List<LineResponse> approvalLines;
        private List<AttachmentResponse> attachments;
    }
}
