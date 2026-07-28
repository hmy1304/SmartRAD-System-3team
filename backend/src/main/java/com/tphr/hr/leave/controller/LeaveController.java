package com.tphr.hr.leave.controller;

import com.tphr.hr.leave.dto.EmployeeQuotaResponse;
import com.tphr.hr.leave.dto.LeaveApplicationResponse;
import com.tphr.hr.leave.dto.LeaveStatusUpdateRequest;
import com.tphr.hr.leave.dto.LeaveSummaryResponse;
import com.tphr.hr.leave.service.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/leave")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    /**
     * 1. 휴가 관리 상단 KPI 5대 수치 및 우측 통계 위젯 조회
     */
    @GetMapping("/summary")
    public ResponseEntity<LeaveSummaryResponse> getSummary(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Long departmentId) {
        return ResponseEntity.ok(leaveService.getLeaveSummary(year, month, departmentId));
    }

    /**
     * 2. 휴가 신청 목록 조회 (상태 탭, 유형 필터, 검색어 지원)
     */
    @GetMapping("/applications")
    public ResponseEntity<List<LeaveApplicationResponse>> getApplications(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(leaveService.getApplications(status, type, keyword));
    }

    /**
     * 3. 사원별 실시간 연차 할당/사용/잔여 정보 조회
     */
    @GetMapping("/quota/{employeeId}")
    public ResponseEntity<EmployeeQuotaResponse> getEmployeeQuota(
            @PathVariable Long employeeId,
            @RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(leaveService.getEmployeeQuota(employeeId, year));
    }

    /**
     * 4. 신규 휴가 등록 (첨부파일 업로드 동반)
     */
    @PostMapping("/applications")
    public ResponseEntity<LeaveApplicationResponse> createApplication(
            @RequestParam Long employeeId,
            @RequestParam String leaveType,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam Double days,
            @RequestParam(required = false) String proxyEmployeeName,
            @RequestParam(required = false) String approverName,
            @RequestParam(required = false) String note,
            @RequestParam(required = false) MultipartFile file) {
        LeaveApplicationResponse response = leaveService.createApplication(
                employeeId, leaveType, startDate, endDate, days, proxyEmployeeName, approverName, note, file);
        return ResponseEntity.ok(response);
    }

    /**
     * 5. 선택 항목 일괄 승인/반려 (트랜잭션 차감 가동)
     */
    @PatchMapping("/applications/status")
    public ResponseEntity<Void> updateStatus(@RequestBody LeaveStatusUpdateRequest request) {
        leaveService.updateStatus(request.getApplicationIds(), request.getStatus(), request.getNote());
        return ResponseEntity.ok().build();
    }

    /**
     * 6. 휴가 신청 건 즉시 파기 및 물리 첨부파일 삭제
     */
    @DeleteMapping("/applications/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        leaveService.deleteApplication(id);
        return ResponseEntity.ok().build();
    }
}
