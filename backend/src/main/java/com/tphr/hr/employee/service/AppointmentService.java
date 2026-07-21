package com.tphr.hr.employee.service;

import com.tphr.hr.employee.dto.AppointmentBatchRequest;
import com.tphr.hr.employee.dto.AppointmentCreateRequest;
import com.tphr.hr.employee.dto.AppointmentResponse;
import com.tphr.hr.employee.entity.Appointment;
import com.tphr.hr.employee.entity.Department;
import com.tphr.hr.employee.entity.Employee;
import com.tphr.hr.employee.entity.SalaryGradeHistory;
import com.tphr.hr.employee.repository.AppointmentRepository;
import com.tphr.hr.employee.repository.DepartmentRepository;
import com.tphr.hr.employee.repository.SalaryGradeHistoryRepository;
import com.tphr.hr.system.entity.CommonCode;
import com.tphr.hr.system.repository.CommonCodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DepartmentRepository departmentRepository;
    private final CommonCodeRepository commonCodeRepository;
    private final SalaryGradeHistoryRepository salaryGradeHistoryRepository;
    private final EmployeeService employeeService;

    // POST /appointments - 발령 등록. applyDate가 오늘 이전이거나 오늘이면 즉시 반영한다.
    @Transactional
    public AppointmentResponse createAppointment(AppointmentCreateRequest request) {
        Employee employee = employeeService.getEmployeeEntity(request.employeeId());
        Appointment appointment = buildAppointment(
                employee,
                request.appointmentTypeCode(),
                request.afterDepartmentId(),
                request.afterPositionCode(),
                request.afterPayStep(),
                request.applyDate(),
                request.note()
        );

        Appointment saved = appointmentRepository.save(appointment);
        applyIfDue(saved);
        return AppointmentResponse.from(saved);
    }

    // POST /appointments/batch - 특정 날짜 기준 일괄 발령 등록/적용
    @Transactional
    public List<AppointmentResponse> createAppointmentsBatch(AppointmentBatchRequest request) {
        return request.items().stream()
                .map(item -> {
                    Employee employee = employeeService.getEmployeeEntity(item.employeeId());
                    Appointment appointment = buildAppointment(
                            employee,
                            item.appointmentTypeCode(),
                            item.afterDepartmentId(),
                            item.afterPositionCode(),
                            item.afterPayStep(),
                            request.applyDate(),
                            item.note()
                    );
                    Appointment saved = appointmentRepository.save(appointment);
                    applyIfDue(saved);
                    return AppointmentResponse.from(saved);
                })
                .toList();
    }

    // GET /appointments/history/{employeeId} - 발령 이력 조회
    public List<AppointmentResponse> getHistory(Long employeeId) {
        return appointmentRepository.findByEmployeeIdOrderByApplyDateDesc(employeeId).stream()
                .map(AppointmentResponse::from)
                .toList();
    }

    // applyDate 도래 시 Employee.department/position 을 실제 반영하는 배치/스케줄러 진입점.
    // AppointmentScheduler(@Scheduled) 에서 매일 호출된다.
    @Transactional
    public int applyDueAppointments() {
        List<Appointment> due = appointmentRepository.findByAppliedFalseAndApplyDateLessThanEqual(LocalDate.now());
        due.forEach(this::applyEffects);
        if (!due.isEmpty()) {
            log.info("[Appointment] {}건의 발령을 실제 반영했습니다.", due.size());
        }
        return due.size();
    }

    private Appointment buildAppointment(Employee employee, String appointmentTypeCode, Long afterDepartmentId,
                                          String afterPositionCode, Integer afterPayStep, LocalDate applyDate,
                                          String note) {
        CommonCode appointmentType = commonCodeRepository.findById(appointmentTypeCode)
                .orElseThrow(() -> new EntityNotFoundException("발령 유형 코드를 찾을 수 없습니다. code=" + appointmentTypeCode));

        Department afterDepartment = afterDepartmentId != null
                ? departmentRepository.findById(afterDepartmentId)
                    .orElseThrow(() -> new EntityNotFoundException("부서를 찾을 수 없습니다. id=" + afterDepartmentId))
                : null;

        CommonCode afterPosition = (afterPositionCode != null && !afterPositionCode.isBlank())
                ? commonCodeRepository.findById(afterPositionCode)
                    .orElseThrow(() -> new EntityNotFoundException("직급 코드를 찾을 수 없습니다. code=" + afterPositionCode))
                : null;

        return Appointment.builder()
                .employee(employee)
                .appointmentType(appointmentType)
                .afterDepartment(afterDepartment)
                .afterPosition(afterPosition)
                .afterPayStep(afterPayStep)
                .applyDate(applyDate)
                .note(note)
                .applied(false)
                .build();
    }

    private void applyIfDue(Appointment appointment) {
        if (!appointment.getApplyDate().isAfter(LocalDate.now())) {
            applyEffects(appointment);
        }
    }

    // 발령 확정 처리: Employee 반영 + 호봉 변경이 있는 경우 SalaryGradeHistory 자동 연동 생성
    private void applyEffects(Appointment appointment) {
        if (Boolean.TRUE.equals(appointment.getApplied())) {
            return;
        }

        Employee employee = appointment.getEmployee();
        Integer previousPayStep = employee.getPayStep();

        employee.applyAppointment(appointment.getAfterDepartment(), appointment.getAfterPosition(),
                appointment.getAfterPayStep());
        appointment.markApplied();

        boolean payStepChanged = appointment.getAfterPayStep() != null
                && !Objects.equals(previousPayStep, appointment.getAfterPayStep());

        if (payStepChanged) {
            CommonCode positionForHistory = appointment.getAfterPosition() != null
                    ? appointment.getAfterPosition()
                    : employee.getPosition();

            salaryGradeHistoryRepository.save(SalaryGradeHistory.builder()
                    .employee(employee)
                    .position(positionForHistory)
                    .payStep(appointment.getAfterPayStep())
                    .applyDate(appointment.getApplyDate())
                    .build());
        }
    }
}
