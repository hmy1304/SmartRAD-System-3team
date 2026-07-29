package com.tphr.hr.payroll.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "allowance_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllowanceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "tax_type", nullable = false, length = 20)
    private String taxType;

    @Column(name = "amount_type", nullable = false, length = 20)
    private String amountType;

    @Column(name = "amount_or_rate", nullable = false, length = 50)
    private String amountOrRate;

    @Column(name = "calculation_basis", length = 100)
    private String calculationBasis;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
<<<<<<< HEAD
=======

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
>>>>>>> e4aeb421f7d3e5cae72099ee9ba963ba6ea31d3f
}
