package com.tphr.hr.payroll.repository;

import com.tphr.hr.payroll.entity.AllowanceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AllowanceItemRepository extends JpaRepository<AllowanceItem, Long> {
}
