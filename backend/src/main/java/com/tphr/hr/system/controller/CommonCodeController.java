package com.tphr.hr.system.controller;

import com.tphr.hr.system.dto.CommonCodeCreateRequest;
import com.tphr.hr.system.dto.CommonCodeResponse;
import com.tphr.hr.system.dto.CommonCodeUpdateRequest;
import com.tphr.hr.system.service.CommonCodeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/common-codes")
@RequiredArgsConstructor
public class CommonCodeController {

    private final CommonCodeService commonCodeService;

    // POST /common-codes - 공통코드 신설 (직급 신설 등)
    @PostMapping
    public ResponseEntity<CommonCodeResponse> createCommonCode(@Valid @RequestBody CommonCodeCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(commonCodeService.createCommonCode(request));
    }

    // GET /common-codes?groupCode=POS&includeInactive=false - 그룹별 조회
    @GetMapping
    public ResponseEntity<List<CommonCodeResponse>> getCommonCodes(
            @RequestParam String groupCode,
            @RequestParam(defaultValue = "false") boolean includeInactive) {
        return ResponseEntity.ok(commonCodeService.getCommonCodes(groupCode, includeInactive));
    }

    // GET /common-codes/{code} - 단건 조회
    @GetMapping("/{code}")
    public ResponseEntity<CommonCodeResponse> getCommonCode(@PathVariable String code) {
        return ResponseEntity.ok(commonCodeService.getCommonCode(code));
    }

    // PATCH /common-codes/{code} - 수정 (isActive=false로 비활성화 포함)
    @PatchMapping("/{code}")
    public ResponseEntity<CommonCodeResponse> updateCommonCode(@PathVariable String code,
                                                                @RequestBody CommonCodeUpdateRequest request) {
        return ResponseEntity.ok(commonCodeService.updateCommonCode(code, request));
    }
}
