package com.tphr.hr.attendance.repository;

import com.tphr.hr.attendance.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByEmployeeIdAndWorkDate(Long employeeId, LocalDate workDate);
    List<Attendance> findByEmployeeIdAndWorkDateBetween(Long employeeId, LocalDate startDate, LocalDate endDate);
    List<Attendance> findByEmployeeDepartmentIdAndWorkDateBetween(Long departmentId, LocalDate startDate, LocalDate endDate);
    Page<Attendance> findByWorkDateBetweenOrderByWorkDateDesc(LocalDate startDate, LocalDate endDate, Pageable pageable);
    Page<Attendance> findByEmployeeDepartmentIdAndWorkDateBetweenOrderByWorkDateDesc(Long departmentId, LocalDate startDate, LocalDate endDate, Pageable pageable);
}
