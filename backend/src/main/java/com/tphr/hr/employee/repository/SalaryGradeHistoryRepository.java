package com.tphr.hr.employee.repository;

import com.tphr.hr.employee.entity.SalaryGradeHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SalaryGradeHistoryRepository extends JpaRepository<SalaryGradeHistory, Long> {

    List<SalaryGradeHistory> findByEmployeeIdOrderByApplyDateDesc(Long employeeId);
}
