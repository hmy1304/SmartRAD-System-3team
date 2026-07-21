package com.tphr.hr.employee.repository;

import com.tphr.hr.employee.entity.EmployeeHealth;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmployeeHealthRepository extends JpaRepository<EmployeeHealth, Long> {

    List<EmployeeHealth> findByEmployeeId(Long employeeId);

    // 종합 판정이 정상이 아닌 건 (이상 소견자 추적)
    List<EmployeeHealth> findByResultNotOrderByCheckupDateDesc(String normalResult);
}
