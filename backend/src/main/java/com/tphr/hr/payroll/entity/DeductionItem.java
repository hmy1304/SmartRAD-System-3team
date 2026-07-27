package com.tphr.hr.payroll.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "deduction_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeductionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "category", nullable = false, length = 20)
    private String category;

    @Column(name = "deduction_type", nullable = false, length = 20)
    private String deductionType;

    @Column(name = "rate_or_amount", nullable = false, length = 50)
    private String rateOrAmount;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
