package com.tphr.hr.employee.repository;

import com.tphr.hr.employee.entity.EmployeeLicense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface EmployeeLicenseRepository extends JpaRepository<EmployeeLicense, Long> {

    // 만료 임박 자격증: 오늘 ~ 기준일(today + days) 사이에 만료되는 건
    List<EmployeeLicense> findByExpirationDateBetween(LocalDate from, LocalDate to);

    List<EmployeeLicense> findByEmployeeId(Long employeeId);
}
