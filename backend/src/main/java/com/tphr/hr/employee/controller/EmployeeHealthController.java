package com.tphr.hr.employee.controller;

import com.tphr.hr.employee.dto.EmployeeHealthCreateRequest;
import com.tphr.hr.employee.dto.EmployeeHealthResponse;
import com.tphr.hr.employee.service.EmployeeHealthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employee-health")
@RequiredArgsConstructor
public class EmployeeHealthController {

    private final EmployeeHealthService employeeHealthService;

    // POST /employee-health - 검진 결과 등록 (checkupItemsJson 동적 항목 저장)
    @PostMapping
    public ResponseEntity<EmployeeHealthResponse> registerHealthCheckup(
            @Valid @RequestBody EmployeeHealthCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(employeeHealthService.registerHealthCheckup(request));
    }

    // GET /employee-health/abnormal - 이상 소견자 추적 목록
    @GetMapping("/abnormal")
    public ResponseEntity<List<EmployeeHealthResponse>> getAbnormalResults() {
        return ResponseEntity.ok(employeeHealthService.getAbnormalResults());
    }
}
