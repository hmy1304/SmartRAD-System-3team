package com.tphr.hr.payroll.controller;

import com.tphr.hr.payroll.dto.PayrollDto;
import com.tphr.hr.payroll.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payroll")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;

    /**
     * 1. 특정 연/월 전 직원 급여 자동 계산
     * @param year 귀속 년도 (예: 2026)
     * @param month 귀속 월 (예: 7)
     */
    @PostMapping("/{year}/{month}/calculate")
    public ResponseEntity<List<PayrollDto.Response>> calculatePayroll(
            @PathVariable Integer year,
            @PathVariable Integer month) {
        List<PayrollDto.Response> responses = payrollService.calculatePayroll(year, month);
        return ResponseEntity.ok(responses);
    }

    /**
     * 2. 특정 급여 대장 마감(확정)
     * @param recordId 급여 마스터(Record) ID
     */
    @PatchMapping("/{recordId}/confirm")
    public ResponseEntity<PayrollDto.Response> confirmPayroll(@PathVariable Long recordId) {
        PayrollDto.Response response = payrollService.confirmPayroll(recordId);
        return ResponseEntity.ok(response);
    }

    /**
     * 3. 특정 직원의 급여 명세서 상세 조회
     * @param employeeId 사원 ID
     * @param year 귀속 년도
     * @param month 귀속 월
     */
    @GetMapping("/{employeeId}/{year}/{month}")
    public ResponseEntity<PayrollDto.RecordWithDetailsResponse> getPayrollDetails(
            @PathVariable Long employeeId,
            @PathVariable Integer year,
            @PathVariable Integer month) {
        PayrollDto.RecordWithDetailsResponse response = payrollService.getPayrollDetails(employeeId, year, month);
        return ResponseEntity.ok(response);
    }
}
