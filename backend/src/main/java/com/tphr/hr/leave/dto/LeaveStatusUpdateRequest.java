package com.tphr.hr.leave.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveStatusUpdateRequest {
    private List<Long> applicationIds;
    private String status; // '승인완료' 또는 '반려', 'APPROVED' / 'REJECTED'
    private String note;   // 반려 사유 등
}
