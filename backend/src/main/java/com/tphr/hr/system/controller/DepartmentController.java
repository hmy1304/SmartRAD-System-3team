package com.tphr.hr.system.controller;

import com.tphr.hr.system.dto.DepartmentCreateRequest;
import com.tphr.hr.system.dto.DepartmentResponse;
import com.tphr.hr.system.dto.DepartmentTreeResponse;
import com.tphr.hr.system.dto.DepartmentUpdateRequest;
import com.tphr.hr.system.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    // POST /departments - 새로운 부서 추가
    @PostMapping
    public ResponseEntity<DepartmentResponse> createDepartment(@Valid @RequestBody DepartmentCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(departmentService.createDepartment(request));
    }

    // GET /departments - 전체 부서 목록 조회 (평면 목록)
    @GetMapping
    public ResponseEntity<List<DepartmentResponse>> getDepartments() {
        return ResponseEntity.ok(departmentService.getDepartments());
    }

    // GET /departments/tree - 조직도용 계층형 트리 조회
    @GetMapping("/tree")
    public ResponseEntity<List<DepartmentTreeResponse>> getDepartmentTree() {
        return ResponseEntity.ok(departmentService.getDepartmentTree());
    }

    // GET /departments/{id} - 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<DepartmentResponse> getDepartment(@PathVariable Long id) {
        return ResponseEntity.ok(departmentService.getDepartment(id));
    }

    // PATCH /departments/{id} - 부서명/상위 부서 수정
    @PatchMapping("/{id}")
    public ResponseEntity<DepartmentResponse> updateDepartment(@PathVariable Long id,
                                                                @RequestBody DepartmentUpdateRequest request) {
        return ResponseEntity.ok(departmentService.updateDepartment(id, request));
    }
}
