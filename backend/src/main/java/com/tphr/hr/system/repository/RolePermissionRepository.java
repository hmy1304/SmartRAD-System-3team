package com.tphr.hr.system.repository;

import com.tphr.hr.system.entity.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {

    // GET /role-groups/{roleGroupId}/permissions - 특정 권한 그룹의 메뉴별 권한 전체 조회
    List<RolePermission> findByRoleGroupIdOrderByMenuId(Long roleGroupId);

    // PUT /role-groups/{roleGroupId}/permissions/{menuId} - 이미 설정된 권한이 있으면 갱신, 없으면 신규 생성(upsert)
    Optional<RolePermission> findByRoleGroupIdAndMenuId(Long roleGroupId, Long menuId);
}
