package com.tphr.hr.payroll.repository;

import com.tphr.hr.payroll.entity.BaseSalary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BaseSalaryRepository extends JpaRepository<BaseSalary, Long> {
}
