package com.tphr.hr.approval.repository;

import com.tphr.hr.approval.entity.ApprovalComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApprovalCommentRepository extends JpaRepository<ApprovalComment, Long> {
    List<ApprovalComment> findByDocumentIdStrOrderByCreatedAtAsc(String documentIdStr);
}
