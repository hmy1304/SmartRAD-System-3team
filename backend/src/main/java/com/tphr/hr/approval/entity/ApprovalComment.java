package com.tphr.hr.approval.entity;

import com.tphr.hr.common.entity.BaseEntity;
import com.tphr.hr.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "approval_comment")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ApprovalComment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "document_id_str", nullable = false, length = 50)
    private String documentIdStr;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false, length = 1000)
    private String content;
}
