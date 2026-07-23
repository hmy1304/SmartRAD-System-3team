package com.tphr.hr.statutory.controller;

import com.tphr.hr.statutory.dto.*;
import com.tphr.hr.statutory.service.StatutoryScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/statutory")
@RequiredArgsConstructor
public class StatutoryScheduleController {

    private final StatutoryScheduleService statutoryScheduleService;

    // 1. 대시보드 상단 요약 위젯
    @GetMapping("/schedules/dashboard-summary")
    public ResponseEntity<StatutoryDashboardSummaryResponse> getDashboardSummary(
            @RequestParam int year, @RequestParam int month) {
        return ResponseEntity.ok(statutoryScheduleService.getDashboardSummary(year, month));
    }

    // 2. 리스트 및 달력용 데이터 (특정 월 전체)
    @GetMapping("/schedules/calendar")
    public ResponseEntity<List<StatutoryScheduleResponse>> getSchedulesByMonth(
            @RequestParam int year, @RequestParam int month) {
        return ResponseEntity.ok(statutoryScheduleService.getSchedulesByMonth(year, month));
    }

    // 3. 기한 임박 일정 (다가오는 신고 일정)
    @GetMapping("/schedules/urgent")
    public ResponseEntity<List<StatutoryScheduleResponse>> getUrgentSchedules(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(statutoryScheduleService.getUrgentSchedules(limit));
    }

    // 4. 연간 통계 (바 차트용)
    @GetMapping("/schedules/yearly-stats")
    public ResponseEntity<StatutoryYearlyStatsResponse> getYearlyStats(
            @RequestParam int year) {
        return ResponseEntity.ok(statutoryScheduleService.getYearlyStats(year));
    }

    // 5. 일정 수동 등록
    @PostMapping("/schedules")
    public ResponseEntity<StatutoryScheduleResponse> createSchedule(
            @RequestBody StatutoryScheduleRequest request) {
        return ResponseEntity.ok(statutoryScheduleService.createSchedule(request));
    }

    // 6. 신고 완료 상태 업데이트
    @PatchMapping("/schedules/{id}/status")
    public ResponseEntity<StatutoryScheduleResponse> updateStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(statutoryScheduleService.updateStatus(id, status));
    }
}
