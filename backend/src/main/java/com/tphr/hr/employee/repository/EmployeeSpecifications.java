package com.tphr.hr.employee.repository;

import com.tphr.hr.employee.dto.EmployeeSearchCondition;
import com.tphr.hr.employee.entity.Employee;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * GET /employees 의 부서별/직급별/재직상태별/키워드 검색 조건을 동적 쿼리로 변환한다.
 */
public final class EmployeeSpecifications {

    private EmployeeSpecifications() {
    }

    public static Specification<Employee> from(EmployeeSearchCondition condition) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

            if (condition.departmentId() != null) {
                predicates.add(cb.equal(root.get("department").get("id"), condition.departmentId()));
            }
            if (StringUtils.hasText(condition.positionCode())) {
                predicates.add(cb.equal(root.get("position").get("code"), condition.positionCode()));
            }
            if (StringUtils.hasText(condition.accountStatus())) {
                predicates.add(cb.equal(root.get("accountStatus"), condition.accountStatus()));
            }
            if (StringUtils.hasText(condition.keyword())) {
                String like = "%" + condition.keyword().trim() + "%";
                predicates.add(cb.or(
                        cb.like(root.get("name"), like),
                        cb.like(root.get("empNo"), like)
                ));
            }

            if (condition.roleGroupId() != null) {
                predicates.add(cb.equal(root.get("roleGroup").get("id"), condition.roleGroupId()));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }
}
