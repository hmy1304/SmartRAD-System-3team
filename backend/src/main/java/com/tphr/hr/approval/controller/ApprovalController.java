package com.tphr.hr.approval.controller;

import com.tphr.hr.approval.dto.ApprovalCreateRequest;
import com.tphr.hr.approval.dto.ApprovalDetailResponse;
import com.tphr.hr.approval.dto.ApprovalResponse;
import com.tphr.hr.approval.dto.ApprovalUpdateRequest;
import com.tphr.hr.approval.dto.ApprovalInboxResponse;
import com.tphr.hr.approval.dto.ApprovalCommentCreateRequest;
import com.tphr.hr.approval.service.ApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/approvals")
@RequiredArgsConstructor
public class ApprovalController {

    private final ApprovalService approvalService;

    /**
     * 0. 결재 대기함 조회
     */
    @GetMapping("/pending")
    public ResponseEntity<ApprovalInboxResponse> getPendingApprovals(@RequestParam Long approverId) {
        return ResponseEntity.ok(approvalService.getPendingApprovals(approverId));
    }

    /**
     * 0-1. 코멘트 추가
     */
    @PostMapping("/{id}/comments")
    public ResponseEntity<Void> addComment(@PathVariable String id, @RequestBody ApprovalCommentCreateRequest request) {
        approvalService.addComment(id, request);
        return ResponseEntity.ok().build();
    }


    /**
     * 1. 기안 문서 생성 (결재 올리기)
     */
    @PostMapping
    public ResponseEntity<ApprovalResponse> createDocument(@RequestBody ApprovalCreateRequest request) {
        ApprovalResponse response = approvalService.createDocument(request);
        return ResponseEntity.ok(response);
    }

    /**
     * 2. 결재 승인
     * @param id 문서 ID (접두어 포함)
     * @param approverId 결재 승인하려는 사람의 사번 (실제로는 JWT Token에서 추출)
     */
    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApprovalResponse> approveDocument(
            @PathVariable String id,
            @RequestParam Long approverId) {
        // TODO: 추후 Spring Security 적용 시 @RequestParam 대신 @AuthenticationPrincipal 등으로 인증 정보 사용
        ApprovalResponse response = approvalService.approveDocument(id, approverId);
        return ResponseEntity.ok(response);
    }

    /**
     * 3. 결재 반려
     * @param id 문서 ID (접두어 포함)
     * @param approverId 반려하는 사람의 사번
     * @param reason 반려 사유
     */
    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApprovalResponse> rejectDocument(
            @PathVariable String id,
            @RequestParam Long approverId,
            @RequestParam String reason) {
        ApprovalResponse response = approvalService.rejectDocument(id, approverId, reason);
        return ResponseEntity.ok(response);
    }

    /**
     * 4. 결재 문서 상세 내역 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApprovalDetailResponse> getApprovalDetail(@PathVariable Long id) {
        ApprovalDetailResponse response = approvalService.getApprovalDetail(id);
        return ResponseEntity.ok(response);
    }

    /**
     * 5. 결재 문서 삭제 (통과된 문서는 삭제 불가)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        approvalService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 6. 결재 문서 수정 (기안자 본인만, 첫 결재 전까지만)
     * @param id 문서 ID
     * @param drafterId 기안자 사번 (실제로는 JWT Token에서 추출)
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApprovalResponse> updateDocument(
            @PathVariable Long id,
            @RequestParam Long drafterId,
            @RequestBody ApprovalUpdateRequest request) {
        ApprovalResponse response = approvalService.updateDocument(id, drafterId, request);
        return ResponseEntity.ok(response);
    }
}
