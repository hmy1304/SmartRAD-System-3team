package com.tphr.hr.attendance.service;

import com.tphr.hr.attendance.dto.AttendanceCheckInRequest;
import com.tphr.hr.attendance.dto.AttendanceCheckOutRequest;
import com.tphr.hr.attendance.dto.AttendanceResponse;
import com.tphr.hr.attendance.entity.Attendance;
import com.tphr.hr.attendance.repository.AttendanceRepository;
import com.tphr.hr.employee.entity.Employee;
import com.tphr.hr.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import java.util.Collections;
import java.util.stream.Collectors;
import java.time.YearMonth;
import com.tphr.hr.attendance.dto.AttendanceSummaryDto;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional
    public AttendanceResponse checkIn(AttendanceCheckInRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new IllegalArgumentException("직원을 찾을 수 없습니다."));

        // 이미 오늘 출근 기록이 있는지 확인
        if (attendanceRepository.findByEmployeeIdAndWorkDate(employee.getId(), request.getWorkDate()).isPresent()) {
            throw new IllegalStateException("이미 출근 기록이 존재합니다.");
        }

        // 출근 기록 생성
        Attendance attendance = Attendance.builder()
                .employee(employee)
                .workDate(request.getWorkDate())
                .checkInTime(request.getCheckInTime())
                .status("NORMAL") // TODO: 교대 근무표를 조회하여 지각(LATE) 여부 판별 로직 추가 가능
                .note(request.getNote())
                .build();

        Attendance saved = attendanceRepository.save(attendance);
        return mapToResponse(saved);
    }

    @Transactional
    public AttendanceResponse checkOut(AttendanceCheckOutRequest request) {
        Attendance attendance = attendanceRepository.findByEmployeeIdAndWorkDate(request.getEmployeeId(), request.getWorkDate())
                .orElseThrow(() -> new IllegalArgumentException("해당 날짜의 출근 기록이 없습니다. 먼저 출근을 기록하세요."));

        if (attendance.getCheckOutTime() != null) {
            throw new IllegalStateException("이미 퇴근 기록이 존재합니다.");
        }

        // JPA Dirty Checking을 이용한 업데이트 대신 새 엔티티 복사 후 저장 (간단히 하기 위해)
        Attendance updatedAttendance = Attendance.builder()
                .id(attendance.getId())
                .employee(attendance.getEmployee())
                .workDate(attendance.getWorkDate())
                .checkInTime(attendance.getCheckInTime())
                .checkOutTime(request.getCheckOutTime())
                .status(attendance.getStatus())
                .note(request.getNote() != null ? request.getNote() : attendance.getNote())
                .build();
        
        Attendance saved = attendanceRepository.save(updatedAttendance);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getMyAttendances(Long employeeId, LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByEmployeeIdAndWorkDateBetween(employeeId, startDate, endDate)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getDepartmentAttendances(Long departmentId, LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByEmployeeDepartmentIdAndWorkDateBetween(departmentId, startDate, endDate)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private AttendanceResponse mapToResponse(Attendance attendance) {
        return AttendanceResponse.builder()
                .id(attendance.getId())
                .employeeId(attendance.getEmployee().getId())
                .employeeName(attendance.getEmployee().getName())
                .workDate(attendance.getWorkDate())
                .checkInTime(attendance.getCheckInTime())
                .checkOutTime(attendance.getCheckOutTime())
                .status(attendance.getStatus())
                .note(attendance.getNote())
                .build();
    }

    @Transactional(readOnly = true)
    public List<AttendanceSummaryDto> getMonthlySummary(int year, int month, Long departmentId) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        
        List<Employee> employees;
        if (departmentId != null) {
            employees = employeeRepository.findAll().stream()
                    .filter(e -> e.getDepartment() != null && e.getDepartment().getId().equals(departmentId))
                    .collect(Collectors.toList());
        } else {
            employees = employeeRepository.findAll();
        }

        List<AttendanceSummaryDto> summaryList = new ArrayList<>();
        String[] tones = {"blue", "light_blue", "green", "purple", "orange", "red"};

        for (int i = 0; i < employees.size(); i++) {
            Employee emp = employees.get(i);
            String tone = tones[i % tones.length];
            String initial = emp.getName() != null && emp.getName().length() > 0 ? emp.getName().substring(0, 1) : "";
            String deptName = emp.getDepartment() != null ? emp.getDepartment().getName() : "-";
            
            List<String> days = new ArrayList<>(Collections.nCopies(endDate.getDayOfMonth(), "empty"));
            
            int attend = 0, late = 0, absent = 0, leave = 0;

            List<Attendance> attendances = attendanceRepository.findByEmployeeIdAndWorkDateBetween(emp.getId(), startDate, endDate);
            for (Attendance att : attendances) {
                int dayIndex = att.getWorkDate().getDayOfMonth() - 1;
                String status = att.getStatus();
                if ("NORMAL".equalsIgnoreCase(status)) {
                    days.set(dayIndex, "normal");
                    attend++;
                } else if ("LATE".equalsIgnoreCase(status)) {
                    days.set(dayIndex, "late");
                    late++;
                } else if ("ABSENT".equalsIgnoreCase(status)) {
                    days.set(dayIndex, "absent");
                    absent++;
                } else if ("LEAVE".equalsIgnoreCase(status)) {
                    days.set(dayIndex, "leave");
                    leave++;
                }
            }

            // TODO: DutyScheduleEntry 조회하여 남은 empty 일자에 대해 OFF 처리 등 추가 가능

            summaryList.add(AttendanceSummaryDto.builder()
                    .id(String.valueOf(emp.getId()))
                    .name(emp.getName())
                    .initial(initial)
                    .empNo(emp.getEmpNo())
                    .department(deptName)
                    .tone(tone)
                    .days(days)
                    .attend(attend)
                    .late(late)
                    .absent(absent)
                    .leave(leave)
                    .build());
        }

        return summaryList;
    }
}
