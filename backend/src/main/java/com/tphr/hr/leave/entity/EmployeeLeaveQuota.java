package com.tphr.hr.leave.entity;

import com.tphr.hr.common.entity.BaseEntity;
import com.tphr.hr.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "employee_leave_quota", uniqueConstraints = {
    @UniqueConstraint(name = "uk_emp_year", columnNames = {"employee_id", "year"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class EmployeeLeaveQuota extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "total_days", nullable = false)
    @Builder.Default
    private Double totalDays = 15.0;

    @Column(name = "used_days", nullable = false)
    @Builder.Default
    private Double usedDays = 0.0;

    @Column(name = "remaining_days", nullable = false)
    @Builder.Default
    private Double remainingDays = 15.0;

    // 비즈니스 메서드: 연차 사용 및 차감
    public void deductDays(Double days) {
        this.usedDays = Math.round((this.usedDays + days) * 100.0) / 100.0;
        this.remainingDays = Math.round((this.totalDays - this.usedDays) * 100.0) / 100.0;
    }

    // 비즈니스 메서드: 연차 사용 취소 (복구)
    public void restoreDays(Double days) {
        this.usedDays = Math.max(0.0, Math.round((this.usedDays - days) * 100.0) / 100.0);
        this.remainingDays = Math.round((this.totalDays - this.usedDays) * 100.0) / 100.0;
    }
}
