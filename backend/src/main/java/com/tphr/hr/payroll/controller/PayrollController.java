package com.tphr.hr.payroll.controller;

import com.tphr.hr.payroll.dto.*;
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
    public ResponseEntity<List<PayrollResponse>> calculatePayroll(
            @PathVariable Integer year,
            @PathVariable Integer month) {
        List<PayrollResponse> responses = payrollService.calculatePayroll(year, month);
        return ResponseEntity.ok(responses);
    }

    /**
     * 특정 연/월 전 직원 급여 대장 단순 리스트 조회 (재계산 안함)
     */
    @GetMapping("/{year}/{month}")
    public ResponseEntity<List<PayrollResponse>> getPayrollList(
            @PathVariable Integer year,
            @PathVariable Integer month) {
        List<PayrollResponse> responses = payrollService.getPayrollList(year, month);
        return ResponseEntity.ok(responses);
    }

    /**
     * 2. 특정 급여 대장 마감(확정)
     * @param recordId 급여 마스터(Record) ID
     */
    @PatchMapping("/{recordId}/confirm")
    public ResponseEntity<PayrollResponse> confirmPayroll(@PathVariable Long recordId) {
        PayrollResponse response = payrollService.confirmPayroll(recordId);
        return ResponseEntity.ok(response);
    }

    /**
     * 3. 특정 직원의 급여 명세서 상세 조회
     * @param employeeId 사원 ID
     * @param year 귀속 년도
     * @param month 귀속 월
     */
    @GetMapping("/{employeeId}/{year}/{month}")
    public ResponseEntity<PayrollRecordWithDetailsResponse> getPayrollDetails(
            @PathVariable Long employeeId,
            @PathVariable Integer year,
            @PathVariable Integer month) {
        PayrollRecordWithDetailsResponse response = payrollService.getPayrollDetails(employeeId, year, month);
        return ResponseEntity.ok(response);
    }

    /**
     * 4. 특정 급여 대장 삭제 (단, 확정된 급여는 삭제 불가)
     * @param recordId 급여 마스터(Record) ID
     */
    @DeleteMapping("/{recordId}")
    public ResponseEntity<Void> deletePayroll(@PathVariable Long recordId) {
        payrollService.deletePayroll(recordId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 5. 특정 직원 급여 수동 추가 (생성)
     */
    @PostMapping("/manual")
    public ResponseEntity<PayrollResponse> createManualPayroll(
            @RequestBody PayrollManualRequest request) {
        PayrollResponse response = payrollService.createManualPayroll(request);
        return ResponseEntity.ok(response);
    }

    /**
     * 6. 특정 급여 대장 수동 금액 수정
     */
    @PutMapping("/{recordId}")
    public ResponseEntity<PayrollResponse> updatePayroll(
            @PathVariable Long recordId,
            @RequestBody PayrollManualRequest request) {
        PayrollResponse response = payrollService.updatePayroll(recordId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 7. 상단 요약 카드 데이터 (특정 월)
     */
    @GetMapping("/{year}/{month}/summary")
    public ResponseEntity<PayrollSummaryResponse> getPayrollSummary(
            @PathVariable Integer year,
            @PathVariable Integer month) {
        PayrollSummaryResponse response = payrollService.getPayrollSummary(year, month);
        return ResponseEntity.ok(response);
    }

    /**
     * 8. 월별 급여 지급 추이 (특정 연도)
     */
    @GetMapping("/history")
    public ResponseEntity<List<PayrollMonthlyHistoryResponse>> getPayrollHistory(
            @RequestParam(defaultValue = "2026") Integer year) {
        List<PayrollMonthlyHistoryResponse> response = payrollService.getPayrollHistory(year);
        return ResponseEntity.ok(response);
    }
}
