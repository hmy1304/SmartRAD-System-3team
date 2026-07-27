package com.tphr.hr.statutory.entity;

import com.tphr.hr.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "statutory_schedule")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StatutorySchedule extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(length = 50)
    private String agency;

    @Column(length = 50)
    private String category;

    @Column(length = 50)
    private String target;

    @Column(nullable = false)
    private LocalDate deadline;

    private Integer headCount;

    private Long estimatedAmount;

    @Column(length = 500)
    private String memo;

    @Column(nullable = false, length = 20)
    private String status; // PENDING, COMPLETED

    @Builder
    public StatutorySchedule(String title, String agency, String category, String target, LocalDate deadline, Integer headCount, Long estimatedAmount, String memo, String status) {
        this.title = title;
        this.agency = agency;
        this.category = category;
        this.target = target;
        this.deadline = deadline;
        this.headCount = headCount;
        this.estimatedAmount = estimatedAmount;
        this.memo = memo;
        this.status = status != null ? status : "PENDING";
    }

    public void updateStatus(String status) {
        this.status = status;
    }
}
