package com.tphr.hr.approval.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ApprovalCommentCreateRequest {
    private String content;
    private Long employeeId; // in a real system derived from JWT
}
