package com.tphr.hr.system.entity;

import com.tphr.hr.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "common_code")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CommonCode extends BaseEntity {

    @Id
    @Column(name = "code", length = 50)
    private String code; // e.g., POS_01, JOB_01

    @Column(name = "group_code", length = 50, nullable = false)
    private String groupCode; // e.g., POS, JOB

    @Column(name = "name", length = 100, nullable = false)
    private String name; // e.g., 수간호사, 방사선사

    @Column(name = "description")
    private String description;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "sort_order")
    private Integer sortOrder;

    // ===== 도메인 메서드 =====

    // PATCH /common-codes/{code} 부분 수정 - null인 항목은 변경하지 않는다
    public void update(String name, String description, Integer sortOrder, Boolean isActive) {
        if (name != null) this.name = name;
        if (description != null) this.description = description;
        if (sortOrder != null) this.sortOrder = sortOrder;
        if (isActive != null) this.isActive = isActive;
    }
}
