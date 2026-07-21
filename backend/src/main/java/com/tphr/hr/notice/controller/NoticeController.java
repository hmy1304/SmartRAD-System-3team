package com.tphr.hr.notice.controller;

import com.tphr.hr.notice.dto.NoticeCreateRequest;
import com.tphr.hr.notice.dto.NoticeResponse;
import com.tphr.hr.notice.dto.NoticeSummaryResponse;
import com.tphr.hr.notice.dto.NoticeUpdateRequest;
import com.tphr.hr.notice.service.NoticeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notices")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    // POST /notices - 공지사항 등록
    @PostMapping
    public ResponseEntity<NoticeResponse> createNotice(@Valid @RequestBody NoticeCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(noticeService.createNotice(request));
    }

    // GET /notices - 목록 조회. 기본은 중요공지 상단고정 + 최신순, 만료된 공지는 제외
    @GetMapping
    public ResponseEntity<Page<NoticeSummaryResponse>> getNotices(
            @RequestParam(defaultValue = "false") boolean includeExpired,
            @PageableDefault(size = 20, sort = {"isImportant", "createdAt"}, direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ResponseEntity.ok(noticeService.getNotices(includeExpired, pageable));
    }

    // GET /notices/{id} - 상세 조회 (조회수 1 증가)
    @GetMapping("/{id}")
    public ResponseEntity<NoticeResponse> getNotice(@PathVariable Long id) {
        return ResponseEntity.ok(noticeService.getNotice(id));
    }

    // PATCH /notices/{id} - 부분 수정
    @PatchMapping("/{id}")
    public ResponseEntity<NoticeResponse> updateNotice(@PathVariable Long id,
                                                        @Valid @RequestBody NoticeUpdateRequest request) {
        return ResponseEntity.ok(noticeService.updateNotice(id, request));
    }

    // DELETE /notices/{id} - 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotice(@PathVariable Long id) {
        noticeService.deleteNotice(id);
        return ResponseEntity.noContent().build();
    }
}
