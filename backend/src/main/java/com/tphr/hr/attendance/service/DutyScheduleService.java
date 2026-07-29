package com.tphr.hr.attendance.service;

import com.tphr.hr.attendance.dto.DutyScheduleCreateRequest;
import com.tphr.hr.attendance.dto.DutyScheduleEntryRequest;
import com.tphr.hr.attendance.dto.DutyScheduleEntryResponse;
import com.tphr.hr.attendance.dto.DutyScheduleResponse;
import com.tphr.hr.attendance.entity.DutySchedule;
import com.tphr.hr.attendance.entity.DutyScheduleEntry;
import com.tphr.hr.attendance.repository.DutyScheduleEntryRepository;
import com.tphr.hr.attendance.repository.DutyScheduleRepository;
import com.tphr.hr.employee.entity.Department;
import com.tphr.hr.employee.entity.Employee;
import com.tphr.hr.employee.repository.DepartmentRepository;
import com.tphr.hr.employee.repository.EmployeeRepository;
import com.tphr.hr.system.entity.CommonCode;
import com.tphr.hr.system.entity.Menu;
import com.tphr.hr.system.entity.RolePermission;
import com.tphr.hr.system.repository.CommonCodeRepository;
import com.tphr.hr.system.repository.MenuRepository;
import com.tphr.hr.system.repository.RolePermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DutyScheduleService {

    private final DutyScheduleRepository dutyScheduleRepository;
    private final DutyScheduleEntryRepository dutyScheduleEntryRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final CommonCodeRepository commonCodeRepository;
    private final com.tphr.hr.employee.repository.EmploymentHistoryRepository employmentHistoryRepository;
    
    // 권한 검증용
    private final MenuRepository menuRepository;
    private final RolePermissionRepository rolePermissionRepository;

    private void validateWritePermission(Long requesterId) {
        Employee requester = employeeRepository.findById(requesterId)
                .orElseThrow(() -> new IllegalArgumentException("요청자를 찾을 수 없습니다."));

        if (requester.getRoleGroup() == null) {
            throw new IllegalStateException("권한 그룹이 설정되지 않은 사용자입니다.");
        }

        Menu dutyMenu = menuRepository.findByMenuCode("DUTY_SCHEDULE")
                .orElseThrow(() -> new IllegalStateException("시스템 오류: DUTY_SCHEDULE 메뉴가 존재하지 않습니다."));

        RolePermission permission = rolePermissionRepository.findByRoleGroupIdAndMenuId(requester.getRoleGroup().getId(), dutyMenu.getId())
                .orElseThrow(() -> new IllegalStateException("해당 메뉴에 대한 권한 설정이 없습니다. (403 Forbidden)"));

        if (!permission.getCanWrite()) {
            throw new IllegalStateException("듀티표 작성/수정 권한이 없습니다. (403 Forbidden)");
        }
    }

    @Transactional
    public DutyScheduleResponse createDutySchedule(DutyScheduleCreateRequest request) {
        validateWritePermission(request.getRequesterId());

        if (dutyScheduleRepository.findByDepartmentIdAndScheduleYearAndScheduleMonth(
                request.getDepartmentId(), request.getScheduleYear(), request.getScheduleMonth()).isPresent()) {
            throw new IllegalStateException("해당 월의 듀티표가 이미 존재합니다.");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new IllegalArgumentException("부서를 찾을 수 없습니다."));

        DutySchedule schedule = DutySchedule.builder()
                .department(department)
                .scheduleYear(request.getScheduleYear())
                .scheduleMonth(request.getScheduleMonth())
                .status("DRAFT")
                .build();

        DutySchedule saved = dutyScheduleRepository.save(schedule);
        return mapToResponse(saved, List.of(), null);
    }

    @Transactional
    public DutyScheduleResponse assignEntries(Long scheduleId, List<DutyScheduleEntryRequest> requests, Long requesterId) {
        validateWritePermission(requesterId);

        DutySchedule schedule = dutyScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("듀티표를 찾을 수 없습니다."));

        // 기존 항목 모두 삭제 후 새로 삽입 (단순화된 bulk-replace 로직)
        dutyScheduleEntryRepository.deleteByDutyScheduleId(scheduleId);

        List<DutyScheduleEntry> newEntries = requests.stream().map(req -> {
            Employee emp = employeeRepository.findById(req.getEmployeeId())
                    .orElseThrow(() -> new IllegalArgumentException("직원을 찾을 수 없습니다."));
            CommonCode shiftCode = commonCodeRepository.findById(req.getShiftTypeCode())
                    .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 근무 형태입니다: " + req.getShiftTypeCode()));

            return DutyScheduleEntry.builder()
                    .dutySchedule(schedule)
                    .employee(emp)
                    .workDate(req.getWorkDate())
                    .shiftType(shiftCode)
                    .build();
        }).collect(Collectors.toList());

        List<DutyScheduleEntry> savedEntries = dutyScheduleEntryRepository.saveAll(newEntries);
        return mapToResponse(schedule, savedEntries, null);
    }

    @Transactional
    public DutyScheduleResponse confirmDutySchedule(Long scheduleId, Long requesterId) {
        validateWritePermission(requesterId);

        DutySchedule schedule = dutyScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("듀티표를 찾을 수 없습니다."));

        schedule.setStatus("CONFIRMED");
        DutySchedule saved = dutyScheduleRepository.save(schedule);
        return mapToResponse(saved, dutyScheduleEntryRepository.findByDutyScheduleId(scheduleId), null);
    }

    @Transactional(readOnly = true)
    public DutyScheduleResponse getDutySchedule(Long departmentId, Integer year, Integer month) {
        DutySchedule schedule = dutyScheduleRepository.findByDepartmentIdAndScheduleYearAndScheduleMonth(departmentId, year, month)
                .orElseThrow(() -> new IllegalArgumentException("해당 부서의 특정 월 듀티표가 존재하지 않습니다."));
        
        List<DutyScheduleEntry> entries = dutyScheduleEntryRepository.findByDutyScheduleId(schedule.getId());
        return mapToResponse(schedule, entries, null);
    }

    @Transactional
    public DutyScheduleResponse autoGenerate(Long scheduleId, com.tphr.hr.attendance.dto.DutyScheduleAutoGenerateRequest request) {
        validateWritePermission(request.getRequesterId());

        DutySchedule schedule = dutyScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("듀티표를 찾을 수 없습니다."));

        // 1. 해당 부서의 교대근무자 조회
        List<Employee> allShiftWorkers = employeeRepository.findAll().stream()
                .filter(e -> e.getDepartment() != null && e.getDepartment().getId().equals(schedule.getDepartment().getId()))
                .filter(Employee::getIsShiftWorker)
                .collect(Collectors.toList());

        // 2. 휴직/퇴직자 배제 로직 (V8 스크립트로 추가된 STS_LEAVE, STS_RETIRE 체크)
        java.time.LocalDate monthStart = java.time.LocalDate.of(schedule.getScheduleYear(), schedule.getScheduleMonth(), 1);
        java.time.LocalDate monthEnd = monthStart.withDayOfMonth(monthStart.lengthOfMonth());
        
        List<Long> allWorkerIds = allShiftWorkers.stream().map(Employee::getId).collect(Collectors.toList());
        
        List<Long> excludedEmployeeIds = java.util.Collections.emptyList();
        if (!allWorkerIds.isEmpty()) {
            List<com.tphr.hr.employee.entity.EmploymentHistory> leaves = employmentHistoryRepository.findOverlappingLeavesForEmployees(allWorkerIds, monthStart, monthEnd);
            excludedEmployeeIds = leaves.stream().map(h -> h.getEmployee().getId()).distinct().collect(Collectors.toList());
        }

        final List<Long> finalExcluded = excludedEmployeeIds;
        List<Employee> activeWorkers = allShiftWorkers.stream()
                .filter(e -> !finalExcluded.contains(e.getId()))
                .collect(Collectors.toList());

        // 3. 자동 생성 알고리즘 초기화
        dutyScheduleEntryRepository.deleteByDutyScheduleId(scheduleId);
        List<DutyScheduleEntry> newEntries = new java.util.ArrayList<>();
        List<String> warnings = new java.util.ArrayList<>();

        CommonCode shiftD = commonCodeRepository.findById("D").orElseGet(() -> CommonCode.builder().code("D").name("데이").build());
        CommonCode shiftE = commonCodeRepository.findById("E").orElseGet(() -> CommonCode.builder().code("E").name("이브닝").build());
        CommonCode shiftN = commonCodeRepository.findById("N").orElseGet(() -> CommonCode.builder().code("N").name("나이트").build());
        CommonCode shiftOFF = commonCodeRepository.findById("OFF").orElseGet(() -> CommonCode.builder().code("OFF").name("오프").build());

        java.util.Map<Long, Integer> nightCounts = new java.util.HashMap<>();
        java.util.Map<Long, Integer> consecutiveNightCounts = new java.util.HashMap<>();
        java.util.Map<Long, String> yesterdayShifts = new java.util.HashMap<>();

        activeWorkers.forEach(w -> {
            nightCounts.put(w.getId(), 0);
            consecutiveNightCounts.put(w.getId(), 0);
            yesterdayShifts.put(w.getId(), "OFF");
        });

        // 4. 알고리즘: 각 일자별로 D, E, N 할당
        for (int day = 1; day <= monthEnd.getDayOfMonth(); day++) {
            java.time.LocalDate currentDate = monthStart.withDayOfMonth(day);
            java.util.List<Employee> availableForDay = new java.util.ArrayList<>(activeWorkers);
            java.util.Collections.shuffle(availableForDay); // 매일 공평한 랜덤 배분

            int dCount = 0, eCount = 0, nCount = 0;

            for (Employee emp : availableForDay) {
                Long empId = emp.getId();
                String yesterdayShift = yesterdayShifts.get(empId);
                int currentConsecutiveN = consecutiveNightCounts.get(empId);
                int currentTotalN = nightCounts.get(empId);

                CommonCode assignedShift = shiftOFF;

                // 시니어 강제 배정 (requireSenior = true일 경우 1급 이상 또는 수간호사 먼저 배정)
                boolean isSenior = "POS_01".equals(emp.getPosition().getCode()) || "POS_02".equals(emp.getPosition().getCode()) || "POS_03".equals(emp.getPosition().getCode());

                // N -> D, N -> E 금지 룰
                if ("N".equals(yesterdayShift)) {
                    // 전날 나이트라면 오늘은 무조건 N 아니면 OFF
                    if (nCount < 2 && currentTotalN < request.getMaxNightPerMonth() && currentConsecutiveN < 3) {
                        assignedShift = shiftN;
                        nCount++;
                    } else {
                        assignedShift = shiftOFF;
                    }
                } else if (currentConsecutiveN >= 3) {
                    // 3일 연속 나이트 시 무조건 OFF
                    assignedShift = shiftOFF;
                } else {
                    // D, E, N 배정 (우선순위: D -> E -> N -> OFF)
                    if (dCount < 2) {
                        if (!request.getRequireSenior() || (request.getRequireSenior() && (dCount == 1 || isSenior))) {
                            assignedShift = shiftD;
                            dCount++;
                        } else if (!request.getRequireSenior()) {
                            assignedShift = shiftD; dCount++;
                        }
                    } else if (eCount < 2) {
                        assignedShift = shiftE;
                        eCount++;
                    } else if (nCount < 2 && currentTotalN < request.getMaxNightPerMonth()) {
                        assignedShift = shiftN;
                        nCount++;
                    }
                }

                // 상태 업데이트
                if (assignedShift.getCode().equals("N")) {
                    nightCounts.put(empId, currentTotalN + 1);
                    consecutiveNightCounts.put(empId, currentConsecutiveN + 1);
                } else {
                    consecutiveNightCounts.put(empId, 0);
                }
                yesterdayShifts.put(empId, assignedShift.getCode());

                newEntries.add(DutyScheduleEntry.builder()
                        .dutySchedule(schedule)
                        .employee(emp)
                        .workDate(currentDate)
                        .shiftType(assignedShift)
                        .build());
            }

            // 규칙 ③ 인원 미달 경고
            if (nCount < 1) {
                warnings.add("경고: " + currentDate + " 나이트(N) 근무 인원 부족 (현재 " + nCount + "명)");
            }
        }

        dutyScheduleEntryRepository.saveAll(newEntries);
        return mapToResponse(schedule, newEntries, warnings);
    }

    private DutyScheduleResponse mapToResponse(DutySchedule schedule, List<DutyScheduleEntry> entries, List<String> warnings) {
        List<DutyScheduleEntryResponse> entryResponses = entries.stream().map(e -> DutyScheduleEntryResponse.builder()
                .id(e.getId())
                .employeeId(e.getEmployee().getId())
                .employeeName(e.getEmployee().getName())
                .workDate(e.getWorkDate())
                .shiftTypeCode(e.getShiftType().getCode())
                .shiftTypeName(e.getShiftType().getName())
                .build()).collect(Collectors.toList());

        return DutyScheduleResponse.builder()
                .id(schedule.getId())
                .departmentId(schedule.getDepartment().getId())
                .departmentName(schedule.getDepartment().getName())
                .scheduleYear(schedule.getScheduleYear())
                .scheduleMonth(schedule.getScheduleMonth())
                .status(schedule.getStatus())
                .entries(entryResponses)
                .warnings(warnings)
                .build();
    }
}
