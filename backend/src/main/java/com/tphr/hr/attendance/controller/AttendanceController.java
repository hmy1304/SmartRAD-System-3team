package com.tphr.hr.attendance.controller;

import com.tphr.hr.attendance.dto.AttendanceCheckInRequest;
import com.tphr.hr.attendance.dto.AttendanceCheckOutRequest;
import com.tphr.hr.attendance.dto.AttendanceResponse;
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
    }
}
