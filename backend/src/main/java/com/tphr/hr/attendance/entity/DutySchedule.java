package com.tphr.hr.attendance.entity;

import com.tphr.hr.common.entity.BaseEntity;
import com.tphr.hr.employee.entity.Department;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "duty_schedule")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class DutySchedule extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "schedule_year", nullable = false)
    private Integer scheduleYear;

    @Column(name = "schedule_month", nullable = false)
    private Integer scheduleMonth;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "DRAFT"; // DRAFT, CONFIRMED
}
