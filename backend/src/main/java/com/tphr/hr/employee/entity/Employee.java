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

    // ===== 도메인 메서드 =====

    public void changePassword(String encodedPassword) {
        this.password = encodedPassword;
    }

    // 계정 잠금/해제 (LOCKED <-> ACTIVE)
    public void changeAccountStatus(String accountStatus) {
        this.accountStatus = accountStatus;
    }

    // PATCH /employees/{id} 부분 수정 - null인 항목은 변경하지 않는다
    public void updateProfile(String name, String email, String phone, String gender, LocalDate birthDate,
                               String address, String internalPhone, String emergencyContact, String emergencyRelation,
                               Department department, CommonCode position, CommonCode jobCategory,
                               CommonCode employmentType, CommonCode hireRoute, CommonCode workType, String workWard,
                               Integer payStep, CommonCode payrollType, Integer payrollDate, String bankAccount,
                               CommonCode taxType, RoleGroup roleGroup, Boolean isShiftWorker) {
        if (name != null) this.name = name;
        if (email != null) this.email = email;
        if (phone != null) this.phone = phone;
        if (gender != null) this.gender = gender;
        if (birthDate != null) this.birthDate = birthDate;
        if (address != null) this.address = address;
        if (internalPhone != null) this.internalPhone = internalPhone;
        if (emergencyContact != null) this.emergencyContact = emergencyContact;
        if (emergencyRelation != null) this.emergencyRelation = emergencyRelation;
        if (department != null) this.department = department;
        if (position != null) this.position = position;
        if (jobCategory != null) this.jobCategory = jobCategory;
        if (employmentType != null) this.employmentType = employmentType;
        if (hireRoute != null) this.hireRoute = hireRoute;
        if (workType != null) this.workType = workType;
        if (workWard != null) this.workWard = workWard;
        if (payStep != null) this.payStep = payStep;
        if (payrollType != null) this.payrollType = payrollType;
        if (payrollDate != null) this.payrollDate = payrollDate;
        if (bankAccount != null) this.bankAccount = bankAccount;
        if (taxType != null) this.taxType = taxType;
        if (roleGroup != null) this.roleGroup = roleGroup;
        if (isShiftWorker != null) this.isShiftWorker = isShiftWorker;
    }

    // 발령 확정(applyDate 도래) 시 실제 부서/직급/호봉 반영
    public void applyAppointment(Department department, CommonCode position, Integer payStep) {
        if (department != null) this.department = department;
        if (position != null) this.position = position;
        if (payStep != null) this.payStep = payStep;
    }
}
