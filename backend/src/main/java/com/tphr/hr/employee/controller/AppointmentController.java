package com.tphr.hr.employee.controller;

import com.tphr.hr.employee.dto.AppointmentBatchRequest;
import com.tphr.hr.employee.dto.AppointmentCreateRequest;
import com.tphr.hr.employee.dto.AppointmentResponse;
import com.tphr.hr.employee.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    // POST /appointments - 발령 등록 (대상자 선택 -> 변경 후 부서/직급 -> applyDate 지정)
    @PostMapping
    public ResponseEntity<AppointmentResponse> createAppointment(@Valid @RequestBody AppointmentCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(appointmentService.createAppointment(request));
    }

    // POST /appointments/batch - 특정 날짜 기준 일괄 적용(Batch) 처리
    @PostMapping("/batch")
    public ResponseEntity<List<AppointmentResponse>> createAppointmentsBatch(
            @Valid @RequestBody AppointmentBatchRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(appointmentService.createAppointmentsBatch(request));
    }

    // GET /appointments/history/{employeeId} - 발령 이력 조회
    @GetMapping("/history/{employeeId}")
    public ResponseEntity<List<AppointmentResponse>> getHistory(@PathVariable Long employeeId) {
        return ResponseEntity.ok(appointmentService.getHistory(employeeId));
    }
}
