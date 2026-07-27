package com.tphr.hr.system.controller;

import com.tphr.hr.system.dto.*;
import com.tphr.hr.system.service.RoleGroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/role-groups")
@RequiredArgsConstructor
public class RoleGroupController {

    private final RoleGroupService roleGroupService;

    // POST /role-groups - 권한 그룹 신설 (예: 수간호사)
    @PostMapping
    public ResponseEntity<RoleGroupResponse> createRoleGroup(@Valid @RequestBody RoleGroupCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roleGroupService.createRoleGroup(request));
    }

    // GET /role-groups - 전체 권한 그룹 목록 조회
    @GetMapping
    public ResponseEntity<List<RoleGroupResponse>> getRoleGroups() {
        return ResponseEntity.ok(roleGroupService.getRoleGroups());
    }

    // GET /role-groups/{id} - 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<RoleGroupResponse> getRoleGroup(@PathVariable Long id) {
        return ResponseEntity.ok(roleGroupService.getRoleGroup(id));
    }

    // PATCH /role-groups/{id} - 수정
    @PatchMapping("/{id}")
    public ResponseEntity<RoleGroupResponse> updateRoleGroup(@PathVariable Long id,
                                                              @RequestBody RoleGroupUpdateRequest request) {
        return ResponseEntity.ok(roleGroupService.updateRoleGroup(id, request));
    }

    // GET /role-groups/{roleGroupId}/permissions - 해당 권한 그룹의 메뉴별 권한 전체 조회
    @GetMapping("/{roleGroupId}/permissions")
    public ResponseEntity<List<RolePermissionResponse>> getPermissions(@PathVariable Long roleGroupId) {
        return ResponseEntity.ok(roleGroupService.getPermissions(roleGroupId));
    }

    // PUT /role-groups/{roleGroupId}/permissions/{menuId} - 메뉴별 권한 설정 (수간호사 권한 변경 부여 등, upsert)
    @PutMapping("/{roleGroupId}/permissions/{menuId}")
    public ResponseEntity<RolePermissionResponse> setPermission(@PathVariable Long roleGroupId,
                                                                  @PathVariable Long menuId,
                                                                  @Valid @RequestBody RolePermissionUpdateRequest request) {
        return ResponseEntity.ok(roleGroupService.setPermission(roleGroupId, menuId, request));
    }

    // DELETE /role-groups/{id} - 권한 그룹 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoleGroup(@PathVariable Long id) {
        roleGroupService.deleteRoleGroup(id);
        return ResponseEntity.noContent().build();
    }
}
