package com.tphr.hr.payroll.dto;

import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;

@Getter
@Builder
public class PayrollResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private Integer payrollYear;
    private Integer payrollMonth;
    private BigDecimal baseSalary;
    private BigDecimal totalAllowance;
    private BigDecimal totalDeduction;
    private BigDecimal netPay;
    private String status;
    private String departmentName;
    private String empNo;
    private String bankName;
    private String bankAccount;
    private String transferStatus;
    private java.time.LocalDateTime transferDate;
}
