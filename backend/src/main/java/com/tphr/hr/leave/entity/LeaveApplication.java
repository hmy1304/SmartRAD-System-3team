package com.tphr.hr.leave.entity;

import com.tphr.hr.common.entity.BaseEntity;
import com.tphr.hr.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "leave_application")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class LeaveApplication extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "leave_type", nullable = false, length = 30)
    private String leaveType; // '연차', '반차 (오전)', '반차 (오후)', '병가', '기타'

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private Double days;

    @Column(name = "proxy_employee_name", length = 100)
    private String proxyEmployeeName;

    @Column(name = "approver_name", length = 100)
    private String approverName;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "승인대기"; // '승인대기', '승인완료', '반려'

    @Column(length = 255)
    private String note;

    @Column(name = "remain_text", length = 100)
    private String remainText;

    @Column(name = "remain_type", length = 20)
    @Builder.Default
    private String remainType = "normal"; // normal, doc, danger

    @Column(name = "attachment_path", length = 500)
    private String attachmentPath;

    @Column(name = "attachment_name", length = 255)
    private String attachmentName;

    // 비즈니스 메서드: 결재 상태 변경
    public void changeStatus(String newStatus, String note) {
        this.status = newStatus;
        if (note != null && !note.trim().isEmpty()) {
            this.note = note;
        }
    }
}
