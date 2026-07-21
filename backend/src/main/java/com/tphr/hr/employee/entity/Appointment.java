package com.tphr.hr.employee.entity;

import com.tphr.hr.common.entity.BaseEntity;
import com.tphr.hr.system.entity.CommonCode;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "appointment")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Appointment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_type_code", nullable = false)
    private CommonCode appointmentType; 

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "after_department_id")
    private Department afterDepartment; 

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "after_position_code")
    private CommonCode afterPosition; 

    @Column(name = "after_pay_step")
    private Integer afterPayStep; // 호봉 변경이 있는 경우 SalaryGradeHistory 자동 생성에 사용

    @Column(name = "apply_date", nullable = false)
    private LocalDate applyDate; 

    @Column(length = 255)
    private String note;

    // applyDate 도래 시 스케줄러가 Employee.department/position 에 실제 반영했는지 여부
    @Column(name = "applied", nullable = false)
    @Builder.Default
    private Boolean applied = false;

    public void markApplied() {
        this.applied = true;
    }
}
