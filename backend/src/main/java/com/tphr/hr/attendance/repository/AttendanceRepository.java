package com.tphr.hr.attendance.repository;

import com.tphr.hr.attendance.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByEmployeeIdAndWorkDate(Long employeeId, LocalDate workDate);
    List<Attendance> findByEmployeeIdAndWorkDateBetween(Long employeeId, LocalDate startDate, LocalDate endDate);
    List<Attendance> findByEmployeeDepartmentIdAndWorkDateBetween(Long departmentId, LocalDate startDate, LocalDate endDate);
    List<Attendance> findByWorkDateBetweenOrderByWorkDateDesc(LocalDate startDate, LocalDate endDate);
    List<Attendance> findByEmployeeDepartmentIdAndWorkDateBetweenOrderByWorkDateDesc(Long departmentId, LocalDate startDate, LocalDate endDate);
}
