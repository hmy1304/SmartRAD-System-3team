package com.tphr.hr.employee.service;

import com.tphr.hr.employee.dto.EducationCompletionRateResponse;
import com.tphr.hr.employee.entity.Department;
import com.tphr.hr.employee.repository.DepartmentRepository;
import com.tphr.hr.employee.repository.EmployeeEducationRepository;
import com.tphr.hr.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmployeeEducationService {

    private final EmployeeEducationRepository employeeEducationRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    // GET /educations/completion-rate?department= - 의무교육 이수율 대시보드용 집계
    public EducationCompletionRateResponse getCompletionRate(Long departmentId, Integer year) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new EntityNotFoundException("부서를 찾을 수 없습니다. id=" + departmentId));

        int targetYear = year != null ? year : LocalDate.now().getYear();

        long totalCount = employeeRepository.countByDepartmentId(departmentId);
        List<Long> completedEmployeeIds =
                employeeEducationRepository.findCompletedEmployeeIdsByDepartmentAndYear(departmentId, targetYear);
        long completedCount = completedEmployeeIds.size();

        double rate = totalCount == 0 ? 0.0 : (completedCount * 100.0) / totalCount;

        return new EducationCompletionRateResponse(
                department.getId(),
                department.getName(),
                targetYear,
                totalCount,
                completedCount,
                Math.round(rate * 10) / 10.0 // 소수점 1자리 반올림
        );
    }
}
