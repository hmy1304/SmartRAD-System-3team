package com.tphr.hr.payroll.entity;

import com.tphr.hr.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "payroll_detail")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class PayrollDetail extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payroll_record_id", nullable = false)
    private PayrollRecord payrollRecord;

    @Column(name = "item_type", nullable = false, length = 20)
    private String itemType; // ALLOWANCE(수당), DEDUCTION(공제)

    @Column(name = "item_name", nullable = false, length = 50)
    private String itemName; // 야간수당, 국민연금 등

    @Column(nullable = false)
    private BigDecimal amount; // 금액
}
