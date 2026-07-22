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
        aria-label="상담 신청"
        title="상담 신청"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 11.5a8 8 0 0 1-8.5 8 9.3 9.3 0 0 1-3.8-.9L4 20l1.4-3.5A8 8 0 1 1 20 11.5Z" />
        </svg>
      </a>

      {/* 로그인 */}
      <a
        href="login"
        className={`${styles.floatingButton} ${styles.consult}`}
        aria-label="로그인"
        title="로그인"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
        </svg>
      </a>
    </aside>
  );
}
