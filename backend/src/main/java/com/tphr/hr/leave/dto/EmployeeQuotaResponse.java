package com.tphr.hr.leave.dto;

import com.tphr.hr.leave.entity.EmployeeLeaveQuota;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeQuotaResponse {
    private Long employeeId;
    private String employeeName;
    private String initial;
    private String departmentName;
    private String positionName;
    private Double totalDays;
    private Double usedDays;
    private Double remainingDays;

    public static EmployeeQuotaResponse from(EmployeeLeaveQuota quota) {
        String empName = quota.getEmployee().getName();
        String initial = empName != null && empName.length() > 0 ? empName.substring(0, 1) : "사";
        String deptName = quota.getEmployee().getDepartment() != null ? quota.getEmployee().getDepartment().getName() : "부서없음";
        String posName = quota.getEmployee().getPosition() != null ? quota.getEmployee().getPosition().getName() : "사원";

        return EmployeeQuotaResponse.builder()
                .employeeId(quota.getEmployee().getId())
                .employeeName(empName)
                .initial(initial)
                .departmentName(deptName)
                .positionName(posName)
                .totalDays(quota.getTotalDays())
                .usedDays(quota.getUsedDays())
                .remainingDays(quota.getRemainingDays())
                .build();
    }
}
