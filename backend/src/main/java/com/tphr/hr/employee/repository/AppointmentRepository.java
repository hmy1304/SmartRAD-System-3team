package com.tphr.hr.employee.repository;

import com.tphr.hr.employee.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // 발령 이력 조회 (최신순)
    List<Appointment> findByEmployeeIdOrderByApplyDateDesc(Long employeeId);

    // 스케줄러/배치 처리 대상: 아직 반영되지 않은 발령 중 적용일이 도래한 건
    List<Appointment> findByAppliedFalseAndApplyDateLessThanEqual(LocalDate date);

    // 특정 날짜 기준 일괄 적용 대상 조회
    List<Appointment> findByApplyDateAndAppliedFalse(LocalDate applyDate);
}
