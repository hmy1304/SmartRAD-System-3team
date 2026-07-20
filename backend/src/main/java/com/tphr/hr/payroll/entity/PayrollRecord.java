package com.tphr.hr.payroll.entity;

import com.tphr.hr.common.entity.BaseEntity;
import com.tphr.hr.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "payroll_record")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class PayrollRecord extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "payroll_year", nullable = false)
    private Integer payrollYear; // 귀속년도 (e.g., 2026)

    @Column(name = "payroll_month", nullable = false)
    private Integer payrollMonth; // 귀속월 (e.g., 7)

    @Column(name = "base_salary", nullable = false)
    @Builder.Default
    private BigDecimal baseSalary = BigDecimal.ZERO; // 기본급

    @Column(name = "total_allowance", nullable = false)
    @Builder.Default
    private BigDecimal totalAllowance = BigDecimal.ZERO; // 수당 합계

    @Column(name = "total_deduction", nullable = false)
    @Builder.Default
    private BigDecimal totalDeduction = BigDecimal.ZERO; // 공제 합계

    @Column(name = "net_pay", nullable = false)
    @Builder.Default
    private BigDecimal netPay = BigDecimal.ZERO; // 실지급액

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "PENDING"; // 대기, 완료 등
}
