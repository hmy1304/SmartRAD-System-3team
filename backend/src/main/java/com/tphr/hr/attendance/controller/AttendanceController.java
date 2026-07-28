package com.tphr.hr.attendance.controller;

import com.tphr.hr.attendance.dto.*;
import com.tphr.hr.attendance.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
            @RequestParam Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
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
    // ===== 愿由ъ옄 ?꾩슜 洹쇳깭 ?뺤젙 諛??섎룞 蹂댁젙 API =====

    @GetMapping("/admin")
    public ResponseEntity<List<AttendanceResponse>> getAdminAttendances(
            @RequestParam(required = false) Long departmentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(attendanceService.getAdminAttendances(departmentId, startDate, endDate));
    }

    @PostMapping("/admin")
    public ResponseEntity<AttendanceResponse> createAttendanceByAdmin(@RequestBody AttendanceAdminCreateRequest request) {
        return ResponseEntity.ok(attendanceService.createAttendanceByAdmin(request));
    }

    @PutMapping("/admin/{id}")
    public ResponseEntity<AttendanceResponse> updateAttendanceByAdmin(
            @PathVariable Long id,
            @RequestBody AttendanceAdminUpdateRequest request) {
        return ResponseEntity.ok(attendanceService.updateAttendanceByAdmin(id, request));
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Void> deleteAttendanceByAdmin(@PathVariable Long id) {
        attendanceService.deleteAttendanceByAdmin(id);
        return ResponseEntity.noContent().build();
    }
}

