package com.tphr.hr.notice.entity;

import com.tphr.hr.common.entity.BaseEntity;
import com.tphr.hr.employee.entity.Employee;
import com.tphr.hr.system.entity.CommonCode;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "notice")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Notice extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notice_type_code", nullable = false)
    private CommonCode noticeType; // 일반, 긴급 등

    @Column(name = "is_important", nullable = false)
    @Builder.Default
    private Boolean isImportant = false; // 상단 고정 여부

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private Employee author;

    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private Integer viewCount = 0;

    @Column(name = "expiration_date")
    private LocalDate expirationDate;

    // ===== 도메인 메서드 =====

    // 상세 조회 시 조회수 1 증가
    public void increaseViewCount() {
        this.viewCount = this.viewCount + 1;
    }

    // PATCH /notices/{id} 부분 수정 - null인 항목은 변경하지 않는다
    public void update(String title, String content, CommonCode noticeType, Boolean isImportant,
                        LocalDate expirationDate) {
        if (title != null) this.title = title;
        if (content != null) this.content = content;
        if (noticeType != null) this.noticeType = noticeType;
        if (isImportant != null) this.isImportant = isImportant;
        if (expirationDate != null) this.expirationDate = expirationDate;
    }
}
