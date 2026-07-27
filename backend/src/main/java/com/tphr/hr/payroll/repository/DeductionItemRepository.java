package com.tphr.hr.payroll.repository;

import com.tphr.hr.payroll.entity.DeductionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeductionItemRepository extends JpaRepository<DeductionItem, Long> {
}
