package com.tphr.hr.approval.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class ApprovalDetailResponse {
    private ApprovalResponse document;
    private String content;
    private List<ApprovalLineResponse> approvalLines;
    private List<ApprovalAttachmentResponse> attachments;
    private List<ApprovalInboxResponse.ApprovalCommentDto> comments;
}
