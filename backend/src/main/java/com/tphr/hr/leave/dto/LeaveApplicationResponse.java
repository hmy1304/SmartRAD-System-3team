package com.tphr.hr.leave.dto;

import com.tphr.hr.leave.entity.LeaveApplication;
import lombok.*;
import java.time.format.DateTimeFormatter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveApplicationResponse {

    private Long id;
    private Long employeeId;
    private String name;
    private String initial;
    private String position;
    private String department;
    private String tone;
    private String type;
    private String applyDate;
    private String period;
    private String days;
    private String remainText;
    private String remainType;
    private String proxy;
    private String approver;
    private String status;
    private String note;
    private String attachmentName;
    private Boolean hasAttachment;

    public static LeaveApplicationResponse from(LeaveApplication entity) {
        String empName = entity.getEmployee().getName();
        String initial = empName != null && empName.length() > 0 ? empName.substring(0, 1) : "사";
        String deptName = entity.getEmployee().getDepartment() != null ? entity.getEmployee().getDepartment().getName() : "부서없음";
        String posName = entity.getEmployee().getPosition() != null ? entity.getEmployee().getPosition().getName() : "사원";
        String fullPosition = deptName + " · " + posName;

        // 색상 톤 결정 (디자인 시안 규칙 적용)
        String tone = "blue";
        if (empName.equals("이다영")) tone = "cyan";
        else if (empName.equals("김민서")) tone = "green";
        else if (empName.equals("신유나")) tone = "purple";
        else if (empName.equals("최지은")) tone = "red";
        else if (empName.equals("정우진")) tone = "orange";
        else if (empName.equals("배준혁")) tone = "amber";
        else {
            String[] tones = {"blue", "green", "purple", "orange", "cyan", "amber"};
            tone = tones[(int)(Math.abs(entity.getEmployee().getId()) % tones.length)];
        }

        DateTimeFormatter mdFormatter = DateTimeFormatter.ofPattern("MM.dd");
        String applyDate = entity.getCreatedAt() != null ? entity.getCreatedAt().format(mdFormatter) : entity.getStartDate().format(mdFormatter);
        
        String periodText = entity.getStartDate().format(mdFormatter);
        if (!entity.getStartDate().equals(entity.getEndDate())) {
            periodText += " ~ " + entity.getEndDate().format(mdFormatter);
        } else if (entity.getLeaveType().contains("반차")) {
            periodText += entity.getLeaveType().contains("오후") ? " 오후" : " 오전";
        }

        String daysText = (entity.getDays() == Math.floor(entity.getDays())) ? 
            String.format("%.0f일", entity.getDays()) : String.format("%.1f일", entity.getDays());

        return LeaveApplicationResponse.builder()
                .id(entity.getId())
                .employeeId(entity.getEmployee().getId())
                .name(empName)
                .initial(initial)
                .position(fullPosition)
                .department(deptName)
                .tone(tone)
                .type(entity.getLeaveType())
                .applyDate(applyDate)
                .period(periodText)
                .days(daysText)
                .remainText(entity.getRemainText() != null ? entity.getRemainText() : "-")
                .remainType(entity.getRemainType() != null ? entity.getRemainType() : "normal")
                .proxy(entity.getProxyEmployeeName() != null && !entity.getProxyEmployeeName().isEmpty() ? entity.getProxyEmployeeName() : "—")
                .approver(entity.getApproverName() != null && !entity.getApproverName().isEmpty() ? entity.getApproverName() : "—")
                .status(entity.getStatus())
                .note(entity.getNote() != null ? entity.getNote() : "")
                .attachmentName(entity.getAttachmentName())
                .hasAttachment(entity.getAttachmentPath() != null && !entity.getAttachmentPath().isEmpty())
                .build();
    }
}
