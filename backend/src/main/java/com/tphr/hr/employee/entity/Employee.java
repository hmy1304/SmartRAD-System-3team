package com.tphr.hr.employee.entity;

import com.tphr.hr.common.entity.BaseEntity;
import com.tphr.hr.system.entity.CommonCode;
import com.tphr.hr.system.entity.RoleGroup;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "employee")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Employee extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "emp_no", unique = true, nullable = false, length = 20)
    private String empNo;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 100)
    private String password;

    @Column(length = 100)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(name = "join_date", nullable = false)
    private LocalDate joinDate;

    @Column(name = "is_shift_worker", nullable = false)
    @Builder.Default
    private Boolean isShiftWorker = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_group_id")
    private RoleGroup roleGroup;

    @Column(name = "account_status", nullable = false, length = 20)
    @Builder.Default
    private String accountStatus = "ACTIVE"; // ACTIVE, LOCKED

    @Column(name = "gender", length = 10)
    private String gender;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "address")
    private String address;

    @Column(name = "internal_phone", length = 20)
    private String internalPhone;

    @Column(name = "emergency_contact", length = 20)
    private String emergencyContact;

    @Column(name = "emergency_relation", length = 20)
    private String emergencyRelation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employment_type_code")
    private CommonCode employmentType; // 정규직, 계약직 등

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hire_route_code")
    private CommonCode hireRoute; // 공채, 특채 등

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_type_code")
    private CommonCode workType; // 교대, 상근 등

    @Column(name = "work_ward", length = 50)
    private String workWard;

    @Column(name = "pay_step")
    private Integer payStep; // 호봉

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payroll_type_code")
    private CommonCode payrollType; // 연봉제, 호봉제 등

    @Column(name = "payroll_date")
    private Integer payrollDate; // 급여지급일

    @Column(name = "bank_account", length = 50)
    private String bankAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tax_type_code")
    private CommonCode taxType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "position_code")
    private CommonCode position; // 직급 (수석, 1급 등)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_category_code")
    private CommonCode jobCategory; // 직군 (간호사, 방사선사 등)
}
