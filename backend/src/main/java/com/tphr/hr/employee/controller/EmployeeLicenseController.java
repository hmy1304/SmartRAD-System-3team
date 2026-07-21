package com.tphr.hr.employee.controller;

import com.tphr.hr.employee.dto.ExpiringLicenseResponse;
import com.tphr.hr.employee.service.EmployeeLicenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/licenses")
@RequiredArgsConstructor
public class EmployeeLicenseController {

    private final EmployeeLicenseService employeeLicenseService;

    // GET /licenses/expiring?days=30 - 만료 임박 자격증 조회 (알림 팝업용)
    @GetMapping("/expiring")
    public ResponseEntity<List<ExpiringLicenseResponse>> getExpiringLicenses(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(employeeLicenseService.getExpiringLicenses(days));
    }
}
