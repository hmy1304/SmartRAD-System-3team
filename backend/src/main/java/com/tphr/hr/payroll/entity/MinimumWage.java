package com.tphr.hr.payroll.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "minimum_wage")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MinimumWage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "apply_year", nullable = false)
    private Integer applyYear;

    @Column(name = "hourly_wage", nullable = false)
    private Long hourlyWage;

    @Column(name = "monthly_wage", nullable = false)
    private Long monthlyWage;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
