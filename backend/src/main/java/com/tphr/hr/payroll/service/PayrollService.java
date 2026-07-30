package com.tphr.hr.payroll.service;

import com.tphr.hr.employee.entity.Employee;
import com.tphr.hr.employee.repository.EmployeeRepository;
import com.tphr.hr.payroll.dto.*;
import com.tphr.hr.payroll.entity.PayrollDetail;
import com.tphr.hr.payroll.entity.PayrollRecord;
import com.tphr.hr.payroll.repository.PayrollDetailRepository;
import com.tphr.hr.payroll.repository.PayrollRecordRepository;
import com.tphr.hr.attendance.service.AttendanceService;
import com.tphr.hr.attendance.dto.AttendanceSummaryDto;
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

import com.tphr.hr.payroll.repository.AllowanceItemRepository;
import com.tphr.hr.payroll.repository.BaseSalaryRepository;
import com.tphr.hr.payroll.repository.DeductionItemRepository;
import com.tphr.hr.payroll.entity.AllowanceItem;
import com.tphr.hr.payroll.entity.DeductionItem;
import com.tphr.hr.payroll.entity.BaseSalary;

@Slf4j
@Service
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollRecordRepository payrollRecordRepository;
    private final PayrollDetailRepository payrollDetailRepository;
    private final EmployeeRepository employeeRepository;
    private final BaseSalaryRepository baseSalaryRepository;
    private final AllowanceItemRepository allowanceItemRepository;
    private final DeductionItemRepository deductionItemRepository;
    private final AttendanceService attendanceService;

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

        List<BaseSalary> baseSalaries = baseSalaryRepository.findAll();
        List<AllowanceItem> activeAllowances = allowanceItemRepository.findAll().stream()
                .filter(a -> Boolean.TRUE.equals(a.getIsActive()))
                .collect(Collectors.toList());
        List<DeductionItem> activeDeductions = deductionItemRepository.findAll().stream()
                .filter(d -> Boolean.TRUE.equals(d.getIsActive()))
                .collect(Collectors.toList());

        List<AttendanceSummaryDto> attendanceSummaries = attendanceService.getMonthlySummary(year, month, null);

        for (Employee employee : activeEmployees) {
            // 1. 기본급 계산
            BigDecimal baseSalaryAmt = new BigDecimal("3000000"); // 기본값 300만원
            String empPosition = employee.getPosition() != null ? employee.getPosition().getName() : "";
            String empJobCategory = employee.getJobCategory() != null ? employee.getJobCategory().getName() : "";
            
            Optional<BaseSalary> matchedBs = baseSalaries.stream()
                    .filter(bs -> {
                        String title = bs.getJobTitle();
                        return title.equals(empPosition) || 
                               title.equals(empJobCategory) ||
                               (title.contains("간호") && empPosition.contains("간호")) ||
                               (title.contains("의사") && empJobCategory.contains("전문"));
                    })
                    .findFirst();
                    
            if (matchedBs.isPresent() && matchedBs.get().getActualAmount() != null) {
                baseSalaryAmt = BigDecimal.valueOf(matchedBs.get().getActualAmount());
            }

            // 2. 수당 계산
            BigDecimal totalAllowance = BigDecimal.ZERO;
            List<PayrollDetail> details = new ArrayList<>();
            for (AllowanceItem allowance : activeAllowances) {
                BigDecimal amt = BigDecimal.ZERO;
                if ("정액".equals(allowance.getAmountType())) {
                    try {
                        amt = new BigDecimal(allowance.getAmountOrRate().replaceAll("[^0-9.]", ""));
                    } catch (Exception e) {
                        amt = new BigDecimal("100000"); // 파싱 실패시 임의 기본값
                    }
                } else if ("비율".equals(allowance.getAmountType())) {
                    try {
                        BigDecimal rate = new BigDecimal(allowance.getAmountOrRate().replaceAll("[^0-9.]", "")).divide(new BigDecimal("100"));
                        amt = baseSalaryAmt.multiply(rate).setScale(0, RoundingMode.HALF_UP);
                    } catch (Exception e) {
                        amt = BigDecimal.ZERO;
                    }
                }
                totalAllowance = totalAllowance.add(amt);
                if (amt.compareTo(BigDecimal.ZERO) > 0) {
                    details.add(PayrollDetail.builder().itemType("ALLOWANCE").itemName(allowance.getName()).amount(amt).build());
                }
            }

            // --- 근태 기반 수당 계산 로직 추가 ---
            AttendanceSummaryDto attSummary = attendanceSummaries.stream()
                    .filter(s -> s.getId().equals(String.valueOf(employee.getId())))
                    .findFirst().orElse(null);
            
            if (attSummary != null) {
                // 야간/휴일/연장 등 실제로는 상세 시간을 계산해야 하나, 데모 시스템이므로 단순히 지각/조퇴가 없는 정상 출근일에 대해 랜덤 혹은 더미 수당 부여 가능
                // 또는 당직(Duty)을 연동할 수 있음. 우선 야간근무수당을 임의로 1일당 2만원으로 추가 (출근 횟수 기반)
                if (attSummary.getAttend() > 20) { // 출근일수가 20일 초과시 연장근무 수당 추가
                    BigDecimal overtimeAmt = new BigDecimal((attSummary.getAttend() - 20) * 50000);
                    totalAllowance = totalAllowance.add(overtimeAmt);
                    details.add(PayrollDetail.builder().itemType("ALLOWANCE").itemName("자동_연장근무수당").amount(overtimeAmt).build());
                }
            }
            // -----------------------------

            // 3. 공제 계산
            BigDecimal grossSalary = baseSalaryAmt.add(totalAllowance);
            BigDecimal totalDeduction = BigDecimal.ZERO;
            for (DeductionItem deduction : activeDeductions) {
                BigDecimal amt = BigDecimal.ZERO;
                if ("정액".equals(deduction.getDeductionType())) {
                    try {
                        amt = new BigDecimal(deduction.getRateOrAmount().replaceAll("[^0-9.]", ""));
                    } catch (Exception e) {
                        amt = new BigDecimal("30000");
                    }
                } else if ("기본급*요율".equals(deduction.getDeductionType())) {
                    try {
                        BigDecimal rate = new BigDecimal(deduction.getRateOrAmount().replaceAll("[^0-9.]", "")).divide(new BigDecimal("100"));
                        amt = baseSalaryAmt.multiply(rate).setScale(0, RoundingMode.HALF_UP);
                    } catch (Exception e) {
                        amt = BigDecimal.ZERO;
                    }
                } else if ("건강보험료*요율".equals(deduction.getDeductionType())) {
                    try {
                        // 대략 건강보험료(3.545%)의 요율이라고 가정
                        BigDecimal baseRate = new BigDecimal("0.03545");
                        BigDecimal healthIns = baseSalaryAmt.multiply(baseRate).setScale(0, RoundingMode.HALF_UP);
                        BigDecimal rate = new BigDecimal(deduction.getRateOrAmount().replaceAll("[^0-9.]", "")).divide(new BigDecimal("100"));
                        amt = healthIns.multiply(rate).setScale(0, RoundingMode.HALF_UP);
                    } catch (Exception e) {
                        amt = BigDecimal.ZERO;
                    }
                } else if ("간이세액표".equals(deduction.getDeductionType())) {
                    // 임의로 기본급의 5%를 소득세로 계산
                    amt = baseSalaryAmt.multiply(new BigDecimal("0.05")).setScale(0, RoundingMode.HALF_UP);
                } else if ("비율".equals(deduction.getDeductionType())) {
                    try {
                        BigDecimal rate = new BigDecimal(deduction.getRateOrAmount().replaceAll("[^0-9.]", "")).divide(new BigDecimal("100"));
                        amt = baseSalaryAmt.multiply(rate).setScale(0, RoundingMode.HALF_UP);
                    } catch (Exception e) {
                        amt = BigDecimal.ZERO;
                    }
                }
                totalDeduction = totalDeduction.add(amt);
                if (amt.compareTo(BigDecimal.ZERO) > 0) {
                    details.add(PayrollDetail.builder().itemType("DEDUCTION").itemName(deduction.getName()).amount(amt).build());
                }
            }

            // --- 근태 기반 결근 공제 로직 추가 ---
            if (attSummary != null && attSummary.getAbsent() > 0) {
                // 결근 1일당 기본급의 1/30 공제
                BigDecimal absentDeduction = baseSalaryAmt.divide(new BigDecimal("30"), 0, RoundingMode.HALF_UP).multiply(new BigDecimal(attSummary.getAbsent()));
                totalDeduction = totalDeduction.add(absentDeduction);
                details.add(PayrollDetail.builder().itemType("DEDUCTION").itemName("자동_결근공제").amount(absentDeduction).build());
            }
            // -----------------------------

            // 4. 실수령액
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
                existingRecord.updateCalculation(baseSalaryAmt, totalAllowance, totalDeduction, netPay);
                savedRecord = payrollRecordRepository.save(existingRecord);
                
                payrollDetailRepository.deleteByPayrollRecordId(savedRecord.getId());
                payrollDetailRepository.flush();
            } else {
                PayrollRecord record = PayrollRecord.builder()
                        .employee(employee)
                        .payrollYear(year)
                        .payrollMonth(month)
                        .baseSalary(baseSalaryAmt)
                        .totalAllowance(totalAllowance)
                        .totalDeduction(totalDeduction)
                        .netPay(netPay)
                        .status("PENDING")
                        .build();
                savedRecord = payrollRecordRepository.save(record);
            }

            calculatedRecords.add(savedRecord);

            List<PayrollDetail> finalDetails = new ArrayList<>();
            for (PayrollDetail tempDetail : details) {
                finalDetails.add(PayrollDetail.builder()
                        .payrollRecord(savedRecord)
                        .itemType(tempDetail.getItemType())
                        .itemName(tempDetail.getItemName())
                        .amount(tempDetail.getAmount())
                        .build());
            }
            payrollDetailRepository.saveAll(finalDetails);
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
