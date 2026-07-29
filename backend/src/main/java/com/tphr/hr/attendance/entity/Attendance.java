package com.tphr.hr.attendance.entity;

import com.tphr.hr.common.entity.BaseEntity;
import com.tphr.hr.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "attendance")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Attendance extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Column(name = "check_in_time")
    private LocalTime checkInTime;

    @Column(name = "check_out_time")
    private LocalTime checkOutTime;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "NORMAL"; // NORMAL, LATE, ABSENT, EARLY_LEAVE

    @Column(name = "note", length = 255)
    private String note;

    @Column(name = "is_corrected", nullable = false)
    @Builder.Default
    private Boolean isCorrected = false;

    @Column(name = "correction_reason", length = 500)
    private String correctionReason;

    @Column(name = "corrected_by", length = 50)
    private String correctedBy;

    public void updateByAdmin(LocalTime checkInTime, LocalTime checkOutTime, String status, String note, String correctionReason, String correctedBy) {
        this.checkInTime = checkInTime;
        this.checkOutTime = checkOutTime;
        if (status != null && !status.isBlank()) {
            this.status = status;
        }
        if (note != null) {
            this.note = note;
        }
        this.isCorrected = true;
        this.correctionReason = correctionReason;
        this.correctedBy = correctedBy;
    }
}
