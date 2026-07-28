package com.tphr.hr.attendance.service;

import com.tphr.hr.attendance.dto.*;
import com.tphr.hr.attendance.entity.Attendance;
import com.tphr.hr.attendance.repository.AttendanceRepository;
import com.tphr.hr.employee.entity.Employee;
import com.tphr.hr.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional
    public AttendanceResponse checkIn(AttendanceCheckInRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new IllegalArgumentException("직원을 찾을 수 없습니다."));

        if (attendanceRepository.findByEmployeeIdAndWorkDate(employee.getId(), request.getWorkDate()).isPresent()) {
            throw new IllegalStateException("이미 출근 기록이 존재합니다.");
        }

        Attendance attendance = Attendance.builder()
                .employee(employee)
                .workDate(request.getWorkDate())
                .checkInTime(request.getCheckInTime())
                .status("NORMAL")
                .note(request.getNote())
                .isCorrected(false)
                .build();

        Attendance saved = attendanceRepository.save(attendance);
        return mapToResponse(saved);
    }

    @Transactional
    public AttendanceResponse checkOut(AttendanceCheckOutRequest request) {
        Attendance attendance = attendanceRepository.findByEmployeeIdAndWorkDate(request.getEmployeeId(), request.getWorkDate())
                .orElseThrow(() -> new IllegalArgumentException("해당 날짜의 출근 기록이 없습니다. 먼저 출근을 기록하세요."));

        if (attendance.getCheckOutTime() != null && !Boolean.TRUE.equals(attendance.getIsCorrected())) {
            throw new IllegalStateException("이미 퇴근 기록이 존재합니다.");
        }

        Attendance updatedAttendance = Attendance.builder()
                .id(attendance.getId())
                .employee(attendance.getEmployee())
                .workDate(attendance.getWorkDate())
                .checkInTime(attendance.getCheckInTime())
                .checkOutTime(request.getCheckOutTime())
                .status(attendance.getStatus())
                .note(request.getNote() != null ? request.getNote() : attendance.getNote())
                .isCorrected(attendance.getIsCorrected())
                .correctionReason(attendance.getCorrectionReason())
                .correctedBy(attendance.getCorrectedBy())
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

    // ===== 관리자 전용 근태 정정 및 수동 등록 API =====

    @Transactional
    public AttendanceResponse createAttendanceByAdmin(AttendanceAdminCreateRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new IllegalArgumentException("직원 정보를 찾을 수 없습니다."));

        Attendance attendance = Attendance.builder()
                .employee(employee)
                .workDate(request.getWorkDate())
                .checkInTime(request.getCheckInTime())
                .checkOutTime(request.getCheckOutTime())
                .status(request.getStatus() != null ? request.getStatus() : "NORMAL")
                .note(request.getNote() != null ? request.getNote() : "[관리자수동등록] " + request.getCorrectionReason())
                .isCorrected(true)
                .correctionReason(request.getCorrectionReason())
                .correctedBy(request.getCorrectedBy())
                .build();

        return mapToResponse(attendanceRepository.save(attendance));
    }

    @Transactional
    public AttendanceResponse updateAttendanceByAdmin(Long id, AttendanceAdminUpdateRequest request) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 근태 기록을 찾을 수 없습니다."));

        String reason = request.getCorrectionReason();
        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("감사 대비를 위해 근태 정정 사유는 필수 입력 항목입니다.");
        }

        attendance.updateByAdmin(
                request.getCheckInTime(),
                request.getCheckOutTime(),
                request.getStatus(),
                request.getNote() != null ? request.getNote() : "[관리자정정] " + reason,
                reason,
                request.getCorrectedBy()
        );

        return mapToResponse(attendance);
    }

    @Transactional
    public void deleteAttendanceByAdmin(Long id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 근태 기록을 찾을 수 없습니다."));
        attendanceRepository.delete(attendance);
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAdminAttendances(Long departmentId, LocalDate startDate, LocalDate endDate) {
        List<Attendance> attendances;
        if (departmentId == null || departmentId == 0) {
            attendances = attendanceRepository.findByWorkDateBetweenOrderByWorkDateDesc(startDate, endDate);
        } else {
            attendances = attendanceRepository.findByEmployeeDepartmentIdAndWorkDateBetweenOrderByWorkDateDesc(departmentId, startDate, endDate);
        }
        return attendances.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private AttendanceResponse mapToResponse(Attendance attendance) {
        Employee emp = attendance.getEmployee();
        return AttendanceResponse.builder()
                .id(attendance.getId())
                .employeeId(emp.getId())
                .empNo(emp.getEmpNo())
                .employeeName(emp.getName())
                .departmentName(emp.getDepartment() != null ? emp.getDepartment().getName() : "미지정")
                .positionName(emp.getPosition() != null ? emp.getPosition().getName() : "")
                .workDate(attendance.getWorkDate())
                .checkInTime(attendance.getCheckInTime())
                .checkOutTime(attendance.getCheckOutTime())
                .status(attendance.getStatus())
                .note(attendance.getNote())
                .isCorrected(attendance.getIsCorrected())
                .correctionReason(attendance.getCorrectionReason())
                .correctedBy(attendance.getCorrectedBy())
                .build();
    }
}
