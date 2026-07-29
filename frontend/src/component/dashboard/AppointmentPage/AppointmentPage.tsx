"use client";

import { useMemo, useState } from "react";

import styles from "./AppointmentPage.module.scss";

type AppointmentType = "승진" | "전보" | "보직변경";
type AppointmentStatus = "완료" | "처리중" | "대기";

interface AppointmentItem {
  id: string;
  type: AppointmentType;
  name: string;
  initial: string;
  tone: "blue" | "green" | "purple" | "orange" | "red";
  fromDept: string;
  fromPosition: string;
  toDept: string;
  toPosition: string;
  date: string;
  status: AppointmentStatus;
}

const MOCK_DATA: AppointmentItem[] = [
  {
    id: "TR-2026-024",
    type: "승진",
    name: "박서준",
    initial: "박",
    tone: "blue",
    fromDept: "영상의학과",
    fromPosition: "과장",
    toDept: "영상의학과",
    toPosition: "부장",
    date: "2026.07.01",
    status: "완료",
  },
  {
    id: "TR-2026-023",
    type: "전보",
    name: "오하윤",
    initial: "오",
    tone: "green",
    fromDept: "간호부",
    fromPosition: "과장",
    toDept: "영상의학과",
    toPosition: "과장",
    date: "2026.07.05",
    status: "완료",
  },
  {
    id: "TR-2026-022",
    type: "보직변경",
    name: "신유나",
    initial: "신",
    tone: "purple",
    fromDept: "응급의학과",
    fromPosition: "대리",
    toDept: "영상의학과",
    toPosition: "대리",
    date: "2026.07.08",
    status: "처리중",
  },
  {
    id: "TR-2026-021",
    type: "승진",
    name: "배준혁",
    initial: "배",
    tone: "orange",
    fromDept: "원무과",
    fromPosition: "주임",
    toDept: "원무과",
    toPosition: "대리",
    date: "2026.07.10",
    status: "대기",
  },
  {
    id: "TR-2026-020",
    type: "전보",
    name: "최지은",
    initial: "최",
    tone: "red",
    fromDept: "시설관리팀",
    fromPosition: "과장",
    toDept: "인사총무팀",
    toPosition: "과장",
    date: "2026.07.12",
    status: "대기",
  },
];

const FILTERS = ["전체", "승진", "전보", "보직변경"] as const;

export default function AppointmentPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("전체");
  const [keyword, setKeyword] = useState("");

  const filtered = useMemo(() => {
    return MOCK_DATA.filter((item) => {
      const matchFilter = filter === "전체" || item.type === filter;
      const matchKeyword =
        !keyword ||
        item.name.includes(keyword) ||
        item.type.includes(keyword) ||
        item.id.toLowerCase().includes(keyword.toLowerCase());
      return matchFilter && matchKeyword;
    });
  }, [filter, keyword]);

  return (
    <main className={styles.main}>
          {/* 페이지 헤더 */}
          <div className={styles.pageHeader}>
            <div>
              <h1>인사발령 관리</h1>
              <p>직원의 부서 이동, 직책 변경, 승진 발령 내역을 관리합니다.</p>
            </div>
            <div className={styles.pageActions}>
              <button type="button" className={styles.outlineBtn}>
                내보내기
              </button>
              <button type="button" className={styles.primaryBtn}>
                + 발령 등록
              </button>
            </div>
          </div>

          {/* 요약 카드 */}
          <div className={styles.summaryRow}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIconBlue}>
                {/* 이번달 발령 - 원형 화살표 / 문서 */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 1l4 4-4 4" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <path d="M7 23l-4-4 4-4" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
              </div>
              <div>
                <label>이번달 발령</label>
                <p>
                  24<span>건</span>
                </p>
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryIconGreen}>
                {/* 승진 발령 - 상승 차트 */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 17l6-6 4 4 8-8" />
                  <path d="M17 7h4v4" />
                </svg>
              </div>
              <div>
                <label>승진 발령</label>
                <p>
                  8<span>건</span>
                </p>
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryIconOrange}>
                {/* 전보 발령 - 오른쪽 화살표 */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14" />
                  <path d="M13 6l6 6-6 6" />
                </svg>
              </div>
              <div>
                <label>전보 발령</label>
                <p>
                  11<span>건</span>
                </p>
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryIconPurple}>
                {/* 보직 변경 - 태그 */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </div>
              <div>
                <label>보직 변경</label>
                <p>
                  5<span>건</span>
                </p>
              </div>
            </div>
          </div>

          {/* 테이블 영역 */}
          <section className={styles.tableCard}>
            <div className={styles.tableToolbar}>
              <div className={styles.filterTabs}>
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={filter === f ? styles.filterActive : ""}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className={styles.tableSearch}>
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="직원명·발령 유형 검색"
                />
              </div>
            </div>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>발령번호</th>
                  <th>발령 유형</th>
                  <th>대상 직원</th>
                  <th>이전 부서/직위</th>
                  <th>변경 부서/직위</th>
                  <th>발령일</th>
                  <th>상태</th>
                  <th>처리</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td className={styles.idCell}>{item.id}</td>
                    <td>
                      <span
                        className={`${styles.typeBadge} ${
                          item.type === "승진"
                            ? styles.typePromote
                            : item.type === "전보"
                              ? styles.typeTransfer
                              : styles.typePosition
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td>
                      <div className={styles.person}>
                        <span
                          className={`${styles.avatar} ${styles[item.tone]}`}
                        >
                          {item.initial}
                        </span>
                        {item.name}
                      </div>
                    </td>
                    <td>
                      {item.fromDept} / {item.fromPosition}
                    </td>
                    <td className={styles.toCell}>
                      {item.toDept} / {item.toPosition}
                    </td>
                    <td>{item.date}</td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          item.status === "완료"
                            ? styles.statusDone
                            : item.status === "처리중"
                              ? styles.statusProgress
                              : styles.statusWait
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button type="button" className={styles.moreBtn}>
                        ···
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>
  );
}
