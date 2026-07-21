package com.tphr.hr.employee.repository;

import com.tphr.hr.employee.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

    // GET /departments/tree - 최상위 부서(부서 트리의 루트)부터 계층 구조를 구성하기 위한 조회
    List<Department> findByParentIsNullOrderByName();

    List<Department> findAllByOrderByName();
}
