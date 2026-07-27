package com.tphr.hr.system.service;

import com.tphr.hr.system.dto.*;
import com.tphr.hr.system.entity.Menu;
import com.tphr.hr.system.entity.RoleGroup;
import com.tphr.hr.system.entity.RolePermission;
import com.tphr.hr.system.repository.MenuRepository;
import com.tphr.hr.system.repository.RoleGroupRepository;
import com.tphr.hr.system.repository.RolePermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoleGroupService {

    private final RoleGroupRepository roleGroupRepository;
    private final MenuRepository menuRepository;
    private final RolePermissionRepository rolePermissionRepository;

    // POST /role-groups - 권한 그룹 신설 (예: 수간호사, 인사담당자)
    @Transactional
    public RoleGroupResponse createRoleGroup(RoleGroupCreateRequest request) {
        RoleGroup roleGroup = RoleGroup.builder()
                .name(request.name())
                .description(request.description())
                .build();

        return RoleGroupResponse.from(roleGroupRepository.save(roleGroup));
    }

    // GET /role-groups - 전체 권한 그룹 목록 조회
    public List<RoleGroupResponse> getRoleGroups() {
        return roleGroupRepository.findAll().stream()
                .map(RoleGroupResponse::from)
                .toList();
    }

    // GET /role-groups/{id} - 단건 조회
    public RoleGroupResponse getRoleGroup(Long id) {
        return RoleGroupResponse.from(getRoleGroupEntity(id));
    }

    // PATCH /role-groups/{id} - 수정
    @Transactional
    public RoleGroupResponse updateRoleGroup(Long id, RoleGroupUpdateRequest request) {
        RoleGroup roleGroup = getRoleGroupEntity(id);
        roleGroup.update(request.name(), request.description());
        return RoleGroupResponse.from(roleGroup);
    }

    // DELETE /role-groups/{id} - 권한 그룹 삭제
    @Transactional
    public void deleteRoleGroup(Long id) {
        RoleGroup roleGroup = getRoleGroupEntity(id);
        
        // 해당 권한 그룹에 연관된 권한 매핑 삭제
        rolePermissionRepository.deleteAll(rolePermissionRepository.findByRoleGroupIdOrderByMenuId(id));
        
        // 그룹 자체 삭제
        roleGroupRepository.delete(roleGroup);
    }

    // GET /role-groups/{roleGroupId}/permissions - 해당 권한 그룹의 메뉴별 권한 전체 조회
    public List<RolePermissionResponse> getPermissions(Long roleGroupId) {
        getRoleGroupEntity(roleGroupId); // 존재 검증
        return rolePermissionRepository.findByRoleGroupIdOrderByMenuId(roleGroupId).stream()
                .map(RolePermissionResponse::from)
                .toList();
    }

    // PUT /role-groups/{roleGroupId}/permissions/{menuId} - 메뉴별 권한 설정 (upsert)
    @Transactional
    public RolePermissionResponse setPermission(Long roleGroupId, Long menuId, RolePermissionUpdateRequest request) {
        RoleGroup roleGroup = getRoleGroupEntity(roleGroupId);
        Menu menu = getMenuEntity(menuId);

        RolePermission permission = rolePermissionRepository.findByRoleGroupIdAndMenuId(roleGroupId, menuId)
                .orElseGet(() -> rolePermissionRepository.save(
                        RolePermission.builder()
                                .roleGroup(roleGroup)
                                .menu(menu)
                                .build()));

        permission.updatePermissions(request.canRead(), request.canWrite(), request.canDelete(), request.canApprove());
        return RolePermissionResponse.from(permission);
    }

    private RoleGroup getRoleGroupEntity(Long id) {
        return roleGroupRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("권한 그룹을 찾을 수 없습니다. id=" + id));
    }

    private Menu getMenuEntity(Long id) {
        return menuRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("메뉴를 찾을 수 없습니다. id=" + id));
    }
}
