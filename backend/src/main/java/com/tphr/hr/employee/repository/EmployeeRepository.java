package com.tphr.hr.employee.repository;

import com.tphr.hr.employee.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee> {

    Optional<Employee> findByEmpNo(String empNo);

    boolean existsByEmpNo(String empNo);

    long countByDepartmentId(Long departmentId);

    List<Employee> findByAccountStatus(String accountStatus);
}
