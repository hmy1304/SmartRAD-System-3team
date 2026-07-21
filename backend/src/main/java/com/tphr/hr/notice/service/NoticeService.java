package com.tphr.hr.notice.service;

import com.tphr.hr.employee.entity.Employee;
import com.tphr.hr.employee.repository.EmployeeRepository;
import com.tphr.hr.notice.dto.NoticeCreateRequest;
import com.tphr.hr.notice.dto.NoticeResponse;
import com.tphr.hr.notice.dto.NoticeSummaryResponse;
import com.tphr.hr.notice.dto.NoticeUpdateRequest;
import com.tphr.hr.notice.entity.Notice;
import com.tphr.hr.notice.repository.NoticeRepository;
import com.tphr.hr.system.entity.CommonCode;
import com.tphr.hr.system.repository.CommonCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final EmployeeRepository employeeRepository;
    private final CommonCodeRepository commonCodeRepository;

    // POST /notices - 공지사항 등록
    @Transactional
    public NoticeResponse createNotice(NoticeCreateRequest request) {
        Employee author = getEmployee(request.authorId());
        CommonCode noticeType = getCommonCode(request.noticeTypeCode());

        Notice notice = Notice.builder()
                .title(request.title())
                .content(request.content())
                .noticeType(noticeType)
                .isImportant(request.isImportant() != null ? request.isImportant() : false)
                .author(author)
                .viewCount(0)
                .expirationDate(request.expirationDate())
                .build();

        return NoticeResponse.from(noticeRepository.save(notice));
    }

    // GET /notices - 목록 조회. 중요공지 상단고정 + 최신순, 만료된 공지는 기본 제외
    public Page<NoticeSummaryResponse> getNotices(boolean includeExpired, Pageable pageable) {
        Page<Notice> page = includeExpired
                ? noticeRepository.findAll(pageable)
                : noticeRepository.findByExpirationDateIsNullOrExpirationDateGreaterThanEqual(
                        LocalDate.now(), pageable);

        return page.map(NoticeSummaryResponse::from);
    }

    // GET /notices/{id} - 상세 조회 (조회수 1 증가)
    @Transactional
    public NoticeResponse getNotice(Long id) {
        Notice notice = getNoticeEntity(id);
        notice.increaseViewCount();
        return NoticeResponse.from(notice);
    }

    // PATCH /notices/{id} - 부분 수정
    @Transactional
    public NoticeResponse updateNotice(Long id, NoticeUpdateRequest request) {
        Notice notice = getNoticeEntity(id);
        CommonCode noticeType = request.noticeTypeCode() != null
                ? getCommonCode(request.noticeTypeCode())
                : null;

        notice.update(request.title(), request.content(), noticeType, request.isImportant(),
                request.expirationDate());

        return NoticeResponse.from(notice);
    }

    // DELETE /notices/{id} - 삭제
    @Transactional
    public void deleteNotice(Long id) {
        Notice notice = getNoticeEntity(id);
        noticeRepository.delete(notice);
    }

    private Notice getNoticeEntity(Long id) {
        return noticeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("공지사항을 찾을 수 없습니다. id=" + id));
    }

    private Employee getEmployee(Long employeeId) {
        return employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("작성자를 찾을 수 없습니다. employeeId=" + employeeId));
    }

    private CommonCode getCommonCode(String code) {
        return commonCodeRepository.findById(code)
                .orElseThrow(() -> new EntityNotFoundException("공지 유형 코드를 찾을 수 없습니다. code=" + code));
    }
}
