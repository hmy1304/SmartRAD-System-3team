package com.tphr.hr.leave.repository;

import com.tphr.hr.leave.entity.EmployeeLeaveQuota;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface EmployeeLeaveQuotaRepository extends JpaRepository<EmployeeLeaveQuota, Long> {

    Optional<EmployeeLeaveQuota> findByEmployeeIdAndYear(Long employeeId, Integer year);

    @EntityGraph(attributePaths = {"employee", "employee.department"})
    List<EmployeeLeaveQuota> findByYear(Integer year);

    @EntityGraph(attributePaths = {"employee", "employee.department"})
    List<EmployeeLeaveQuota> findByYearAndRemainingDaysLessThanEqualOrderByRemainingDaysAsc(Integer year, Double days);
}
