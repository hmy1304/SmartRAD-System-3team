package com.tphr.hr.leave.controller;

import com.tphr.hr.leave.dto.*;
import com.tphr.hr.leave.service.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.tphr.hr.system.auth.security.CustomUserDetails;

import java.net.MalformedURLException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/leave")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class LeaveController {

    private final LeaveService leaveService;

    /**
     * 1. 종합 휴가 현황 통계 조회 (상단 5대 KPI 카드 및 우측 위젯 실시간 계산)
     */
    @GetMapping("/summary")
    public ResponseEntity<LeaveSummaryResponse> getSummary(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Long departmentId) {
        return ResponseEntity.ok(leaveService.getLeaveSummary(year, month, departmentId));
    }

    /**
     * 2. 휴가 신청 목록 조회 (연도/월 날짜 범위, 상태 탭, 유형 필터, 검색어 지원)
     */
    @GetMapping("/applications")
    public ResponseEntity<List<LeaveApplicationResponse>> getApplications(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(leaveService.getApplications(year, month, status, type, keyword));
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
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam String leaveType,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam Double days,
            @RequestParam(required = false) String proxyEmployeeName,
            @RequestParam(required = false) String approverName,
            @RequestParam(required = false) String note,
            @RequestParam(required = false) MultipartFile file) {
        Long employeeId = Long.valueOf(userDetails.getEmployee().getEmpNo());
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

    /**
     * 7. 서버 로컬 스토리지에 저장된 첨부파일 열람 및 다운로드 API
     */
    @GetMapping("/attachments/{fileName:.+}")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable String fileName) {
        try {
            Path baseDir = Paths.get("uploads/leave/").toAbsolutePath().normalize();
            Path file = baseDir.resolve(fileName).normalize();
            
            // Path Traversal 방어
            if (!file.startsWith(baseDir)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() && resource.isReadable()) {
                String encodedName = URLEncoder.encode(resource.getFilename(), StandardCharsets.UTF_8).replaceAll("\\+", "%20");
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedName + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 8. 서버 사이드 엑셀(CSV) 공식 휴가 현황 감사 보고서 다운로드
     */
    @GetMapping(value = "/export", produces = "text/csv; charset=UTF-8")
    public ResponseEntity<byte[]> exportLeaveReport(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String keyword) {
        byte[] csvData = leaveService.generateLeaveReportCsv(year, month, status, type, keyword);
        String fileName = String.format("Leave_Report_%s_%s.csv", 
                year != null ? year + "Y" : "All", month != null ? month + "M" : "All");
        String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replaceAll("\\+", "%20");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedFileName + "\"")
                .header(HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8")
                .body(csvData);
    }
}
