package com.tphr.hr.system.service;

import com.tphr.hr.employee.entity.Department;
import com.tphr.hr.employee.entity.Employee;
import com.tphr.hr.employee.repository.DepartmentRepository;
import com.tphr.hr.employee.repository.EmployeeRepository;
import com.tphr.hr.system.dto.DepartmentCreateRequest;
import com.tphr.hr.system.dto.DepartmentResponse;
import com.tphr.hr.system.dto.DepartmentTreeResponse;
import com.tphr.hr.system.dto.DepartmentUpdateRequest;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    // POST /departments - 새로운 부서 추가
    @Transactional
    public DepartmentResponse createDepartment(DepartmentCreateRequest request) {
        Department parent = request.parentId() != null ? getDepartmentEntity(request.parentId()) : null;
        Employee manager = request.managerId() != null ? employeeRepository.findById(request.managerId()).orElse(null) : null;

        Department department = Department.builder()
                .name(request.name())
                .nameEn(request.nameEn())
                .deptCode(request.deptCode())
                .manager(manager)
                .location(request.location())
                .phone(request.phone())
                .establishedDate(request.establishedDate())
                .description(request.description())
                .parent(parent)
                .build();

        return toDepartmentResponse(departmentRepository.save(department));
    }

    // GET /departments - 전체 부서 목록 조회
    public List<DepartmentResponse> getDepartments() {
        return departmentRepository.findAllByOrderByName().stream()
                .map(this::toDepartmentResponse)
                .toList();
    }

    // GET /departments/tree - 조직도용 계층형 트리 조회
    public List<DepartmentTreeResponse> getDepartmentTree() {
        return departmentRepository.findByParentIsNullOrderByName().stream()
                .map(this::toDepartmentTreeResponse)
                .toList();
    }

    // GET /departments/{id} - 단건 조회
    public DepartmentResponse getDepartment(Long id) {
        return toDepartmentResponse(getDepartmentEntity(id));
    }

    // PATCH /departments/{id} - 부서명/상위 부서 등 수정
    @Transactional
    public DepartmentResponse updateDepartment(Long id, DepartmentUpdateRequest request) {
        Department department = getDepartmentEntity(id);
        Department parent = request.parentId() != null ? getDepartmentEntity(request.parentId()) : null;
        Employee manager = request.managerId() != null ? employeeRepository.findById(request.managerId()).orElse(null) : null;

        department.update(
                request.name(),
                request.nameEn(),
                manager,
                request.location(),
                request.phone(),
                request.establishedDate(),
                request.description(),
                parent
        );
        return toDepartmentResponse(department);
    }

    // DELETE /departments/{id} - 부서 삭제 (소속 인원이 있으면 차단)
    @Transactional
    public void deleteDepartment(Long id) {
        Department department = getDepartmentEntity(id);
        long memberCount = employeeRepository.countByDepartmentId(id);
        if (memberCount > 0) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, 
                "해당 부서에 소속된 직원이 " + memberCount + "명 존재하여 삭제할 수 없습니다. 직원을 타 부서로 이동 후 삭제해주세요."
            );
        }
        if (!department.getChildren().isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, 
                "하위 부서가 존재하여 삭제할 수 없습니다."
            );
        }
        departmentRepository.delete(department);
    }

    private Department getDepartmentEntity(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("부서를 찾을 수 없습니다. id=" + id));
    }

    // Helper: Build DepartmentResponse
    private DepartmentResponse toDepartmentResponse(Department d) {
        long memberCount = employeeRepository.countByDepartmentIdAndAccountStatusNot(d.getId(), "INACTIVE");
        return new DepartmentResponse(
                d.getId(),
                d.getName(),
                d.getDeptCode(),
                d.getNameEn(),
                d.getManager() != null ? d.getManager().getId() : null,
                d.getManager() != null ? d.getManager().getName() : null,
                d.getManager() != null && d.getManager().getPosition() != null ? d.getManager().getPosition().getName() : null,
                d.getLocation(),
                d.getPhone(),
                d.getEstablishedDate(),
                d.getDescription(),
                d.getParent() != null ? d.getParent().getId() : null,
                d.getParent() != null ? d.getParent().getName() : null,
                memberCount,
                d.getCreatedAt(),
                d.getUpdatedAt()
        );
    }

    // Helper: Build recursive DepartmentTreeResponse
    private DepartmentTreeResponse toDepartmentTreeResponse(Department d) {
        long memberCount = employeeRepository.countByDepartmentIdAndAccountStatusNot(d.getId(), "INACTIVE");
        List<DepartmentTreeResponse> childNodes = d.getChildren().stream()
                .map(this::toDepartmentTreeResponse)
                .toList();

        long totalSubMemberCount = memberCount + childNodes.stream()
                .mapToLong(DepartmentTreeResponse::totalSubMemberCount)
                .sum();

        return new DepartmentTreeResponse(
                d.getId(),
                d.getName(),
                d.getDeptCode(),
                d.getNameEn(),
                d.getManager() != null ? d.getManager().getId() : null,
                d.getManager() != null ? d.getManager().getName() : null,
                d.getManager() != null && d.getManager().getPosition() != null ? d.getManager().getPosition().getName() : null,
                d.getLocation(),
                d.getPhone(),
                d.getEstablishedDate(),
                d.getDescription(),
                memberCount,
                totalSubMemberCount,
                childNodes
        );
    }
}
