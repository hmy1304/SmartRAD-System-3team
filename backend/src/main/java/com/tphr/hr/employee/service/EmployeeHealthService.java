package com.tphr.hr.employee.service;

import com.tphr.hr.employee.dto.EmployeeHealthCreateRequest;
import com.tphr.hr.employee.dto.EmployeeHealthResponse;
import com.tphr.hr.employee.entity.Employee;
import com.tphr.hr.employee.entity.EmployeeHealth;
import com.tphr.hr.employee.repository.EmployeeHealthRepository;
import com.tphr.hr.system.entity.CommonCode;
import com.tphr.hr.system.repository.CommonCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmployeeHealthService {

    // 종합 판정이 이 값이면 정상으로 간주하고, 그 외는 이상 소견자로 분류한다.
    private static final String NORMAL_RESULT = "정상";

    private final EmployeeHealthRepository employeeHealthRepository;
    private final CommonCodeRepository commonCodeRepository;
    private final EmployeeService employeeService;

    // POST /employee-health - 검진 결과 등록 (checkupItemsJson 동적 항목 저장)
    @Transactional
    public EmployeeHealthResponse registerHealthCheckup(EmployeeHealthCreateRequest request) {
        Employee employee = employeeService.getEmployeeEntity(request.employeeId());

        CommonCode checkupType = null;
        if (request.checkupTypeCode() != null && !request.checkupTypeCode().isBlank()) {
            checkupType = commonCodeRepository.findById(request.checkupTypeCode())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "검진 종류 코드를 찾을 수 없습니다. code=" + request.checkupTypeCode()));
        }

        EmployeeHealth health = EmployeeHealth.builder()
                .employee(employee)
                .checkupYear(request.checkupYear())
                .checkupDate(request.checkupDate())
                .checkupType(checkupType)
                .institution(request.institution())
                .result(request.result())
                .findings(request.findings())
                .checkupItemsJson(request.checkupItemsJson())
                .build();

        return EmployeeHealthResponse.from(employeeHealthRepository.save(health));
    }

    // GET /employee-health/abnormal - 이상 소견자 추적 목록
    public List<EmployeeHealthResponse> getAbnormalResults() {
        return employeeHealthRepository.findByResultNotOrderByCheckupDateDesc(NORMAL_RESULT).stream()
                .map(EmployeeHealthResponse::from)
                .toList();
    }
}
