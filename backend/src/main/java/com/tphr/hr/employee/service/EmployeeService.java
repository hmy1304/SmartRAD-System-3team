package com.tphr.hr.employee.service;

import com.tphr.hr.employee.dto.*;
import com.tphr.hr.employee.entity.Department;
import com.tphr.hr.employee.entity.Employee;
import com.tphr.hr.employee.repository.DepartmentRepository;
import com.tphr.hr.employee.repository.EmployeeRepository;
import com.tphr.hr.employee.repository.EmployeeSpecifications;
import com.tphr.hr.system.entity.CommonCode;
import com.tphr.hr.system.entity.RoleGroup;
import com.tphr.hr.system.repository.CommonCodeRepository;
import com.tphr.hr.system.repository.RoleGroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmployeeService {

    private static final String INITIAL_PASSWORD_CHARS =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    private static final int INITIAL_PASSWORD_LENGTH = 10;

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final CommonCodeRepository commonCodeRepository;
    private final RoleGroupRepository roleGroupRepository;
    private final PasswordEncoder passwordEncoder;

    private final SecureRandom secureRandom = new SecureRandom();

    // POST /employees - 직원 등록 (기본 인적사항 + 계정 생성, 초기 비밀번호 자동 발급)
    @Transactional
    public EmployeeCreateResponse createEmployee(EmployeeCreateRequest request) {
        if (employeeRepository.existsByEmpNo(request.empNo())) {
            throw new IllegalArgumentException("이미 존재하는 사번입니다: " + request.empNo());
        }

        Department department = getDepartment(request.departmentId());
        String rawPassword = generateInitialPassword();

        Employee employee = Employee.builder()
                .empNo(request.empNo())
                .name(request.name())
                .password(passwordEncoder.encode(rawPassword))
                .email(request.email())
                .phone(request.phone())
                .joinDate(request.joinDate())
                .isShiftWorker(request.isShiftWorker() != null ? request.isShiftWorker() : false)
                .gender(request.gender())
                .birthDate(request.birthDate())
                .address(request.address())
                .internalPhone(request.internalPhone())
                .emergencyContact(request.emergencyContact())
                .emergencyRelation(request.emergencyRelation())
                .department(department)
                .position(getCommonCodeOrNull(request.positionCode()))
                .jobCategory(getCommonCodeOrNull(request.jobCategoryCode()))
                .employmentType(getCommonCodeOrNull(request.employmentTypeCode()))
                .hireRoute(getCommonCodeOrNull(request.hireRouteCode()))
                .workType(getCommonCodeOrNull(request.workTypeCode()))
                .workWard(request.workWard())
                .payStep(request.payStep())
                .payrollType(getCommonCodeOrNull(request.payrollTypeCode()))
                .payrollDate(request.payrollDate())
                .bankAccount(request.bankAccount())
                .taxType(getCommonCodeOrNull(request.taxTypeCode()))
                .roleGroup(getRoleGroupOrNull(request.roleGroupId()))
                .accountStatus("ACTIVE")
                .build();

        Employee saved = employeeRepository.save(employee);

        return new EmployeeCreateResponse(saved.getId(), saved.getEmpNo(), saved.getName(), rawPassword);
    }

    // GET /employees - 목록 조회 (부서별/직급별/재직상태별 검색·필터)
    public Page<EmployeeSummaryResponse> getEmployees(EmployeeSearchCondition condition, Pageable pageable) {
        return employeeRepository.findAll(EmployeeSpecifications.from(condition), pageable)
                .map(EmployeeSummaryResponse::from);
    }

    // GET /employees/{id} - 상세 조회
    public EmployeeResponse getEmployee(Long id) {
        return EmployeeResponse.from(getEmployeeEntity(id));
    }

    // PATCH /employees/{id} - 인적사항 수정
    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeUpdateRequest request) {
        Employee employee = getEmployeeEntity(id);

        Department department = request.departmentId() != null ? getDepartment(request.departmentId()) : null;
        RoleGroup roleGroup = request.roleGroupId() != null ? getRoleGroupOrNull(request.roleGroupId()) : null;

        employee.updateProfile(
                request.name(),
                request.email(),
                request.phone(),
                request.gender(),
                request.birthDate(),
                request.address(),
                request.internalPhone(),
                request.emergencyContact(),
                request.emergencyRelation(),
                department,
                getCommonCodeOrNull(request.positionCode()),
                getCommonCodeOrNull(request.jobCategoryCode()),
                getCommonCodeOrNull(request.employmentTypeCode()),
                getCommonCodeOrNull(request.hireRouteCode()),
                getCommonCodeOrNull(request.workTypeCode()),
                request.workWard(),
                request.payStep(),
                getCommonCodeOrNull(request.payrollTypeCode()),
                request.payrollDate(),
                request.bankAccount(),
                request.bankName(),
                getCommonCodeOrNull(request.taxTypeCode()),
                roleGroup,
                request.isShiftWorker()
        );

        return EmployeeResponse.from(employee);
    }

    // PATCH /employees/{id}/account-status - 계정 잠금/해제 (퇴사자 계정 잠금과 연결)
    @Transactional
    public EmployeeResponse updateAccountStatus(Long id, AccountStatusUpdateRequest request) {
        Employee employee = getEmployeeEntity(id);
        employee.changeAccountStatus(request.accountStatus());
        return EmployeeResponse.from(employee);
    }

    // POST /employees/{id}/issue-account - 계정 발급 (초기 비밀번호 생성/초기화)
    @Transactional
    public AccountIssueResponse issueAccount(Long id) {
        Employee employee = getEmployeeEntity(id);
        
        // 새로운 초기 비밀번호 생성
        String rawPassword = generateInitialPassword();
        employee.changePassword(passwordEncoder.encode(rawPassword));
        
        return new AccountIssueResponse(employee.getId(), employee.getEmpNo(), rawPassword);
    }

    @Transactional
    public void deleteEmployees(java.util.List<Long> ids) {
        employeeRepository.deleteAllByIdInBatch(ids);
    }

    Employee getEmployeeEntity(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("직원을 찾을 수 없습니다. id=" + id));
    }

    private Department getDepartment(Long departmentId) {
        return departmentRepository.findById(departmentId)
                .orElseThrow(() -> new EntityNotFoundException("부서를 찾을 수 없습니다. id=" + departmentId));
    }

    private CommonCode getCommonCodeOrNull(String code) {
        if (code == null || code.isBlank()) {
            return null;
        }
        return commonCodeRepository.findById(code)
                .orElseThrow(() -> new EntityNotFoundException("공통 코드가 존재하지 않습니다. code=" + code));
    }

    private RoleGroup getRoleGroupOrNull(Long roleGroupId) {
        if (roleGroupId == null) {
            return null;
        }
        return roleGroupRepository.findById(roleGroupId)
                .orElseThrow(() -> new EntityNotFoundException("권한 그룹을 찾을 수 없습니다. id=" + roleGroupId));
    }

    // 임의의 초기 비밀번호를 생성한다. 관리자는 발급된 비밀번호를 최초 1회 신규 직원에게 전달한다.
    // 데모/테스트 환경을 위해 무조건 '1234'로 발급되도록 수정
    private String generateInitialPassword() {
        return "1234";
    }
}
