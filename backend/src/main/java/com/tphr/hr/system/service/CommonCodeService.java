package com.tphr.hr.system.service;

import com.tphr.hr.system.dto.CommonCodeCreateRequest;
import com.tphr.hr.system.dto.CommonCodeResponse;
import com.tphr.hr.system.dto.CommonCodeUpdateRequest;
import com.tphr.hr.system.entity.CommonCode;
import com.tphr.hr.system.repository.CommonCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommonCodeService {

    private final CommonCodeRepository commonCodeRepository;

    // POST /common-codes - 공통코드 신설 (예: 직급 신설, 신규 자격증 유형 등록)
    @Transactional
    public CommonCodeResponse createCommonCode(CommonCodeCreateRequest request) {
        if (commonCodeRepository.existsById(request.code())) {
            throw new IllegalArgumentException("이미 존재하는 코드입니다: " + request.code());
        }

        CommonCode commonCode = CommonCode.builder()
                .code(request.code())
                .groupCode(request.groupCode())
                .name(request.name())
                .description(request.description())
                .sortOrder(request.sortOrder())
                .isActive(true)
                .build();

        return CommonCodeResponse.from(commonCodeRepository.save(commonCode));
    }

    // GET /common-codes?groupCode=POS - 그룹별 조회. includeInactive=false면 사용중인 코드만 반환(드롭다운용)
    public List<CommonCodeResponse> getCommonCodes(String groupCode, boolean includeInactive) {
        List<CommonCode> codes = includeInactive
                ? commonCodeRepository.findByGroupCodeOrderBySortOrderAscCodeAsc(groupCode)
                : commonCodeRepository.findByGroupCodeAndIsActiveTrue(groupCode);

        return codes.stream().map(CommonCodeResponse::from).toList();
    }

    // GET /common-codes/{code} - 단건 조회
    public CommonCodeResponse getCommonCode(String code) {
        return CommonCodeResponse.from(getCommonCodeEntity(code));
    }

    // PATCH /common-codes/{code} - 수정 (isActive=false로 비활성화/사용중지 포함)
    @Transactional
    public CommonCodeResponse updateCommonCode(String code, CommonCodeUpdateRequest request) {
        CommonCode commonCode = getCommonCodeEntity(code);
        commonCode.update(request.name(), request.description(), request.sortOrder(), request.isActive());
        return CommonCodeResponse.from(commonCode);
    }

    private CommonCode getCommonCodeEntity(String code) {
        return commonCodeRepository.findById(code)
                .orElseThrow(() -> new EntityNotFoundException("공통코드를 찾을 수 없습니다. code=" + code));
    }
}
