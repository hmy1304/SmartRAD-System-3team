package com.tphr.hr.employee.entity;

import com.tphr.hr.common.entity.BaseEntity;
import com.tphr.hr.system.entity.CommonCode;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "employee_health")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class EmployeeHealth extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "checkup_year", nullable = false)
    private Integer checkupYear; // 검진 년도

    @Column(name = "checkup_date")
    private LocalDate checkupDate; // 실제 검진일

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checkup_type_code")
    private CommonCode checkupType; // 검진 종류

    @Column(length = 100)
    private String institution; // 검진 기관

    @Column(length = 50)
    private String result; // 종합 판정

    @Column(columnDefinition = "TEXT")
    private String findings; // 주요 소견

    @Column(name = "checkup_items_json", columnDefinition = "JSON")
    private String checkupItemsJson; // 세부 검사 항목 (JSON)
}
