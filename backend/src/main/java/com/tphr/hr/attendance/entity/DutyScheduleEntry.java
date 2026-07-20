package com.tphr.hr.attendance.entity;

import com.tphr.hr.common.entity.BaseEntity;
import com.tphr.hr.employee.entity.Employee;
import com.tphr.hr.system.entity.CommonCode;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "duty_schedule_entry")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class DutyScheduleEntry extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "duty_schedule_id", nullable = false)
    private DutySchedule dutySchedule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_type_code", nullable = false)
    private CommonCode shiftType; // D, E, N, OFF, 휴가 등
}
