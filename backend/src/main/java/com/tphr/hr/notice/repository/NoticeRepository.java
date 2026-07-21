package com.tphr.hr.notice.repository;

import com.tphr.hr.notice.entity.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;

public interface NoticeRepository extends JpaRepository<Notice, Long> {

    // 만료되지 않은 공지만: 중요공지 우선(내림차순) -> 최신순으로 정렬해 조회
    // (Pageable에 Sort를 실어서 호출하는 쪽에서 정렬 기준을 지정한다)
    Page<Notice> findByExpirationDateIsNullOrExpirationDateGreaterThanEqual(LocalDate today, Pageable pageable);
}
