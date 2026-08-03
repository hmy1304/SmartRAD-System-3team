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
    
    // 특정 문서에서 특정 결재자의 결재선 정보 조회 (이력 누적 대응, 가장 마지막 순번의 결재건 반환)
    Optional<ApprovalLine> findFirstByDocumentIdAndApproverIdOrderBySequenceDesc(Long documentId, Long approverId);

    // 특정 문서의 전체 결재선 삭제
    void deleteByDocumentId(Long documentId);
}
