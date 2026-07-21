package com.tphr.hr.system.entity;

import com.tphr.hr.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "role_group")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class RoleGroup extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 255)
    private String description;

    // ===== 도메인 메서드 =====

    // PATCH /role-groups/{id} 부분 수정 - null인 항목은 변경하지 않는다
    public void update(String name, String description) {
        if (name != null) this.name = name;
        if (description != null) this.description = description;
    }
}
