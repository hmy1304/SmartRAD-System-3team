package com.tphr.hr.employee.entity;

import com.tphr.hr.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "department")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Department extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "dept_code", length = 50, unique = true)
    private String deptCode;

    @Column(name = "name_en", length = 100)
    private String nameEn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private Employee manager;

    @Column(length = 150)
    private String location;

    @Column(length = 50)
    private String phone;

    @Column(name = "established_date")
    private LocalDate establishedDate;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Department parent;

    @OneToMany(mappedBy = "parent")
    @Builder.Default
    private List<Department> children = new ArrayList<>();

    // ===== 도메인 메서드 =====

    // PATCH /departments/{id} 부분 수정 - null인 항목은 변경하지 않는다
    public void update(String name, String nameEn, Employee manager, String location, String phone, LocalDate establishedDate, String description, Department parent) {
        if (name != null) this.name = name;
        if (nameEn != null) this.nameEn = nameEn;
        if (manager != null) this.manager = manager;
        if (location != null) this.location = location;
        if (phone != null) this.phone = phone;
        if (establishedDate != null) this.establishedDate = establishedDate;
        if (description != null) this.description = description;
        if (parent != null) this.parent = parent;
    }
}
