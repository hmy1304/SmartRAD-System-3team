package com.tphr.hr.statutory.service;

import com.tphr.hr.statutory.dto.*;
import com.tphr.hr.statutory.entity.StatutorySchedule;
import com.tphr.hr.statutory.repository.StatutoryScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatutoryScheduleService {

    private final StatutoryScheduleRepository statutoryScheduleRepository;

    @Transactional
    public StatutoryScheduleResponse createSchedule(StatutoryScheduleRequest request) {
        StatutorySchedule schedule = StatutorySchedule.builder()
                .title(request.getTitle())
                .agency(request.getAgency())
                .category(request.getCategory())
                .target(request.getTarget())
                .deadline(request.getDeadline())
                .headCount(request.getHeadCount())
                .estimatedAmount(request.getEstimatedAmount())
                .memo(request.getMemo())
                .build();
        
        StatutorySchedule saved = statutoryScheduleRepository.save(schedule);
        return StatutoryScheduleResponse.from(saved);
    }

    @Transactional
    public StatutoryScheduleResponse updateStatus(Long id, String status) {
        StatutorySchedule schedule = statutoryScheduleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Schedule not found: " + id));
        schedule.updateStatus(status);
        return StatutoryScheduleResponse.from(schedule);
    }

    public StatutoryDashboardSummaryResponse getDashboardSummary(int year, int month) {
        LocalDate startOfMonth = YearMonth.of(year, month).atDay(1);
        LocalDate endOfMonth = YearMonth.of(year, month).atEndOfMonth();

        int total = statutoryScheduleRepository.countByDeadlineBetween(startOfMonth, endOfMonth);
        int completed = statutoryScheduleRepository.countByDeadlineBetweenAndStatus(startOfMonth, endOfMonth, "COMPLETED");
        
        // 기한 임박: 오늘부터 한 달 이내 미완료 건수
        LocalDate today = LocalDate.now();
        LocalDate in30Days = today.plusDays(30);
        int urgentCount = statutoryScheduleRepository.countByDeadlineBetweenAndStatus(today, in30Days, "PENDING");

        return StatutoryDashboardSummaryResponse.builder()
                .thisMonthTotal(total)
                .thisMonthCompleted(completed)
                .urgentCount(urgentCount)
                .build();
    }

    public List<StatutoryScheduleResponse> getSchedulesByMonth(int year, int month) {
        LocalDate startOfMonth = YearMonth.of(year, month).atDay(1);
        LocalDate endOfMonth = YearMonth.of(year, month).atEndOfMonth();
        
        return statutoryScheduleRepository.findByDeadlineBetweenOrderByDeadlineAsc(startOfMonth, endOfMonth).stream()
                .map(StatutoryScheduleResponse::from)
                .collect(Collectors.toList());
    }

    public List<StatutoryScheduleResponse> getUrgentSchedules(int limit) {
        LocalDate today = LocalDate.now();
        LocalDate in30Days = today.plusDays(30);
        
        return statutoryScheduleRepository.findByDeadlineBetweenAndStatusOrderByDeadlineAsc(today, in30Days, "PENDING").stream()
                .limit(limit)
                .map(StatutoryScheduleResponse::from)
                .collect(Collectors.toList());
    }

    public StatutoryYearlyStatsResponse getYearlyStats(int year) {
        List<StatutoryYearlyStatsResponse.MonthlyStat> monthlyStats = new ArrayList<>();
        
        for (int m = 1; m <= 12; m++) {
            LocalDate startOfMonth = YearMonth.of(year, m).atDay(1);
            LocalDate endOfMonth = YearMonth.of(year, m).atEndOfMonth();
            
            int total = statutoryScheduleRepository.countByDeadlineBetween(startOfMonth, endOfMonth);
            int completed = statutoryScheduleRepository.countByDeadlineBetweenAndStatus(startOfMonth, endOfMonth, "COMPLETED");
            
            monthlyStats.add(StatutoryYearlyStatsResponse.MonthlyStat.builder()
                    .month(m)
                    .totalCount(total)
                    .completedCount(completed)
                    .build());
        }
        
        return StatutoryYearlyStatsResponse.builder()
                .year(year)
                .monthlyStats(monthlyStats)
                .build();
    }
}
