package com.tphr.hr.leave.service;

import com.tphr.hr.employee.entity.Employee;
import com.tphr.hr.employee.repository.EmployeeRepository;
import com.tphr.hr.leave.dto.*;
import com.tphr.hr.leave.entity.EmployeeLeaveQuota;
import com.tphr.hr.leave.entity.LeaveApplication;
import com.tphr.hr.leave.repository.EmployeeLeaveQuotaRepository;
import com.tphr.hr.leave.repository.LeaveApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LeaveService {

    private final LeaveApplicationRepository leaveRepository;
    private final EmployeeLeaveQuotaRepository quotaRepository;
    private final EmployeeRepository employeeRepository;

    private static final String UPLOAD_DIR = "uploads/leave/";

    /**
     * 날짜 범위 계산 유틸리티
     */
    private LocalDate[] getDateRange(Integer year, Integer month) {
        int targetYear = (year != null && year > 1900) ? year : LocalDate.now().getYear();
        LocalDate startDate;
        LocalDate endDate;
        if (month != null && month >= 1 && month <= 12) {
            YearMonth ym = YearMonth.of(targetYear, month);
            startDate = ym.atDay(1);
            endDate = ym.atEndOfMonth();
        } else {
            startDate = LocalDate.of(targetYear, 1, 1);
            endDate = LocalDate.of(targetYear, 12, 31);
        }
        return new LocalDate[]{startDate, endDate};
    }

    /**
     * 1. 상단 KPI 카드 및 우측 사이드 패널 위젯 통계 실시간 DB 연산 (하드코딩 완전 제거)
     */
    public LeaveSummaryResponse getLeaveSummary(Integer year, Integer month, Long departmentId) {
        int targetYear = (year != null && year > 1900) ? year : LocalDate.now().getYear();
        LocalDate[] dates = getDateRange(year, month);

        // 해당 년도 DB 연차 대장 실시간 합산
        List<EmployeeLeaveQuota> quotas = quotaRepository.findByYear(targetYear);
        if (departmentId != null) {
            quotas = quotas.stream().filter(q -> q.getEmployee().getDepartment() != null 
                    && q.getEmployee().getDepartment().getId().equals(departmentId)).collect(Collectors.toList());
        }

        double totalAllocated = quotas.stream().mapToDouble(EmployeeLeaveQuota::getTotalDays).sum();
        double totalUsed = quotas.stream().mapToDouble(EmployeeLeaveQuota::getUsedDays).sum();
        double totalRemaining = quotas.stream().mapToDouble(EmployeeLeaveQuota::getRemainingDays).sum();
        double percentage = totalAllocated > 0 ? Math.round((totalUsed / totalAllocated * 100.0) * 10.0) / 10.0 : 0.0;

        // 해당 기간(연/월) 실제 휴가 신청 목록 조회
        List<LeaveApplication> apps = leaveRepository.findWithFilters(dates[0], dates[1], null, null, null);
        long monthApplications = apps.size();
        long realPendingCount = apps.stream().filter(a -> "승인대기".equals(a.getStatus())).count();

        // 고위험군 (잔여 연차 5일 이하 사원 오름차순 조회)
        List<EmployeeLeaveQuota> riskQuotas = quotas.stream()
                .filter(q -> q.getRemainingDays() <= 5.0)
                .sorted(Comparator.comparingDouble(EmployeeLeaveQuota::getRemainingDays))
                .collect(Collectors.toList());

        List<LeaveSummaryResponse.RiskEmployeeDto> riskEmployees = riskQuotas.stream().limit(5).map(q -> {
            String name = q.getEmployee().getName();
            String initial = name != null && name.length() > 0 ? name.substring(0, 1) : "사";
            String dept = q.getEmployee().getDepartment() != null ? q.getEmployee().getDepartment().getName() : "부서없음";
            double rem = q.getRemainingDays();
            String tone = rem <= 2.0 ? "red" : "orange";
            String tagStyle = rem <= 2.0 ? "riskOne" : "riskTwo";

            return LeaveSummaryResponse.RiskEmployeeDto.builder()
                    .employeeId(q.getEmployee().getId())
                    .name(name)
                    .initial(initial)
                    .department(dept)
                    .remainingDays(rem)
                    .tone(tone)
                    .tagStyle(tagStyle)
                    .build();
        }).collect(Collectors.toList());

        // 유형별 통계 (실제 DB 신청 내역 기반 동적 계산)
        long annualCount = apps.stream().filter(a -> a.getLeaveType().contains("연차")).count();
        long halfCount = apps.stream().filter(a -> a.getLeaveType().contains("반차")).count();
        long sickCount = apps.stream().filter(a -> a.getLeaveType().contains("병가")).count();
        long otherCount = apps.stream().filter(a -> a.getLeaveType().contains("기타")).count();
        long totalAppCount = apps.size();

        double annualPct = totalAppCount > 0 ? Math.round((annualCount * 1000.0 / totalAppCount)) / 10.0 : 0.0;
        double halfPct = totalAppCount > 0 ? Math.round((halfCount * 1000.0 / totalAppCount)) / 10.0 : 0.0;
        double sickPct = totalAppCount > 0 ? Math.round((sickCount * 1000.0 / totalAppCount)) / 10.0 : 0.0;
        double otherPct = totalAppCount > 0 ? Math.round((otherCount * 1000.0 / totalAppCount)) / 10.0 : 0.0;

        List<LeaveSummaryResponse.TypeStatDto> typeStats = List.of(
            LeaveSummaryResponse.TypeStatDto.builder().type("연차").count(annualCount).percentage(annualPct).build(),
            LeaveSummaryResponse.TypeStatDto.builder().type("반차").count(halfCount).percentage(halfPct).build(),
            LeaveSummaryResponse.TypeStatDto.builder().type("병가").count(sickCount).percentage(sickPct).build(),
            LeaveSummaryResponse.TypeStatDto.builder().type("기타").count(otherCount).percentage(otherPct).build()
        );

        return LeaveSummaryResponse.builder()
                .totalAllocatedDays(totalAllocated)
                .totalUsedDays(totalUsed)
                .usedPercentage(percentage)
                .totalRemainingDays(totalRemaining)
                .thisMonthApplications(monthApplications)
                .pendingApplications(realPendingCount)
                .riskEmployeeCount((long) riskQuotas.size())
                .typeStats(typeStats)
                .riskEmployees(riskEmployees)
                .build();
    }

    /**
     * 2. 휴가 신청 현황 목록 조회 (연도/월 날짜 범위 및 검색어, 상태, 유형 필터링 적용)
     */
    public List<LeaveApplicationResponse> getApplications(Integer year, Integer month, String status, String type, String keyword) {
        LocalDate[] dates = getDateRange(year, month);
        List<LeaveApplication> list = leaveRepository.findWithFilters(dates[0], dates[1], status, type, keyword);
        return list.stream().map(LeaveApplicationResponse::from).collect(Collectors.toList());
    }

    /**
     * 3. 사원별 연차 할당 대장 조회 (없을 경우 15일 기본 할당 자동 생성)
     */
    @Transactional
    public EmployeeQuotaResponse getEmployeeQuota(Long employeeId, Integer year) {
        int targetYear = (year != null) ? year : LocalDate.now().getYear();
        EmployeeLeaveQuota quota = quotaRepository.findByEmployeeIdAndYear(employeeId, targetYear)
                .orElseGet(() -> {
                    Employee emp = employeeRepository.findById(employeeId)
                            .orElseThrow(() -> new IllegalArgumentException("해당 사원을 찾을 수 없습니다: " + employeeId));
                    EmployeeLeaveQuota newQuota = EmployeeLeaveQuota.builder()
                            .employee(emp)
                            .year(targetYear)
                            .totalDays(15.0)
                            .usedDays(0.0)
                            .remainingDays(15.0)
                            .build();
                    return quotaRepository.save(newQuota);
                });
        return EmployeeQuotaResponse.from(quota);
    }

    /**
     * 4. 신규 휴가 등록 (첨부파일 물리 보관 및 잔여일 연산 텍스트 생성)
     */
    @Transactional
    public LeaveApplicationResponse createApplication(Long employeeId, String leaveType, LocalDate startDate, LocalDate endDate,
                                                    Double days, String proxyName, String approverName, String note, MultipartFile file) {
        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("해당 사원이 존재하지 않습니다: " + employeeId));

        String attachPath = null;
        String attachName = null;
        if (file != null && !file.isEmpty()) {
            try {
                Path dir = Paths.get(UPLOAD_DIR);
                if (!Files.exists(dir)) {
                    Files.createDirectories(dir);
                }
                String uuidName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Path filePath = dir.resolve(uuidName);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                attachPath = filePath.toString();
                attachName = file.getOriginalFilename();
            } catch (IOException e) {
                log.error("첨부파일 저장 실패: {}", e.getMessage(), e);
                throw new RuntimeException("첨부파일 저장 중 오류가 발생했습니다.");
            }
        }

        int curYear = startDate.getYear();
        EmployeeQuotaResponse quota = getEmployeeQuota(employeeId, curYear);
        double oldRem = quota.getRemainingDays();
        double newRem = Math.round((oldRem - days) * 100.0) / 100.0;

        String remText;
        String remType = "normal";
        if ("병가".equals(leaveType)) {
            remText = "진단서 첨부";
            remType = "doc";
        } else if (newRem < 0) {
            remText = String.format((oldRem == Math.floor(oldRem) ? "%.0f일" : "%.1f일") + " → " + (newRem == Math.floor(newRem) ? "%.0f일!" : "%.1f일!"), oldRem, newRem);
            remType = "danger";
        } else {
            remText = String.format((oldRem == Math.floor(oldRem) ? "%.0f일" : "%.1f일") + " → " + (newRem == Math.floor(newRem) ? "%.0f일" : "%.1f일"), oldRem, newRem);
            remType = "normal";
        }

        LeaveApplication app = LeaveApplication.builder()
                .employee(emp)
                .leaveType(leaveType)
                .startDate(startDate)
                .endDate(endDate)
                .days(days)
                .proxyEmployeeName(proxyName)
                .approverName(approverName != null ? approverName : "김관리")
                .status("승인대기")
                .note(note != null ? note : "")
                .remainText(remText)
                .remainType(remType)
                .attachmentPath(attachPath)
                .attachmentName(attachName)
                .build();

        LeaveApplication saved = leaveRepository.save(app);
        return LeaveApplicationResponse.from(saved);
    }

    /**
     * 5. 결재 상태 일괄 처리 (승인 시 잔여 연차 자동 차감 트랜잭션 동기화)
     */
    @Transactional
    public void updateStatus(List<Long> ids, String targetStatus, String note) {
        for (Long id : ids) {
            LeaveApplication app = leaveRepository.findById(id).orElse(null);
            if (app != null) {
                String oldStatus = app.getStatus();
                String newStatus = ("APPROVED".equalsIgnoreCase(targetStatus) || "승인완료".equals(targetStatus)) ? "승인완료" :
                                   ("REJECTED".equalsIgnoreCase(targetStatus) || "반려".equals(targetStatus)) ? "반려" : "승인대기";
                
                app.changeStatus(newStatus, note);

                // 승인완료로 변경되는 경우 즉시 연차 차감
                if (!"승인완료".equals(oldStatus) && "승인완료".equals(newStatus) && !app.getLeaveType().equals("병가") && !app.getLeaveType().equals("기타")) {
                    EmployeeLeaveQuota quota = quotaRepository.findByEmployeeIdAndYear(app.getEmployee().getId(), app.getStartDate().getYear()).orElse(null);
                    if (quota != null) {
                        quota.deductDays(app.getDays());
                    }
                }
                // 승인완료 상태에서 대기나 반려로 변경 시 차감된 연차 복원
                else if ("승인완료".equals(oldStatus) && !"승인완료".equals(newStatus) && !app.getLeaveType().equals("병가") && !app.getLeaveType().equals("기타")) {
                    EmployeeLeaveQuota quota = quotaRepository.findByEmployeeIdAndYear(app.getEmployee().getId(), app.getStartDate().getYear()).orElse(null);
                    if (quota != null) {
                        quota.restoreDays(app.getDays());
                    }
                }
            }
        }
    }

    /**
     * 6. 휴가 신청 단건 삭제 및 파일 물리 삭제 (Event-Driven Cleanup)
     */
    @Transactional
    public void deleteApplication(Long id) {
        LeaveApplication app = leaveRepository.findById(id).orElse(null);
        if (app != null) {
            if (app.getAttachmentPath() != null && !app.getAttachmentPath().isEmpty()) {
                try {
                    Files.deleteIfExists(Paths.get(app.getAttachmentPath()));
                    log.info("파일 즉시 삭제 완료: {}", app.getAttachmentPath());
                } catch (IOException e) {
                    log.warn("파일 삭제 실패: {}", e.getMessage());
                }
            }
            leaveRepository.delete(app);
        }
    }

    /**
     * 7. 매주 일요일 밤 2시 고아 파일 자동 청소 스케줄러 (Garbage Collection)
     */
    @Scheduled(cron = "0 0 2 * * SUN")
    @Transactional
    public void cleanOrphanAttachments() {
        log.info("=== 고아 첨부파일 자동 정리 스케줄러 가동 ===");
        try {
            Path dir = Paths.get(UPLOAD_DIR);
            if (!Files.exists(dir)) return;

            Set<String> dbFilePaths = leaveRepository.findByAttachmentPathIsNotNull()
                    .stream()
                    .map(LeaveApplication::getAttachmentPath)
                    .map(p -> Paths.get(p).toAbsolutePath().toString())
                    .collect(Collectors.toSet());

            try (Stream<Path> files = Files.list(dir)) {
                files.forEach(path -> {
                    String absPath = path.toAbsolutePath().toString();
                    if (!dbFilePaths.contains(absPath)) {
                        try {
                            Files.deleteIfExists(path);
                            log.info("고아 더미 파일 삭제됨: {}", absPath);
                        } catch (IOException e) {
                            log.warn("고아 파일 삭제 오류: {}", e.getMessage());
                        }
                    }
                });
            }
        } catch (Exception e) {
            log.error("자동 파일 클린업 중 예외 발생: {}", e.getMessage(), e);
        }
    }

    /**
     * 8. 서버 사이드 엑셀(CSV) 고급 감사 보고서 스트림 생성 (UTF-8 BOM 첨부)
     */
    public byte[] generateLeaveReportCsv(Integer year, Integer month, String status, String type, String keyword) {
        LocalDate[] dates = getDateRange(year, month);
        List<LeaveApplication> apps = leaveRepository.findWithFilters(dates[0], dates[1], status, type, keyword);
        LeaveSummaryResponse summary = getLeaveSummary(year, month, null);

        StringBuilder sb = new StringBuilder();
        // UTF-8 BOM 표시 (엑셀 한글 깨짐 원천 차단)
        sb.append("\uFEFF");
        sb.append("[TP-HR 인사관리 그룹] 휴가 및 연차 사용 현황 감사 보고서\n");
        sb.append("조회 기준 기간,").append(year != null ? year + "년 " : "전체 연도 ").append(month != null ? month + "월" : "전체 월").append("\n");
        sb.append("보고서 생성 일시,").append(LocalDate.now().format(DateTimeFormatter.ISO_DATE)).append("\n\n");

        // KPI 통계 섹션
        sb.append("== [종합 연차 KPI 현황] ==\n");
        sb.append("전체 부여 연차,사용 연차,소진율,잔여 연차,기간 내 신청건수,승인 대기건수,소진 위험 직원수\n");
        sb.append(summary.getTotalAllocatedDays()).append("일,")
          .append(summary.getTotalUsedDays()).append("일,")
          .append(summary.getUsedPercentage()).append("%,")
          .append(summary.getTotalRemainingDays()).append("일,")
          .append(summary.getThisMonthApplications()).append("건,")
          .append(summary.getPendingApplications()).append("건,")
          .append(summary.getRiskEmployeeCount()).append("명\n\n");

        // 상세 신청 내역 테이블 섹션
        sb.append("== [상세 휴가 신청 및 결재 내역] ==\n");
        sb.append("번호,사원번호,직원명,부서,휴가유형,신청기간,일수,잔여연차변동,대리인,승인권자,결재상태,첨부파일,비고\n");

        int idx = 1;
        for (LeaveApplication app : apps) {
            String empNo = app.getEmployee().getEmpNo() != null ? app.getEmployee().getEmpNo() : "-";
            String name = app.getEmployee().getName() != null ? app.getEmployee().getName() : "-";
            String dept = app.getEmployee().getDepartment() != null ? app.getEmployee().getDepartment().getName() : "-";
            String period = app.getStartDate().toString() + (app.getStartDate().equals(app.getEndDate()) ? "" : " ~ " + app.getEndDate().toString());
            String attach = app.getAttachmentName() != null ? app.getAttachmentName() : "없음";
            String noteStr = app.getNote() != null ? app.getNote().replace(",", " ") : "";

            sb.append(idx++).append(",")
              .append("\"").append(empNo).append("\",")
              .append("\"").append(name).append("\",")
              .append("\"").append(dept).append("\",")
              .append("\"").append(app.getLeaveType()).append("\",")
              .append("\"").append(period).append("\",")
              .append(app.getDays()).append("일,")
              .append("\"").append(app.getRemainText() != null ? app.getRemainText() : "-").append("\",")
              .append("\"").append(app.getProxyEmployeeName() != null ? app.getProxyEmployeeName() : "-").append("\",")
              .append("\"").append(app.getApproverName() != null ? app.getApproverName() : "-").append("\",")
              .append("\"").append(app.getStatus()).append("\",")
              .append("\"").append(attach).append("\",")
              .append("\"").append(noteStr).append("\"\n");
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }
}
