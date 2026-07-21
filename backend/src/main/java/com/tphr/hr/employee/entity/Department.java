package com.tphr.hr.employee.entity;

import com.tphr.hr.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Department parent;

    @OneToMany(mappedBy = "parent")
    @Builder.Default
    private List<Department> children = new ArrayList<>();

    // ===== 도메인 메서드 =====

    // PATCH /departments/{id} 부분 수정 - null인 항목은 변경하지 않는다 (상위 부서 미지정 시 유지)
    public void update(String name, Department parent) {
        if (name != null) this.name = name;
        if (parent != null) this.parent = parent;
    }
}
