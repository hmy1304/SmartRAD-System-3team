package com.tphr.hr.system.service;

import com.tphr.hr.employee.entity.Department;
import com.tphr.hr.employee.repository.DepartmentRepository;
import com.tphr.hr.system.dto.DepartmentCreateRequest;
import com.tphr.hr.system.dto.DepartmentResponse;
import com.tphr.hr.system.dto.DepartmentTreeResponse;
import com.tphr.hr.system.dto.DepartmentUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    // POST /departments - 새로운 부서 추가 (parentId 없으면 최상위 부서)
    @Transactional
    public DepartmentResponse createDepartment(DepartmentCreateRequest request) {
        Department parent = request.parentId() != null ? getDepartmentEntity(request.parentId()) : null;

        Department department = Department.builder()
                .name(request.name())
                .parent(parent)
                .build();

        return DepartmentResponse.from(departmentRepository.save(department));
    }

    // GET /departments - 전체 부서 목록 조회 (평면 목록, 부서명 순)
    public List<DepartmentResponse> getDepartments() {
        return departmentRepository.findAllByOrderByName().stream()
                .map(DepartmentResponse::from)
                .toList();
    }

    // GET /departments/tree - 조직도용 계층형 트리 조회 (최상위 부서 기준 재귀 구성)
    public List<DepartmentTreeResponse> getDepartmentTree() {
        return departmentRepository.findByParentIsNullOrderByName().stream()
                .map(DepartmentTreeResponse::from)
                .toList();
    }

    // GET /departments/{id} - 단건 조회
    public DepartmentResponse getDepartment(Long id) {
        return DepartmentResponse.from(getDepartmentEntity(id));
    }

    // PATCH /departments/{id} - 부서명/상위 부서 수정
    @Transactional
    public DepartmentResponse updateDepartment(Long id, DepartmentUpdateRequest request) {
        Department department = getDepartmentEntity(id);
        Department parent = request.parentId() != null ? getDepartmentEntity(request.parentId()) : null;

        department.update(request.name(), parent);
        return DepartmentResponse.from(department);
    }

    private Department getDepartmentEntity(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("부서를 찾을 수 없습니다. id=" + id));
    }
}
