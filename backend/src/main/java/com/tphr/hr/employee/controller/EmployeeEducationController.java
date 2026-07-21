package com.tphr.hr.employee.controller;

import com.tphr.hr.employee.dto.EducationCompletionRateResponse;
import com.tphr.hr.employee.service.EmployeeEducationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/educations")
@RequiredArgsConstructor
public class EmployeeEducationController {

    private final EmployeeEducationService employeeEducationService;

    // GET /educations/completion-rate?department= - 의무교육 이수율 대시보드용 집계 API
    @GetMapping("/completion-rate")
    public ResponseEntity<EducationCompletionRateResponse> getCompletionRate(
            @RequestParam("department") Long departmentId,
            @RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(employeeEducationService.getCompletionRate(departmentId, year));
    }
}
