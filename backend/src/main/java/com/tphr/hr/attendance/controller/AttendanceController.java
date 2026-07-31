package com.tphr.hr.attendance.controller;

import com.tphr.hr.attendance.dto.*;
import com.tphr.hr.attendance.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.tphr.hr.system.auth.security.CustomUserDetails;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/check-in")
    public ResponseEntity<AttendanceResponse> checkIn(@RequestBody AttendanceCheckInRequest request) {
        return ResponseEntity.ok(attendanceService.checkIn(request));
    }

    @PostMapping("/check-out")
    public ResponseEntity<AttendanceResponse> checkOut(@RequestBody AttendanceCheckOutRequest request) {
        return ResponseEntity.ok(attendanceService.checkOut(request));
    }

    @GetMapping("/me")
    public ResponseEntity<List<AttendanceResponse>> getMyAttendances(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Long employeeId = Long.valueOf(userDetails.getEmployee().getEmpNo());
        return ResponseEntity.ok(attendanceService.getMyAttendances(employeeId, startDate, endDate));
    }

    @GetMapping("/department/{deptId}")
    public ResponseEntity<List<AttendanceResponse>> getDepartmentAttendances(
            @PathVariable Long deptId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(attendanceService.getDepartmentAttendances(deptId, startDate, endDate));
    }

    @GetMapping("/summary")
    public ResponseEntity<List<com.tphr.hr.attendance.dto.AttendanceSummaryDto>> getMonthlySummary(
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam(required = false) Long departmentId) {
        return ResponseEntity.ok(attendanceService.getMonthlySummary(year, month, departmentId));
    }

    // ===== 관리자 전용 근태 수정 및 수동 보정 API =====

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/admin")
    public ResponseEntity<Page<AttendanceResponse>> getAdminAttendances(
            @RequestParam(required = false) Long departmentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {
        return ResponseEntity.ok(attendanceService.getAdminAttendances(departmentId, startDate, endDate, pageable));
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping("/admin")
    public ResponseEntity<AttendanceResponse> createAttendanceByAdmin(@RequestBody AttendanceAdminCreateRequest request) {
        return ResponseEntity.ok(attendanceService.createAttendanceByAdmin(request));
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/admin/{id}")
    public ResponseEntity<AttendanceResponse> updateAttendanceByAdmin(
            @PathVariable Long id,
            @RequestBody AttendanceAdminUpdateRequest request) {
        return ResponseEntity.ok(attendanceService.updateAttendanceByAdmin(id, request));
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Void> deleteAttendanceByAdmin(@PathVariable Long id) {
        attendanceService.deleteAttendanceByAdmin(id);
        return ResponseEntity.noContent().build();
    }
}
