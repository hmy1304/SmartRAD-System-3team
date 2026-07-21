package com.tphr.hr.employee.repository;

import com.tphr.hr.employee.entity.EmploymentHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmploymentHistoryRepository extends JpaRepository<EmploymentHistory, Long> {

    List<EmploymentHistory> findByEmployeeIdOrderByStartDateDesc(Long employeeId);
}
