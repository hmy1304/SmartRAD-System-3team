package com.tphr.hr.employee.entity;

import com.tphr.hr.common.entity.BaseEntity;
import com.tphr.hr.system.entity.CommonCode;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "salary_grade_history")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class SalaryGradeHistory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "position_code", nullable = false)
    private CommonCode position; 

    @Column(name = "pay_step", nullable = false)
    private Integer payStep; 

    @Column(name = "apply_date", nullable = false)
    private LocalDate applyDate; 
}
