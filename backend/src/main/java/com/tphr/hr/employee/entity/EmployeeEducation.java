package com.tphr.hr.employee.entity;

import com.tphr.hr.common.entity.BaseEntity;
import com.tphr.hr.system.entity.CommonCode;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "employee_education")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class EmployeeEducation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "edu_type_code", nullable = false)
    private CommonCode eduType; 

    @Column(name = "completion_date", nullable = false)
    private LocalDate completionDate; 

    @Column(name = "expiration_date")
    private LocalDate expirationDate; 
}
