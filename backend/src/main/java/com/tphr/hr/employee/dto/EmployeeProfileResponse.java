package com.tphr.hr.employee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeProfileResponse {
    private EmployeeResponse basicInfo;
    private List<Map<String, Object>> appointmentHistory;
    private Map<String, Object> leaveQuota;
    private List<Map<String, Object>> statutoryEducations;
}
