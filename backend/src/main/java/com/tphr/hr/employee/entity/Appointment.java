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

    @Column(name = "apply_date", nullable = false)
    private LocalDate applyDate; 

    @Column(length = 255)
    private String note;
}
