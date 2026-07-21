package com.tphr.hr.system.repository;

import com.tphr.hr.system.entity.CommonCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommonCodeRepository extends JpaRepository<CommonCode, String> {

    List<CommonCode> findByGroupCodeAndIsActiveTrue(String groupCode);

    // 시스템 관리 화면(공통코드 관리)에서는 비활성 코드도 함께 보여줘야 하므로 활성여부와 무관하게 조회
    List<CommonCode> findByGroupCodeOrderBySortOrderAscCodeAsc(String groupCode);
}
