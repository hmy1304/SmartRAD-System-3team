package com.tphr.hr.approval.repository;

import com.tphr.hr.approval.entity.ApprovalLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApprovalLineRepository extends JpaRepository<ApprovalLine, Long> {
    
    // 특정 문서의 전체 결재선 조회 (순서대로)
    List<ApprovalLine> findByDocumentIdOrderBySequenceAsc(Long documentId);
    
    // 특정 문서에서 특정 결재자의 결재선 정보 조회
    Optional<ApprovalLine> findByDocumentIdAndApproverId(Long documentId, Long approverId);

    // 결재자로 조회
    List<ApprovalLine> findByApproverId(Long approverId);

    // 결재자 및 상태로 조회
    List<ApprovalLine> findByApproverIdAndStatus(Long approverId, String status);

    // 특정 문서의 전체 결재선 삭제
    void deleteByDocumentId(Long documentId);
}
