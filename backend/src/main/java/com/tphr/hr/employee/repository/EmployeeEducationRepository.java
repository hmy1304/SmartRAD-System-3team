package com.tphr.hr.employee.repository;

import com.tphr.hr.employee.entity.EmployeeEducation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EmployeeEducationRepository extends JpaRepository<EmployeeEducation, Long> {

    List<EmployeeEducation> findByEmployeeId(Long employeeId);

    // 특정 연도에 해당 부서 소속 직원 중 교육을 이수한 직원 id 목록(중복 제거)
    @Query("""
            SELECT DISTINCT ee.employee.id
            FROM EmployeeEducation ee
            WHERE ee.employee.department.id = :departmentId
              AND YEAR(ee.completionDate) = :year
            """)
    List<Long> findCompletedEmployeeIdsByDepartmentAndYear(@Param("departmentId") Long departmentId,
                                                             @Param("year") int year);
}
