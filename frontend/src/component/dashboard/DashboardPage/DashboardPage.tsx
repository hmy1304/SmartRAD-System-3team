"use client";

import { useEffect, useState } from "react";



import type { DashboardData } from "@/types/dashboard";

import styles from "./DashboardPage.module.scss";

interface DashboardPageProps {
  initialData: DashboardData;
}

export default function DashboardPage({ initialData }: DashboardPageProps) {
  const [todayText, setTodayText] = useState("");

  const {
    profile,
    summaryCards,
    approvalItems,
    attendanceList,
    notices,
    myApprovals,
    approvalCounts,
  } = initialData;

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();

      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const date = now.getDate();

      const week = ["일", "월", "화", "수", "목", "금", "토"];

      const day = week[now.getDay()];

      setTodayText(`${year}년 ${month}월 ${date}일 ${day}요일`);
    };

    updateDate();

    const timer = window.setInterval(updateDate, 60 * 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return (
    <>

        <main className={styles.main}>
          <section className={styles.welcome}>
            <div>
              <h1>좋은 아침입니다, {profile.name}님 👋</h1>

              <p>
                오늘도 원내 인사 현황을 빠르게 확인하고, 처리가 필요한 업무를
                챙겨보세요.
              </p>
            </div>

            <div className={styles.today}>
              <small>오늘</small>
              <strong>{todayText || "날짜 불러오는 중..."}</strong>
            </div>
          </section>

          <section className={styles.summaryGrid}>
            {summaryCards.map((card) => (
              <article key={card.label} className={styles.summaryCard}>
                <div className={styles.summaryTop}>
                  <span className={styles.summaryIcon}>
                    {card.icon === "people" && "👥"}
                    {card.icon === "check" && "✓"}
                    {card.icon === "calendar" && "▣"}
                    {card.icon === "document" && "▤"}
                  </span>

                  <em className={styles[card.statusType]}>{card.status}</em>
                </div>

                <p>{card.label}</p>

                <h2>
                  {card.value}
                  <small>{card.unit}</small>
                </h2>
              </article>
            ))}
          </section>

          <section className={styles.middleGrid}>
            <article className={styles.panel}>
              <div className={styles.panelTitle}>
                <h2>월별 근태 현황</h2>
                <span>● 정상 출근율</span>
              </div>

              {/* 기존 차트 SVG 코드는 그대로 유지 */}
              <div className={styles.lineChart}>
                <svg viewBox="0 0 700 190" aria-hidden="true">
                  <defs>
                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#3a7bff"
                        stopOpacity="0.25"
                      />

                      <stop offset="100%" stopColor="#3a7bff" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  <path
                    d="M20 145 L90 125 L160 135 L230 95 L300 105 L370 70 L440 85 L510 48 L580 62 L650 36 L690 52 L690 180 L20 180 Z"
                    fill="url(#chartFill)"
                  />

                  <path
                    d="M20 145 L90 125 L160 135 L230 95 L300 105 L370 70 L440 85 L510 48 L580 62 L650 36 L690 52"
                    fill="none"
                    stroke="#2864ef"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelTitle}>
                <h2>결재 대기 안건</h2>
                <a href="/dashboard/approvals">전체보기 ›</a>
              </div>

              <ul className={styles.approvalList}>
                {approvalItems.map((item) => (
                  <li key={item.id}>
                    <span className={styles[item.color]} />

                    <p>{item.text}</p>
                    <em>{item.badge}</em>
                  </li>
                ))}
              </ul>
            </article>
          </section>

          {/* 기존 하단 패널 구조는 유지하고 배열만 Mock 데이터로 사용 */}
          <section className={styles.bottomGrid}>
            <article className={styles.panel}>
              <div className={styles.panelTitle}>
                <h2>오늘의 근무 현황</h2>
                <a href="#">전체보기 ›</a>
              </div>

              <div className={styles.attendanceList}>
                {attendanceList.map((row) => (
                  <div key={row.id}>
                    <span>{row.name.charAt(0)}</span>

                    <strong>{row.name}</strong>
                    <p>{row.dept}</p>
                    <time>{row.time}</time>

                    <em className={styles[row.statusType]}>{row.status}</em>
                  </div>
                ))}
              </div>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelTitle}>
                <h2>공지사항</h2>
                <a href="#">공지사항 작성 ›</a>
              </div>

              <ul className={styles.noticeList}>
                {notices.map((notice) => (
                  <li key={notice.id}>
                    <strong>{notice.title}</strong>
                    <time>{notice.date}</time>
                  </li>
                ))}
              </ul>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelTitle}>
                <h2>나의 결재함</h2>
                <a href="/dashboard/drafts">전체보기 ›</a>
              </div>

              <div className={styles.approvalStats}>
                <span>대기 {approvalCounts.waiting}</span>
                <span>승인 {approvalCounts.approved}</span>
                <span>반려 {approvalCounts.rejected}</span>
              </div>

              <ul className={styles.myApprovalList}>
                {myApprovals.map((item) => (
                  <li key={item.id}>
                    <div>
                      <strong>{item.title}</strong>
                      <small>
                        {item.author} · {item.date}
                      </small>
                    </div>

                    <em className={styles[item.statusType]}>{item.status}</em>
                  </li>
                ))}
              </ul>
            </article>
          </section>
        </main>
    </>
  );
}
