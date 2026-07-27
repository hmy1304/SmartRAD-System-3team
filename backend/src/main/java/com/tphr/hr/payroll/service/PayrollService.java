package com.tphr.hr.payroll.service;

import com.tphr.hr.employee.entity.Employee;
import com.tphr.hr.employee.repository.EmployeeRepository;
import com.tphr.hr.payroll.dto.*;
import com.tphr.hr.payroll.entity.PayrollDetail;
import com.tphr.hr.payroll.entity.PayrollRecord;
import com.tphr.hr.payroll.repository.PayrollDetailRepository;
import com.tphr.hr.payroll.repository.PayrollRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollRecordRepository payrollRecordRepository;
    private final PayrollDetailRepository payrollDetailRepository;
    private final EmployeeRepository employeeRepository;

    // 가상의 공제율 (실무에서는 DB 관리)
    private static final BigDecimal NATIONAL_PENSION_RATE = new BigDecimal("0.045"); // 국민연금 4.5%
    private static final BigDecimal HEALTH_INSURANCE_RATE = new BigDecimal("0.03545"); // 건강보험 3.545%

    /**
     * 특정 연/월의 전 직원 급여를 자동 계산하여 저장합니다.
     */
    @Transactional
    public List<PayrollResponse> calculatePayroll(Integer year, Integer month) {
        log.info("Starting payroll calculation for {}/{}", year, month);
        List<Employee> activeEmployees = employeeRepository.findByAccountStatus("ACTIVE");
        List<PayrollRecord> calculatedRecords = new ArrayList<>();

        for (Employee employee : activeEmployees) {
            // 1. 기본급 (실무에서는 직급/호봉 테이블 연동)
            BigDecimal baseSalary = new BigDecimal("3000000"); // 임의의 기본급 300만원

            // 2. 수당 계산 (야간/휴일 등)
            BigDecimal nightAllowance = new BigDecimal("150000");
            BigDecimal totalAllowance = nightAllowance;

            // 3. 공제 계산 (4대보험)
            BigDecimal grossSalary = baseSalary.add(totalAllowance);
            BigDecimal nationalPension = grossSalary.multiply(NATIONAL_PENSION_RATE).setScale(0, RoundingMode.HALF_UP);
            BigDecimal healthInsurance = grossSalary.multiply(HEALTH_INSURANCE_RATE).setScale(0, RoundingMode.HALF_UP);
            BigDecimal totalDeduction = nationalPension.add(healthInsurance);

            // 4. 실지급액
            BigDecimal netPay = grossSalary.subtract(totalDeduction);

            PayrollRecord savedRecord;

            Optional<PayrollRecord> optionalRecord = payrollRecordRepository.findByEmployeeIdAndPayrollYearAndPayrollMonth(employee.getId(), year, month);
            if (optionalRecord.isPresent()) {
                PayrollRecord existingRecord = optionalRecord.get();
                if ("CONFIRMED".equals(existingRecord.getStatus()) || "MANUAL".equals(existingRecord.getStatus())) {
                    log.info("Employee {} payroll for {}/{} is already {}. Skipping recalculation.", employee.getId(), year, month, existingRecord.getStatus());
                    calculatedRecords.add(existingRecord);
                    continue;
                }
                // 기존 내역 업데이트 (ID 유지)
                existingRecord.updateCalculation(baseSalary, totalAllowance, totalDeduction, netPay);
                savedRecord = payrollRecordRepository.save(existingRecord);
                
                // 상세 내역 초기화
                payrollDetailRepository.deleteByPayrollRecordId(savedRecord.getId());
                payrollDetailRepository.flush(); // 즉시 삭제 반영
            } else {
                // 신규 생성
                PayrollRecord record = PayrollRecord.builder()
                        .employee(employee)
                        .payrollYear(year)
                        .payrollMonth(month)
                        .baseSalary(baseSalary)
                        .totalAllowance(totalAllowance)
                        .totalDeduction(totalDeduction)
                        .netPay(netPay)
                        .status("PENDING")
                        .build();
                savedRecord = payrollRecordRepository.save(record);
            }

            calculatedRecords.add(savedRecord);

            // 6. 상세(Detail) 저장
            List<PayrollDetail> details = List.of(
                    PayrollDetail.builder().payrollRecord(savedRecord).itemType("ALLOWANCE").itemName("야간수당").amount(nightAllowance).build(),
                    PayrollDetail.builder().payrollRecord(savedRecord).itemType("DEDUCTION").itemName("국민연금").amount(nationalPension).build(),
                    PayrollDetail.builder().payrollRecord(savedRecord).itemType("DEDUCTION").itemName("건강보험").amount(healthInsurance).build()
            );
            payrollDetailRepository.saveAll(details);
        }

        return calculatedRecords.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /**
     * 특정 연/월의 모든 급여 대장 조회 (조회용)
     */
    @Transactional(readOnly = true)
    public List<PayrollResponse> getPayrollList(Integer year, Integer month) {
        List<PayrollRecord> records = payrollRecordRepository.findByPayrollYearAndPayrollMonth(year, month);
        return records.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /**
     * 급여 대장을 마감(확정) 처리합니다.
     */
    @Transactional
    public PayrollResponse confirmPayroll(Long recordId) {
        PayrollRecord record = payrollRecordRepository.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("Payroll record not found"));
        
        record.confirm(); // 상태 변경 (JPA 더티 체킹으로 자동 업데이트됨)
        
        return mapToResponse(record);
    }

    /**
     * 특정 급여 대장을 삭제합니다.
     */
    @Transactional
    public void deletePayroll(Long recordId) {
        PayrollRecord record = payrollRecordRepository.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("Payroll record not found"));
        
        if ("CONFIRMED".equals(record.getStatus())) {
            throw new IllegalStateException("Cannot delete a confirmed payroll record.");
        }
        
        payrollDetailRepository.deleteByPayrollRecordId(record.getId());
        payrollRecordRepository.delete(record);
    }

    /**
     * 특정 사원의 특정 월 급여를 수동으로 단건 추가(생성)합니다.
     */
    @Transactional
    public PayrollResponse createManualPayroll(PayrollManualRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        Optional<PayrollRecord> optionalRecord = payrollRecordRepository.findByEmployeeIdAndPayrollYearAndPayrollMonth(
                employee.getId(), request.getYear(), request.getMonth());

        if (optionalRecord.isPresent()) {
            throw new IllegalStateException("해당 연/월의 급여 대장이 이미 존재합니다. 수정 기능을 이용해주세요.");
        }

        PayrollRecord record = PayrollRecord.builder()
                .employee(employee)
                .payrollYear(request.getYear())
                .payrollMonth(request.getMonth())
                .baseSalary(request.getBaseSalary())
                .totalAllowance(request.getTotalAllowance())
                .totalDeduction(request.getTotalDeduction())
                .netPay(request.getNetPay())
                .status("MANUAL")
                .build();
        
        PayrollRecord savedRecord = payrollRecordRepository.save(record);
        
        // 수동 생성 시 세부 내역은 단순 묶음으로 추가 (필요 시 더 디테일하게 입력받도록 확장 가능)
        List<PayrollDetail> details = List.of(
                PayrollDetail.builder().payrollRecord(savedRecord).itemType("ALLOWANCE").itemName("수동 수당 입력").amount(request.getTotalAllowance()).build(),
                PayrollDetail.builder().payrollRecord(savedRecord).itemType("DEDUCTION").itemName("수동 공제 입력").amount(request.getTotalDeduction()).build()
        );
        payrollDetailRepository.saveAll(details);

        return mapToResponse(savedRecord);
    }

    /**
     * 특정 급여 대장의 금액을 수동으로 수정합니다.
     */
    @Transactional
    public PayrollResponse updatePayroll(Long recordId, PayrollManualRequest request) {
        PayrollRecord record = payrollRecordRepository.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("Payroll record not found"));

        if ("CONFIRMED".equals(record.getStatus())) {
            throw new IllegalStateException("이미 확정된 급여 대장은 수정할 수 없습니다.");
        }

        record.updateCalculation(request.getBaseSalary(), request.getTotalAllowance(), request.getTotalDeduction(), request.getNetPay());
        record.markAsManual();
        PayrollRecord savedRecord = payrollRecordRepository.save(record);

        payrollDetailRepository.deleteByPayrollRecordId(savedRecord.getId());
        payrollDetailRepository.flush();

        List<PayrollDetail> details = List.of(
                PayrollDetail.builder().payrollRecord(savedRecord).itemType("ALLOWANCE").itemName("수동 수당 업데이트").amount(request.getTotalAllowance()).build(),
                PayrollDetail.builder().payrollRecord(savedRecord).itemType("DEDUCTION").itemName("수동 공제 업데이트").amount(request.getTotalDeduction()).build()
        );
        payrollDetailRepository.saveAll(details);

        return mapToResponse(savedRecord);
    }

    /**
     * 특정 사원의 급여 명세서 상세 조회
     */
    @Transactional(readOnly = true)
    public PayrollRecordWithDetailsResponse getPayrollDetails(Long employeeId, Integer year, Integer month) {
        PayrollRecord record = payrollRecordRepository.findByEmployeeIdAndPayrollYearAndPayrollMonth(employeeId, year, month)
                .orElseThrow(() -> new IllegalArgumentException("Payroll record not found"));

        List<PayrollDetail> details = payrollDetailRepository.findByPayrollRecordId(record.getId());

        List<PayrollDetailResponse> detailResponses = details.stream()
                .map(d -> PayrollDetailResponse.builder()
                        .id(d.getId())
                        .itemType(d.getItemType())
                        .itemName(d.getItemName())
                        .amount(d.getAmount())
                        .build())
                .collect(Collectors.toList());

        return PayrollRecordWithDetailsResponse.builder()
                .record(mapToResponse(record))
                .details(detailResponses)
                .build();
    }

    @Transactional(readOnly = true)
    public PayrollSummaryResponse getPayrollSummary(Integer year, Integer month) {
        List<PayrollRecord> records = payrollRecordRepository.findByPayrollYearAndPayrollMonth(year, month);
        
        int targetCount = records.size();
        BigDecimal totalAmount = records.stream()
                .map(PayrollRecord::getNetPay)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        int pendingCount = (int) records.stream()
                .filter(r -> "PENDING".equals(r.getStatus()))
                .count();
                
        int transferFailedCount = (int) records.stream()
                .filter(r -> "FAILED".equals(r.getTransferStatus()))
                .count();
                
        return PayrollSummaryResponse.builder()
                .targetCount(targetCount)
                .totalAmount(totalAmount)
                .pendingCount(pendingCount)
                .transferFailedCount(transferFailedCount)
                .build();
    }

    @Transactional(readOnly = true)
    public List<PayrollMonthlyHistoryResponse> getPayrollHistory(Integer year) {
        List<PayrollMonthlyHistoryResponse> history = new ArrayList<>();
        
        // Loop from month 1 to 12
        for (int m = 1; m <= 12; m++) {
            List<PayrollRecord> records = payrollRecordRepository.findByPayrollYearAndPayrollMonth(year, m);
            if (!records.isEmpty()) {
                BigDecimal gross = records.stream().map(r -> r.getBaseSalary().add(r.getTotalAllowance())).reduce(BigDecimal.ZERO, BigDecimal::add);
                BigDecimal ded = records.stream().map(PayrollRecord::getTotalDeduction).reduce(BigDecimal.ZERO, BigDecimal::add);
                BigDecimal net = records.stream().map(PayrollRecord::getNetPay).reduce(BigDecimal.ZERO, BigDecimal::add);
                
                history.add(PayrollMonthlyHistoryResponse.builder()
                        .year(year)
                        .month(m)
                        .employeeCount(records.size())
                        .totalGrossAmount(gross)
                        .totalDeductionAmount(ded)
                        .totalNetAmount(net)
                        .build());
            }
        }
        return history;
    }
    private PayrollResponse mapToResponse(PayrollRecord record) {
        return PayrollResponse.builder()
                .id(record.getId())
                .employeeId(record.getEmployee().getId())
                .employeeName(record.getEmployee().getName())
                .payrollYear(record.getPayrollYear())
                .payrollMonth(record.getPayrollMonth())
                .baseSalary(record.getBaseSalary())
                .totalAllowance(record.getTotalAllowance())
                .totalDeduction(record.getTotalDeduction())
                .netPay(record.getNetPay())
                .status(record.getStatus())
                .departmentName(record.getEmployee().getDepartment() != null ? record.getEmployee().getDepartment().getName() : null)
                .empNo(record.getEmployee().getEmpNo())
                .bankName(record.getEmployee().getBankName())
                .bankAccount(record.getEmployee().getBankAccount())
                .transferStatus(record.getTransferStatus())
                .transferDate(record.getTransferDate())
                .build();
    }
}
