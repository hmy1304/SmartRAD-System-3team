package com.tphr.hr.statutory.repository;

import com.tphr.hr.statutory.entity.StatutorySchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface StatutoryScheduleRepository extends JpaRepository<StatutorySchedule, Long> {
    
    // 캘린더용 월별 전체 일정 조회
    List<StatutorySchedule> findByDeadlineBetweenOrderByDeadlineAsc(LocalDate startDate, LocalDate endDate);
    
    // 기한 임박 일정 조회 (미완료 + 오늘 이후)
    List<StatutorySchedule> findByDeadlineBetweenAndStatusOrderByDeadlineAsc(LocalDate startDate, LocalDate endDate, String status);

    // 상태와 무관하게 연간 통계용 집계 등 필요 시
    int countByDeadlineBetween(LocalDate startDate, LocalDate endDate);
    
    // 특정 상태의 일정 집계
    int countByDeadlineBetweenAndStatus(LocalDate startDate, LocalDate endDate, String status);
}
