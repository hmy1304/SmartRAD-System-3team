"use client";

import styles from "./FloatingButtons.module.scss";

export default function FloatingButtons() {
  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <aside className={styles.floatingButtons} aria-label="빠른 메뉴">
      {/* 맨 위로 이동 */}
      <button
        type="button"
        className={`${styles.floatingButton} ${styles.scrollTop}`}
        onClick={handleScrollTop}
        aria-label="페이지 맨 위로 이동"
        title="맨 위로"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 20V5" />
          <path d="M5 12l7-7 7 7" />
        </svg>
      </button>

      {/* 채팅 문의 */}
      <a
        href="#contact"
        className={`${styles.floatingButton} ${styles.chat}`}
        aria-label="채팅 상담"
        title="채팅 상담"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 11.5a8 8 0 0 1-8.5 8 9.3 9.3 0 0 1-3.8-.9L4 20l1.4-3.5A8 8 0 1 1 20 11.5Z" />
        </svg>
      </a>

      {/* 도입 상담 */}
      <a
        href="#contact"
        className={`${styles.floatingButton} ${styles.consult}`}
        aria-label="도입 상담 신청"
        title="도입 상담"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 4v5" />
          <path d="M15 12h5" />
          <path d="M9.8 14.2 6.3 17.7" />
        </svg>
      </a>
    </aside>
  );
}
