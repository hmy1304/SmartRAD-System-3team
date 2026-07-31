package com.tphr.hr.approval.service;

import com.tphr.hr.approval.dto.*;
import com.tphr.hr.approval.entity.ApprovalAttachment;
import com.tphr.hr.approval.entity.ApprovalComment;
import com.tphr.hr.approval.entity.ApprovalDocument;
import com.tphr.hr.approval.entity.ApprovalLine;
import com.tphr.hr.approval.repository.ApprovalAttachmentRepository;
import com.tphr.hr.approval.repository.ApprovalCommentRepository;
import com.tphr.hr.approval.repository.ApprovalDocumentRepository;
import com.tphr.hr.approval.repository.ApprovalLineRepository;
import com.tphr.hr.employee.entity.Appointment;
import com.tphr.hr.employee.entity.Employee;
import com.tphr.hr.employee.repository.AppointmentRepository;
import com.tphr.hr.leave.entity.LeaveApplication;
import com.tphr.hr.leave.repository.LeaveApplicationRepository;
import com.tphr.hr.leave.service.LeaveService;
import com.tphr.hr.payroll.service.PayrollService;
import com.tphr.hr.system.entity.CommonCode;
import jakarta.persistence.EntityManager;
import java.time.LocalDate;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.boot.json.JsonParser;
import org.springframework.boot.json.JsonParserFactory;
import java.util.Map;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApprovalService {

    private final ApprovalDocumentRepository approvalDocumentRepository;
    private final ApprovalLineRepository approvalLineRepository;
    private final ApprovalAttachmentRepository approvalAttachmentRepository;
    private final ApprovalCommentRepository approvalCommentRepository;
    private final LeaveApplicationRepository leaveApplicationRepository;
    private final LeaveService leaveService;
    private final PayrollService payrollService;
    private final AppointmentRepository appointmentRepository;
    private final com.tphr.hr.employee.service.AppointmentService appointmentService;
    private final EntityManager entityManager;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy. MM. dd HH:mm");

    @Transactional(readOnly = true)
    public ApprovalInboxResponse getPendingApprovals(Long approverId) {
        List<ApprovalInboxResponse.ApprovalDocumentDto> docDtos = new ArrayList<>();

        // 1. Leave Applications (status = "승인대기")
        List<LeaveApplication> pendingLeaves = leaveApplicationRepository.findAll().stream()
                .filter(l -> "승인대기".equals(l.getStatus()))
                .collect(Collectors.toList());

        for (LeaveApplication leave : pendingLeaves) {
            String contentHtml = String.format("<p><strong>휴가 종류:</strong> %s</p><p><strong>기간:</strong> %s ~ %s (%.1f일)</p><p><strong>사유:</strong> %s</p>",
                    leave.getLeaveType(), leave.getStartDate(), leave.getEndDate(), leave.getDays(), leave.getNote() != null ? leave.getNote() : "없음");

            docDtos.add(ApprovalInboxResponse.ApprovalDocumentDto.builder()
                    .id("LEAVE-" + leave.getId())
                    .priority("normal")
                    .priorityLabel("일반")
                    .title(leave.getEmployee().getName() + " 휴가 신청 (" + leave.getLeaveType() + ")")
                    .attachment(leave.getAttachmentName() != null ? leave.getAttachmentName() : "")
                    .drafter(leave.getEmployee().getName())
                    .drafterInitial(leave.getEmployee().getName().substring(0, 1))
                    .drafterDepartment(leave.getEmployee().getDepartment() != null ? leave.getEmployee().getDepartment().getName() : "")
                    .drafterRole(leave.getEmployee().getPosition() != null ? leave.getEmployee().getPosition().getName() : "")
                    .avatarTone("blue")
                    .requestedAt(leave.getCreatedAt() != null ? leave.getCreatedAt().format(FORMATTER) : "")
                    .dDay(calculateDDay(leave.getStartDate().atStartOfDay()))
                    .description(contentHtml)
                    .fileName(leave.getAttachmentName() != null ? leave.getAttachmentName() : "")
                    .fileMeta(leave.getAttachmentName() != null ? "첨부파일" : "")
                    .build());
        }

        // 2. Appointments (status = "WAITING")
        List<Appointment> pendingAppointments = appointmentRepository.findByStatus("WAITING");
        for (Appointment appt : pendingAppointments) {
            String contentHtml = String.format("<p><strong>발령일:</strong> %s</p><p><strong>발령유형:</strong> %s</p><p><strong>부서 변경:</strong> %s -> %s</p>",
                    appt.getApplyDate(),
                    appt.getAppointmentType() != null ? appt.getAppointmentType().getName() : "",
                    appt.getBeforeDepartment() != null ? appt.getBeforeDepartment().getName() : "-",
                    appt.getAfterDepartment() != null ? appt.getAfterDepartment().getName() : "-");

            docDtos.add(ApprovalInboxResponse.ApprovalDocumentDto.builder()
                    .id("APPT-" + appt.getId())
                    .priority("urgent")
                    .priorityLabel("긴급")
                    .title(appt.getEmployee().getName() + " 인사발령 기안")
                    .attachment("")
                    .drafter("시스템")
                    .drafterInitial("시")
                    .drafterDepartment("인사부")
                    .drafterRole("관리자")
                    .avatarTone("red")
                    .requestedAt(appt.getCreatedAt() != null ? appt.getCreatedAt().format(FORMATTER) : "")
                    .dDay(calculateDDay(appt.getApplyDate().atStartOfDay()))
                    .description(contentHtml)
                    .fileName("")
                    .fileMeta("")
                    .build());
        }

        // 3. Regular ApprovalDocuments (status = WAITING)
        List<ApprovalLine> pendingLines = approvalLineRepository.findAll().stream()
                .filter(l -> l.getApprover().getId().equals(approverId) && "WAITING".equals(l.getStatus()))
                .collect(Collectors.toList());

        for (ApprovalLine line : pendingLines) {
            ApprovalDocument doc = line.getDocument();
            docDtos.add(ApprovalInboxResponse.ApprovalDocumentDto.builder()
                    .id("DOC-" + doc.getId())
                    .priority("normal")
                    .priorityLabel("일반")
                    .title(doc.getTitle())
                    .attachment("")
                    .drafter(doc.getDraftedBy().getName())
                    .drafterInitial(doc.getDraftedBy().getName().substring(0, 1))
                    .drafterDepartment(doc.getDraftedBy().getDepartment() != null ? doc.getDraftedBy().getDepartment().getName() : "")
                    .drafterRole(doc.getDraftedBy().getPosition() != null ? doc.getDraftedBy().getPosition().getName() : "")
                    .avatarTone("green")
                    .requestedAt(doc.getCreatedAt() != null ? doc.getCreatedAt().format(FORMATTER) : "")
                    .dDay("D-0")
                    .description(doc.getContent())
                    .fileName("")
                    .fileMeta("")
                    .build());
        }

        // Aggregate comments for all these docs
        List<ApprovalInboxResponse.ApprovalCommentDto> commentDtos = new ArrayList<>();
        for (ApprovalInboxResponse.ApprovalDocumentDto doc : docDtos) {
            List<ApprovalComment> comments = approvalCommentRepository.findByDocumentIdStrOrderByCreatedAtAsc(doc.getId());
            for (ApprovalComment c : comments) {
                commentDtos.add(ApprovalInboxResponse.ApprovalCommentDto.builder()
                        .id(c.getId())
                        .documentId(c.getDocumentIdStr())
                        .initial(c.getEmployee().getName().substring(0, 1))
                        .name(c.getEmployee().getName())
                        .tag("결재자")
                        .time(c.getCreatedAt() != null ? c.getCreatedAt().format(FORMATTER) : "")
                        .content(c.getContent())
                        .avatarTone("purple")
                        .build());
            }
        }

        int urgentCount = (int) docDtos.stream().filter(d -> "urgent".equals(d.getPriority())).count();
        int dueTodayCount = (int) docDtos.stream().filter(d -> "D-0".equals(d.getDDay())).count();

        LocalDateTime now = LocalDateTime.now();
        long processedThisMonth = approvalLineRepository.findAll().stream()
                .filter(l -> l.getApprover().getId().equals(approverId))
                .filter(l -> ("APPROVED".equals(l.getStatus()) || "REJECTED".equals(l.getStatus()))
                        && l.getUpdatedAt() != null
                        && l.getUpdatedAt().getMonth() == now.getMonth()
                        && l.getUpdatedAt().getYear() == now.getYear())
                .count();

        long approvedThisMonth = approvalLineRepository.findAll().stream()
                .filter(l -> l.getApprover().getId().equals(approverId))
                .filter(l -> "APPROVED".equals(l.getStatus())
                        && l.getUpdatedAt() != null
                        && l.getUpdatedAt().getMonth() == now.getMonth()
                        && l.getUpdatedAt().getYear() == now.getYear())
                .count();

        int calculatedApprovalRate = processedThisMonth > 0 ? (int) ((approvedThisMonth * 100) / processedThisMonth) : 0;

        ApprovalInboxResponse.ApprovalSummaryDto summary = ApprovalInboxResponse.ApprovalSummaryDto.builder()
                .totalPending(docDtos.size())
                .urgentPending(urgentCount)
                .dueToday(dueTodayCount)
                .processedThisMonth((int) processedThisMonth)
                .approvalRate(calculatedApprovalRate)
                .build();

        return ApprovalInboxResponse.builder()
                .summary(summary)
                .documents(docDtos)
                .comments(commentDtos)
                .build();
    }

    @Transactional(readOnly = true)
    public ApprovalInboxResponse getApprovedApprovals(Long approverId) {
        List<ApprovalInboxResponse.ApprovalDocumentDto> docDtos = new ArrayList<>();

        List<ApprovalLine> approvedLines = approvalLineRepository.findAll().stream()
                .filter(l -> l.getApprover().getId().equals(approverId) && 
                        ("APPROVED".equals(l.getStatus()) || "REJECTED".equals(l.getStatus())))
                .sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()))
                .collect(Collectors.toList());

        for (ApprovalLine line : approvedLines) {
            ApprovalDocument doc = line.getDocument();
            docDtos.add(ApprovalInboxResponse.ApprovalDocumentDto.builder()
                    .id("DOC-" + doc.getId())
                    .priority("normal")
                    .priorityLabel("일반")
                    .title(doc.getTitle())
                    .attachment("")
                    .drafter(doc.getDraftedBy().getName())
                    .drafterInitial(doc.getDraftedBy().getName().substring(0, 1))
                    .drafterDepartment(doc.getDraftedBy().getDepartment() != null ? doc.getDraftedBy().getDepartment().getName() : "")
                    .drafterRole(doc.getDraftedBy().getPosition() != null ? doc.getDraftedBy().getPosition().getName() : "")
                    .avatarTone(line.getStatus().equals("REJECTED") ? "red" : "green")
                    .requestedAt(doc.getCreatedAt() != null ? doc.getCreatedAt().format(FORMATTER) : "")
                    .dDay(line.getStatus().equals("REJECTED") ? "반려" : "완료")
                    .description(doc.getContent())
                    .fileName("")
                    .fileMeta("")
                    .build());
        }

        List<ApprovalInboxResponse.ApprovalCommentDto> commentDtos = new ArrayList<>();
        for (ApprovalInboxResponse.ApprovalDocumentDto doc : docDtos) {
            List<ApprovalComment> comments = approvalCommentRepository.findByDocumentIdStrOrderByCreatedAtAsc(doc.getId());
            for (ApprovalComment c : comments) {
                commentDtos.add(ApprovalInboxResponse.ApprovalCommentDto.builder()
                        .id(c.getId())
                        .documentId(c.getDocumentIdStr())
                        .initial(c.getEmployee().getName().substring(0, 1))
                        .name(c.getEmployee().getName())
                        .tag("결재자")
                        .time(c.getCreatedAt() != null ? c.getCreatedAt().format(FORMATTER) : "")
                        .content(c.getContent())
                        .avatarTone("purple")
                        .build());
            }
        }

        LocalDateTime now = LocalDateTime.now();
        long processedThisMonth = approvedLines.stream()
                .filter(l -> l.getUpdatedAt() != null
                        && l.getUpdatedAt().getMonth() == now.getMonth()
                        && l.getUpdatedAt().getYear() == now.getYear())
                .count();

        long approvedThisMonth = approvedLines.stream()
                .filter(l -> "APPROVED".equals(l.getStatus())
                        && l.getUpdatedAt() != null
                        && l.getUpdatedAt().getMonth() == now.getMonth()
                        && l.getUpdatedAt().getYear() == now.getYear())
                .count();

        int calculatedApprovalRate = processedThisMonth > 0 ? (int) ((approvedThisMonth * 100) / processedThisMonth) : 0;

        ApprovalInboxResponse.ApprovalSummaryDto summary = ApprovalInboxResponse.ApprovalSummaryDto.builder()
                .totalPending(0)
                .urgentPending(0)
                .dueToday(0)
                .processedThisMonth((int) processedThisMonth)
                .approvalRate(calculatedApprovalRate)
                .build();

        return ApprovalInboxResponse.builder()
                .summary(summary)
                .documents(docDtos)
                .comments(commentDtos)
                .build();
    }

    @Transactional(readOnly = true)
    public ApprovalDraftResponse getDraftApprovals(Long drafterId, String status) {
        List<ApprovalDocument> documents = approvalDocumentRepository.findByDraftedByIdOrderByCreatedAtDesc(drafterId);
        
        int inProgress = 0;
        int rejected = 0;
        int approved = 0;
        int temporary = 0;

        List<ApprovalDraftResponse.DraftDocumentDto> docDtos = new ArrayList<>();
        
        for (ApprovalDocument doc : documents) {
            String currentStatus = doc.getStatus();
            if (currentStatus == null) currentStatus = "IN_PROGRESS";
            String statusLabel;
            switch(currentStatus) {
                case "IN_PROGRESS": statusLabel = "결재중"; inProgress++; break;
                case "REJECTED": statusLabel = "반려"; rejected++; break;
                case "COMPLETED": statusLabel = "결재완료"; approved++; break;
                case "DRAFT": statusLabel = "임시저장"; temporary++; break;
                default: statusLabel = currentStatus;
            }

            // If status filter is applied
            if (status != null && !status.isEmpty() && !"ALL".equalsIgnoreCase(status)) {
                if (!status.equalsIgnoreCase(currentStatus)) {
                    continue;
                }
            }

            String approverName = "";
            String approverInitial = "";
            List<ApprovalLine> lines = approvalLineRepository.findByDocumentIdOrderBySequenceAsc(doc.getId());
            for (ApprovalLine line : lines) {
                if ("WAITING".equals(line.getStatus()) || "PENDING".equals(line.getStatus())) {
                    approverName = line.getApprover().getName() + (line.getApprover().getPosition() != null ? "(" + line.getApprover().getPosition().getName() + ")" : "");
                    approverInitial = line.getApprover().getName().substring(0, 1);
                    break;
                }
            }

            docDtos.add(ApprovalDraftResponse.DraftDocumentDto.builder()
                    .id("DOC-" + doc.getId())
                    .number(doc.getDocNumber() != null ? doc.getDocNumber() : "DOC-" + doc.getId())
                    .title(doc.getTitle())
                    .attachment(approvalAttachmentRepository.findByDocumentId(doc.getId()).isEmpty() ? "" : "첨부파일")
                    .kind(doc.getDocType() != null ? doc.getDocType().getCode() : "approval")
                    .kindLabel(doc.getDocType() != null ? doc.getDocType().getName() : "일반기안")
                    .createdAt(doc.getCreatedAt() != null ? doc.getCreatedAt().format(FORMATTER) : "")
                    .approverInitial(approverInitial)
                    .approver(approverName)
                    .status(currentStatus)
                    .statusLabel(statusLabel)
                    .deadline("")
                    .deadlineWarning(false)
                    .temporary("DRAFT".equals(currentStatus))
                    .build());
        }

        // Add Appointments
        List<Appointment> appts = appointmentRepository.findByEmployeeIdOrderByApplyDateDesc(drafterId);
        for (Appointment appt : appts) {
            String currentStatus = appt.getStatus();
            if (currentStatus == null) currentStatus = "WAITING";
            String statusLabel;
            switch(currentStatus) {
                case "WAITING": statusLabel = "결재중"; inProgress++; break;
                case "REJECTED": statusLabel = "반려"; rejected++; break;
                case "COMPLETED": statusLabel = "결재완료"; approved++; break;
                default: statusLabel = currentStatus;
            }

            if (status != null && !status.isEmpty() && !"ALL".equalsIgnoreCase(status)) {
                if (!status.equalsIgnoreCase(currentStatus)) {
                    continue;
                }
            }

            docDtos.add(ApprovalDraftResponse.DraftDocumentDto.builder()
                    .id("APPT-" + appt.getId())
                    .number("APPT-" + appt.getId())
                    .title(appt.getEmployee().getName() + " 인사발령 기안")
                    .attachment("")
                    .kind("appointment")
                    .kindLabel("인사발령")
                    .createdAt(appt.getCreatedAt() != null ? appt.getCreatedAt().format(FORMATTER) : "")
                    .approverInitial("시")
                    .approver("시스템 관리자")
                    .status(currentStatus)
                    .statusLabel(statusLabel)
                    .deadline("")
                    .deadlineWarning(false)
                    .temporary(false)
                    .build());
        }

        // Sort by createdAt descending
        docDtos.sort((a, b) -> {
            String dateA = a.getCreatedAt() != null ? a.getCreatedAt() : "";
            String dateB = b.getCreatedAt() != null ? b.getCreatedAt() : "";
            return dateB.compareTo(dateA);
        });

        ApprovalDraftResponse.DraftSummaryDto summary = ApprovalDraftResponse.DraftSummaryDto.builder()
                .totalDrafts(documents.size())
                .pendingDrafts(inProgress)
                .approvedThisMonth(approved)
                .rejectedDrafts(rejected)
                .temporaryDrafts(temporary)
                .build();

        ApprovalDraftResponse.DraftTabsDto tabs = ApprovalDraftResponse.DraftTabsDto.builder()
                .inProgress(inProgress)
                .rejected(rejected)
                .approved(approved)
                .temporary(temporary)
                .build();

        return ApprovalDraftResponse.builder()
                .summary(summary)
                .tabs(tabs)
                .documents(docDtos)
                .build();
    }

    private String calculateDDay(LocalDateTime targetDate) {
        if (targetDate == null) return "D-0";
        long days = ChronoUnit.DAYS.between(LocalDateTime.now().toLocalDate(), targetDate.toLocalDate());
        if (days == 0) return "D-0";
        if (days < 0) return "D+" + Math.abs(days);
        return "D-" + days;
    }

    @Transactional
    public void addComment(String documentIdStr, Long authorId, ApprovalCommentCreateRequest request) {
        Employee emp = entityManager.getReference(Employee.class, authorId);
        ApprovalComment comment = ApprovalComment.builder()
                .documentIdStr(documentIdStr)
                .employee(emp)
                .content(request.getContent())
                .build();
        approvalCommentRepository.save(comment);
    }

    @Transactional
    public ApprovalResponse approveDocument(String id, Long approverId) {
        if (id.startsWith("LEAVE-")) {
            Long leaveId = Long.parseLong(id.split("-")[1]);
            LeaveApplication leave = leaveApplicationRepository.findById(leaveId)
                    .orElseThrow(() -> new IllegalArgumentException("휴가신청을 찾을 수 없습니다."));
            leaveService.updateStatus(java.util.List.of(leaveId), "승인완료", leave.getNote());
            // Need to return a mocked response
            return ApprovalResponse.builder().id(leaveId).title("휴가 승인완료").status("COMPLETED").build();
        } else if (id.startsWith("APPT-")) {
            Long apptId = Long.parseLong(id.split("-")[1]);
            Appointment appt = appointmentRepository.findById(apptId)
                    .orElseThrow(() -> new IllegalArgumentException("발령을 찾을 수 없습니다."));
            appt.approve(); // Changes status to COMPLETED
            
            // Check if it's due today or earlier and apply
            appointmentService.applyIfDue(appt);
            
            return ApprovalResponse.builder().id(apptId).title("발령 승인완료").status("COMPLETED").build();
        } else if (id.startsWith("DOC-")) {
            Long docId = Long.parseLong(id.split("-")[1]);
            return approveRegularDocument(docId, approverId);
        }
        throw new IllegalArgumentException("Invalid ID Format");
    }

    @Transactional
    public ApprovalResponse rejectDocument(String id, Long approverId, String reason) {
        if (id.startsWith("LEAVE-")) {
            Long leaveId = Long.parseLong(id.split("-")[1]);
            LeaveApplication leave = leaveApplicationRepository.findById(leaveId)
                    .orElseThrow(() -> new IllegalArgumentException("휴가신청을 찾을 수 없습니다."));
            leaveService.updateStatus(java.util.List.of(leaveId), "반려", reason);
            return ApprovalResponse.builder().id(leaveId).title("휴가 반려완료").status("REJECTED").build();
        } else if (id.startsWith("APPT-")) {
            Long apptId = Long.parseLong(id.split("-")[1]);
            Appointment appt = appointmentRepository.findById(apptId)
                    .orElseThrow(() -> new IllegalArgumentException("발령 정보를 찾을 수 없습니다."));
            appt.reject(reason);
            return ApprovalResponse.builder().id(apptId).title("발령 반려됨").status("REJECTED").build();
        } else if (id.startsWith("DOC-")) {
            Long docId = Long.parseLong(id.split("-")[1]);
            return rejectRegularDocument(docId, approverId, reason);
        }
        throw new IllegalArgumentException("Invalid ID Format");
    }

    private ApprovalResponse approveRegularDocument(Long documentId, Long approverId) {
        ApprovalDocument document = approvalDocumentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다."));
        
        List<ApprovalLine> lines = approvalLineRepository.findByDocumentIdOrderBySequenceAsc(documentId);
        
        ApprovalLine currentLine = lines.stream()
                .filter(line -> line.getApprover().getId().equals(approverId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("해당 문서의 결재자가 아닙니다."));

        if (!"WAITING".equals(currentLine.getStatus())) {
            throw new IllegalStateException("현재 결재할 차례가 아닙니다.");
        }

        currentLine.approve(); // JPA 더티 체킹

        int nextSequenceIndex = lines.indexOf(currentLine) + 1;
        if (nextSequenceIndex < lines.size()) {
            ApprovalLine nextLine = lines.get(nextSequenceIndex);
            nextLine.markAsWaiting();
        } else {
            document.updateStatus("COMPLETED");

            // 휴가 신청서일 경우 LeaveService 연동
            if ("DOC_VACATION".equals(document.getDocType().getCode())) {
                try {
                    JsonParser parser = JsonParserFactory.getJsonParser();
                    Map<String, Object> map = parser.parseMap(document.getContent());
                    String leaveType = map.containsKey("leaveType") ? map.get("leaveType").toString() : "연차";
                    LocalDate startDate = LocalDate.parse(map.get("startDate").toString());
                    LocalDate endDate = LocalDate.parse(map.get("endDate").toString());
                    double days = map.containsKey("days") ? Double.parseDouble(map.get("days").toString()) : 1.0;
                    String reason = map.containsKey("reason") ? map.get("reason").toString() : "전자결재 승인 휴가";

                    leaveService.createApprovedLeaveFromApproval(document.getDraftedBy().getId(), leaveType, startDate, endDate, days, reason);
                } catch (Exception e) {
                    log.error("휴가 데이터 파싱 및 연동 실패: {}", e.getMessage());
                }
            } 
            // 경조사비 신청서일 경우 PayrollService 연동
            else if ("DOC_WELFARE".equals(document.getDocType().getCode())) {
                try {
                    JsonParser parser = JsonParserFactory.getJsonParser();
                    Map<String, Object> map = parser.parseMap(document.getContent());
                    if (map.containsKey("welfareAmount")) {
                        BigDecimal amount = new BigDecimal(map.get("welfareAmount").toString());
                        payrollService.addApprovalAllowance(document.getDraftedBy().getId(), "경조사비 (결재)", amount);
                        log.info("경조사비 {}원이 {}번 직원에게 지급 예약되었습니다.", amount, document.getDraftedBy().getId());
                    }
                } catch (Exception e) {
                    log.error("경조사비 데이터 파싱 및 급여 연동 실패: {}", e.getMessage());
                }
            }
        }

        return mapToResponse(document);
    }

    private ApprovalResponse rejectRegularDocument(Long documentId, Long approverId, String reason) {
        ApprovalDocument document = approvalDocumentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다."));

        ApprovalLine currentLine = approvalLineRepository.findByDocumentIdAndApproverId(documentId, approverId)
                .orElseThrow(() -> new IllegalArgumentException("해당 문서의 결재자가 아닙니다."));

        if (!"WAITING".equals(currentLine.getStatus())) {
            throw new IllegalStateException("현재 결재할 차례가 아닙니다.");
        }

        currentLine.reject(reason);
        document.updateStatus("REJECTED");

        return mapToResponse(document);
    }

    // Other original methods (createDocument, getApprovalDetail, deleteDocument, updateDocument) ...

    @Transactional
    public ApprovalResponse createDocument(Long drafterId, ApprovalCreateRequest request) {
        Employee drafter = entityManager.getReference(Employee.class, drafterId);
        CommonCode docType = entityManager.getReference(CommonCode.class, request.getDocTypeCode());

        String docNumber = "APP-" + LocalDateTime.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        ApprovalDocument document = ApprovalDocument.builder()
                .docNumber(docNumber)
                .title(request.getTitle())
                .docType(docType)
                .content(request.getContent())
                .draftedBy(drafter)
                .status("IN_PROGRESS")
                .build();
        ApprovalDocument savedDocument = approvalDocumentRepository.save(document);

        List<ApprovalLine> lines = new ArrayList<>();
        List<Long> approverIds = request.getApproverIds();
        for (int i = 0; i < approverIds.size(); i++) {
            Employee approver = entityManager.getReference(Employee.class, approverIds.get(i));
            String initialStatus = (i == 0) ? "WAITING" : "PENDING";
            ApprovalLine line = ApprovalLine.builder()
                    .document(savedDocument)
                    .sequence(i + 1)
                    .approver(approver)
                    .status(initialStatus)
                    .build();
            lines.add(line);
        }
        approvalLineRepository.saveAll(lines);

        if (request.getAttachmentFileNames() != null) {
            List<ApprovalAttachment> attachments = request.getAttachmentFileNames().stream()
                    .map(fileName -> ApprovalAttachment.builder()
                            .document(savedDocument)
                            .fileName(fileName)
                            .filePath("/mock-storage/" + fileName)
                            .fileSizeKb(1024)
                            .build())
                    .collect(Collectors.toList());
            approvalAttachmentRepository.saveAll(attachments);
        }
        return mapToResponse(savedDocument);
    }

    @Transactional(readOnly = true)
    public ApprovalDetailResponse getApprovalDetail(String id) {
        if (id.startsWith("APPT-")) {
            Long apptId = Long.parseLong(id.split("-")[1]);
            Appointment appt = appointmentRepository.findById(apptId)
                    .orElseThrow(() -> new IllegalArgumentException("발령 정보를 찾을 수 없습니다."));

            String contentHtml = String.format("<p><strong>발령일:</strong> %s</p><p><strong>발령유형:</strong> %s</p><p><strong>부서변경:</strong> %s -> %s</p>",
                    appt.getApplyDate(),
                    appt.getAppointmentType() != null ? appt.getAppointmentType().getName() : "",
                    appt.getBeforeDepartment() != null ? appt.getBeforeDepartment().getName() : "-",
                    appt.getAfterDepartment() != null ? appt.getAfterDepartment().getName() : "-");

            ApprovalResponse docResponse = ApprovalResponse.builder()
                    .id(apptId)
                    .title(appt.getEmployee().getName() + " 인사발령 기안")
                    .status(appt.getStatus() != null ? appt.getStatus() : "WAITING")
                    .docNumber("APPT-" + apptId)
                    .build();

            return ApprovalDetailResponse.builder()
                    .document(docResponse)
                    .content(contentHtml)
                    .approvalLines(new ArrayList<>())
                    .attachments(new ArrayList<>())
                    .build();
        }

        Long documentId;
        if (id.startsWith("DOC-")) {
            documentId = Long.parseLong(id.split("-")[1]);
        } else {
            // fallback if someone just passes the ID without prefix (though frontend will pass DOC- / APPT-)
            documentId = Long.parseLong(id);
        }

        ApprovalDocument document = approvalDocumentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다."));
        List<ApprovalLine> lines = approvalLineRepository.findByDocumentIdOrderBySequenceAsc(documentId);
        List<ApprovalAttachment> attachments = approvalAttachmentRepository.findByDocumentId(documentId);

        List<ApprovalLineResponse> lineResponses = lines.stream().map(line ->
                ApprovalLineResponse.builder()
                        .id(line.getId())
                        .sequence(line.getSequence())
                        .approverName(line.getApprover().getName())
                        .status(line.getStatus())
                        .approvedAt(line.getApprovedAt())
                        .rejectReason(line.getRejectReason())
                        .build()
        ).collect(Collectors.toList());

        List<ApprovalAttachmentResponse> attachmentResponses = attachments.stream().map(att ->
                ApprovalAttachmentResponse.builder()
                        .id(att.getId())
                        .fileName(att.getFileName())
                        .filePath(att.getFilePath())
                        .fileSizeKb(att.getFileSizeKb())
                        .build()
        ).collect(Collectors.toList());

        return ApprovalDetailResponse.builder()
                .document(mapToResponse(document))
                .content(document.getContent())
                .approvalLines(lineResponses)
                .attachments(attachmentResponses)
                .build();
    }

    @Transactional
    public void deleteDocument(Long documentId, Long requesterId) {
        ApprovalDocument document = approvalDocumentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다."));

        if (!document.getDraftedBy().getId().equals(requesterId)) {
            throw new IllegalStateException("기안자 본인만 문서를 삭제할 수 있습니다.");
        }

        if ("COMPLETED".equals(document.getStatus())) {
            throw new IllegalStateException("이미 최종 승인 완료된 문서는 삭제할 수 없습니다.");
        }
        if ("REJECTED".equals(document.getStatus())) {
            throw new IllegalStateException("반려된 문서는 삭제할 수 없습니다. (데이터 보존)");
        }

        approvalLineRepository.deleteByDocumentId(documentId);
        approvalAttachmentRepository.deleteByDocumentId(documentId);
        approvalDocumentRepository.delete(document);
    }

    @Transactional
    public ApprovalResponse updateDocument(Long documentId, Long drafterId, ApprovalUpdateRequest request) {
        ApprovalDocument document = approvalDocumentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다."));

        if (!document.getDraftedBy().getId().equals(drafterId)) {
            throw new IllegalStateException("기안자 본인만 문서를 수정할 수 있습니다.");
        }

        if ("REJECTED".equals(document.getStatus())) {
            throw new IllegalStateException("반려된 문서는 수정할 수 없습니다.");
        }
        if ("COMPLETED".equals(document.getStatus())) {
            throw new IllegalStateException("결재가 완료된 문서는 수정할 수 없습니다.");
        }

        List<ApprovalLine> lines = approvalLineRepository.findByDocumentIdOrderBySequenceAsc(documentId);
        if (!lines.isEmpty() && "APPROVED".equals(lines.get(0).getStatus())) {
            throw new IllegalStateException("이미 결재가 진행된 문서는 수정할 수 없습니다.");
        }

        document.updateDocument(request.getTitle(), request.getContent());
        return mapToResponse(document);
    }

    private ApprovalResponse mapToResponse(ApprovalDocument doc) {
        return ApprovalResponse.builder()
                .id(doc.getId())
                .docNumber(doc.getDocNumber())
                .title(doc.getTitle())
                .docTypeName(doc.getDocType().getName())
                .draftedByName(doc.getDraftedBy().getName())
                .status(doc.getStatus())
                .createdAt(doc.getCreatedAt())
                .build();
    }
}
