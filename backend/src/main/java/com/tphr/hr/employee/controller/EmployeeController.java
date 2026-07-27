package com.tphr.hr.employee.controller;

import com.tphr.hr.employee.dto.*;
import com.tphr.hr.employee.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    // POST /employees - 직원 등록 (기본 인적사항 + 계정 생성)
    @PostMapping
    public ResponseEntity<EmployeeCreateResponse> createEmployee(@Valid @RequestBody EmployeeCreateRequest request) {
        EmployeeCreateResponse response = employeeService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // GET /employees - 목록 조회 (부서별, 직급별, 재직상태별 검색·필터)
    @GetMapping
    public ResponseEntity<Page<EmployeeSummaryResponse>> getEmployees(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String positionCode,
            @RequestParam(required = false) String accountStatus,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long roleGroupId,
            @PageableDefault(size = 20) Pageable pageable) {

        EmployeeSearchCondition condition =
                new EmployeeSearchCondition(departmentId, positionCode, accountStatus, keyword, roleGroupId);
        return ResponseEntity.ok(employeeService.getEmployees(condition, pageable));
    }

    // GET /employees/{id} - 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<EmployeeResponse> getEmployee(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getEmployee(id));
    }

    // PATCH /employees/{id} - 인적사항 수정
    @PatchMapping("/{id}")
    public ResponseEntity<EmployeeResponse> updateEmployee(@PathVariable Long id,
                                                            @Valid @RequestBody EmployeeUpdateRequest request) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, request));
    }

    // PATCH /employees/{id}/account-status - 계정 잠금/해제 (LOCKED <-> ACTIVE), 퇴사자 계정 잠금 기능과 연결
    @PatchMapping("/{id}/account-status")
    public ResponseEntity<EmployeeResponse> updateAccountStatus(@PathVariable Long id,
                                                                 @Valid @RequestBody AccountStatusUpdateRequest request) {
        return ResponseEntity.ok(employeeService.updateAccountStatus(id, request));
    }

    // POST /employees/{id}/issue-account - 관리자가 기존 사원의 계정(비밀번호)을 발급/초기화
    @PostMapping("/{id}/issue-account")
    public ResponseEntity<AccountIssueResponse> issueAccount(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.issueAccount(id));
    }

    // DELETE /employees - 다중 직원 삭제
    @DeleteMapping
    public ResponseEntity<Void> deleteEmployees(@RequestParam java.util.List<Long> ids) {
        employeeService.deleteEmployees(ids);
        return ResponseEntity.noContent().build();
    }
}
