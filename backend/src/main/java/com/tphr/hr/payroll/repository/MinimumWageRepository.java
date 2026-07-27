package com.tphr.hr.payroll.repository;

import com.tphr.hr.payroll.entity.MinimumWage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MinimumWageRepository extends JpaRepository<MinimumWage, Long> {
}
