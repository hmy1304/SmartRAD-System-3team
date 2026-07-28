package com.tphr.hr.leave.repository;

import com.tphr.hr.leave.entity.LeaveApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface LeaveApplicationRepository extends JpaRepository<LeaveApplication, Long> {

    @Query("SELECT l FROM LeaveApplication l " +
           "JOIN FETCH l.employee e " +
           "LEFT JOIN FETCH e.department d " +
           "LEFT JOIN FETCH e.position p " +
           "WHERE (:status IS NULL OR :status = '' OR :status = '전체' OR l.status = :status) " +
           "AND (:type IS NULL OR :type = '' OR :type = '≡ 유형 전체' OR :type = '전체' OR l.leaveType LIKE CONCAT('%', :type, '%')) " +
           "AND (:keyword IS NULL OR :keyword = '' OR e.name LIKE CONCAT('%', :keyword, '%') OR (d IS NOT NULL AND d.name LIKE CONCAT('%', :keyword, '%'))) " +
           "ORDER BY l.createdAt DESC")
    List<LeaveApplication> findWithFilters(@Param("status") String status, 
                                           @Param("type") String type, 
                                           @Param("keyword") String keyword);

    long countByStatus(String status);

    List<LeaveApplication> findByAttachmentPathIsNotNull();
}
