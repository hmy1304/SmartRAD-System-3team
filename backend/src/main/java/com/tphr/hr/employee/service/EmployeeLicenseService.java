package com.tphr.hr.employee.service;

import com.tphr.hr.employee.dto.ExpiringLicenseResponse;
import com.tphr.hr.employee.repository.EmployeeLicenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmployeeLicenseService {

    private final EmployeeLicenseRepository employeeLicenseRepository;

    // GET /licenses/expiring?days=30 - 만료 임박 자격증 조회 (알림 팝업용)
    public List<ExpiringLicenseResponse> getExpiringLicenses(int days) {
        LocalDate today = LocalDate.now();
        LocalDate limit = today.plusDays(days);

        return employeeLicenseRepository.findByExpirationDateBetween(today, limit).stream()
                .map(license -> ExpiringLicenseResponse.from(license, today))
                .sorted((a, b) -> Long.compare(a.daysUntilExpiration(), b.daysUntilExpiration()))
                .toList();
    }
}
