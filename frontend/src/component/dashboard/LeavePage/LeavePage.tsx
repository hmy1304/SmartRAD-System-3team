"use client";

import { useMemo, useState } from "react";

import styles from "./LeavePage.module.scss";

type LeaveType = "연차" | "반차 (오전)" | "반차 (오후)" | "병가";
type LeaveStatus = "승인대기" | "승인완료" | "반려";

interface LeaveRow {
  id: string;
  name: string;
  initial: string;
  position: string;
  department: string;
  tone: "blue" | "green" | "purple" | "orange" | "red";
  type: LeaveType;
  applyDate: string;
  period: string;
  days: string;
  remainBefore: string;
  remainAfter: string;
  proxy: string;
  approver: string;
  status: LeaveStatus;
  note: string;
}

const MOCK: LeaveRow[] = [
  {
    id: "1",
    name: "박서준",
    initial: "박",
    position: "영상의학과 · 부장",
    department: "영상의학과",
    tone: "blue",
    type: "연차",
    applyDate: "07.08",
    period: "07.14 ~ 07.15",
    days: "2일",
    remainBefore: "13일",
    remainAfter: "11일",
    proxy: "오하윤 과장",
    approver: "김관리",
    status: "승인완료",
    note: "—",
  },
  {
    id: "2",
    name: "이다영",
    initial: "이",
    position: "간호부 · 주임간호사",
    department: "간호부",
    tone: "green",
    type: "반차 (오후)",
    applyDate: "07.11",
    period: "07.15 (화) 오후",
    days: "0.5일",
    remainBefore: "6일",
    remainAfter: "5.5일",
    proxy: "최지은 과장",
    approver: "김관리",
    status: "승인대기",
    note: "",
  },
  {
    id: "3",
    name: "김민서",
    initial: "김",
    position: "진단검사의학과 · 사원",
    department: "진단검사의학과",
    tone: "orange",
    type: "연차",
    applyDate: "07.10",
    period: "07.21 ~ 07.25",
    days: "5일",
    remainBefore: "9일",
    remainAfter: "4일",
    proxy: "박서준 부장",
    approver: "김관리",
    status: "승인대기",
    note: "",
  },
  {
    id: "4",
    name: "신유나",
    initial: "신",
    position: "영상의학과 · 대리",
    department: "영상의학과",
    tone: "purple",
    type: "병가",
    applyDate: "07.09",
    period: "07.16 ~ 07.18",
    days: "3일",
    remainBefore: "진단서첨부",
    remainAfter: "",
    proxy: "오하윤 과장",
    approver: "김관리",
    status: "승인완료",
    note: "진단서 확인 완료",
  },
  {
    id: "5",
    name: "최지은",
    initial: "최",
    position: "인사총무팀 · 과장",
    department: "인사총무팀",
    tone: "red",
    type: "연차",
    applyDate: "07.11",
    period: "07.12 ~ 07.13",
    days: "2일",
    remainBefore: "1일",
    remainAfter: "-1일",
    proxy: "박서준 부장",
    approver: "—",
    status: "반려",
    note: "연차 초과 · 재신청 안내",
  },
  {
    id: "6",
    name: "정유진",
    initial: "정",
    position: "응급의학과 · 인턴",
    department: "응급의학과",
    tone: "orange",
    type: "반차 (오전)",
    applyDate: "07.11",
    period: "07.12 (토) 오전",
    days: "0.5일",
    remainBefore: "3일",
    remainAfter: "2.5일",
    proxy: "—",
    approver: "김관리",
    status: "승인완료",
    note: "—",
  },
  {
    id: "7",
    name: "배준혁",
    initial: "배",
    position: "원무과 · 주임",
    department: "원무과",
    tone: "orange",
    type: "연차",
    applyDate: "07.11",
    period: "07.28 ~ 07.30",
    days: "3일",
    remainBefore: "8일",
    remainAfter: "5일",
    proxy: "—",
    approver: "김관리",
    status: "승인대기",
    note: "",
  },
];

const FILTERS = ["전체", "승인대기", "승인완료", "반려"] as const;

export default function LeavePage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("전체");
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return MOCK.filter((row) => {
      const matchFilter =
        filter === "전체" ||
        (filter === "승인대기" && row.status === "승인대기") ||
        (filter === "승인완료" && row.status === "승인완료") ||
        (filter === "반려" && row.status === "반려");
      const matchKeyword =
        !keyword ||
        row.name.includes(keyword) ||
        row.department.includes(keyword);
      return matchFilter && matchKeyword;
    });
  }, [filter, keyword]);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map((r) => r.id));
  };

  return (
    <main className={styles.main}>
          {/* 페이지 헤더 */}
          <div className={styles.pageHeader}>
            <div>
              <h1>휴가 관리</h1>
              <p>
                직원의 연차·반차·병가 등 휴가 신청 현황을 조회하고 승인
                처리합니다.
              </p>
            </div>
            <div className={styles.pageActions}>
              <select className={styles.select} defaultValue="2026년">
                <option>2026년</option>
                <option>2025년</option>
              </select>
              <select className={styles.select} defaultValue="7월">
                <option>7월</option>
                <option>6월</option>
              </select>
              <select className={styles.select} defaultValue="전체 부서">
                <option>전체 부서</option>
                <option>영상의학과</option>
                <option>간호부</option>
              </select>
              <button type="button" className={styles.outlineBtn}>
                내보내기
              </button>
              <button type="button" className={styles.primaryBtn}>
                + 휴가 등록
              </button>
            </div>
          </div>

          {/* 요약 카드 */}
          <div className={styles.summaryRow}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryTop}>
                <label>전체 부여 연차</label>
                <span className={styles.iconGreen}>📋</span>
              </div>
              <p>
                26,208<span>일</span>
              </p>
              <small>● 1인 평균 12일</small>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryTop}>
                <label>사용 연차</label>
                <span className={styles.iconBlue}>📊</span>
              </div>
              <p>
                8,736<span>일</span>
              </p>
              <div className={styles.miniBar}>
                <div style={{ width: "33.3%" }} />
              </div>
              <small>33.3%</small>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryTop}>
                <label>잔여 연차</label>
                <span className={styles.iconTeal}>🏖</span>
              </div>
              <p>
                17,472<span>일</span>
              </p>
              <small>● 1인 평균 8일 잔여</small>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryTop}>
                <label>이번달 신청</label>
                <span className={styles.iconOrange}>⏱</span>
              </div>
              <p>
                247<span>건</span>
              </p>
              <small className={styles.warn}>● 승인대기 12건</small>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryTop}>
                <label>연차 소진 경고</label>
                <span className={styles.iconRed}>⚠</span>
              </div>
              <p className={styles.textRed}>
                38<span>명</span>
              </p>
              <small className={styles.danger}>● 잔여 2일 이하</small>
            </div>
          </div>

          {/* 본문: 테이블 + 사이드 패널 */}
          <div className={styles.contentLayout}>
            <section className={styles.tableCard}>
              {/* 툴바 */}
              <div className={styles.toolbar}>
                <div className={styles.filterTabs}>
                  {FILTERS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      className={filter === f ? styles.filterActive : ""}
                      onClick={() => setFilter(f)}
                    >
                      {f}
                      {f === "승인대기" && (
                        <span className={styles.badge}>12</span>
                      )}
                    </button>
                  ))}
                </div>
                <div className={styles.toolbarRight}>
                  <input
                    className={styles.searchInput}
                    placeholder="직원명 검색"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                  <select className={styles.select} defaultValue="유형 전체">
                    <option>유형 전체</option>
                    <option>연차</option>
                    <option>반차</option>
                    <option>병가</option>
                  </select>
                  <button type="button" className={styles.batchBtn}>
                    ✓ 선택 일괄 승인
                  </button>
                </div>
              </div>

              {/* 가로 스크롤 테이블 */}
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.checkCol}>
                        <input
                          type="checkbox"
                          checked={
                            selected.length === filtered.length &&
                            filtered.length > 0
                          }
                          onChange={toggleAll}
                        />
                      </th>
                      <th>직원</th>
                      <th>부서</th>
                      <th>휴가 유형</th>
                      <th>신청일</th>
                      <th>휴가 기간</th>
                      <th>일수</th>
                      <th>잔여 연차</th>
                      <th>대리인</th>
                      <th>승인자</th>
                      <th>처리 상태</th>
                      <th>비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => (
                      <tr
                        key={row.id}
                        className={
                          row.status === "반려" ? styles.rowReject : ""
                        }
                      >
                        <td className={styles.checkCol}>
                          <input
                            type="checkbox"
                            checked={selected.includes(row.id)}
                            onChange={() => toggleSelect(row.id)}
                          />
                        </td>
                        <td>
                          <div className={styles.person}>
                            <span
                              className={`${styles.avatar} ${styles[row.tone]}`}
                            >
                              {row.initial}
                            </span>
                            <div>
                              <strong>{row.name}</strong>
                              <small>{row.position}</small>
                            </div>
                          </div>
                        </td>
                        <td>{row.department}</td>
                        <td>
                          <span
                            className={`${styles.typeBadge} ${
                              row.type.startsWith("연차")
                                ? styles.typeAnnual
                                : row.type.startsWith("반차")
                                  ? styles.typeHalf
                                  : styles.typeSick
                            }`}
                          >
                            {row.type}
                          </span>
                        </td>
                        <td>{row.applyDate}</td>
                        <td className={styles.periodCell}>{row.period}</td>
                        <td>{row.days}</td>
                        <td>
                          {row.remainAfter ? (
                            <span className={styles.remainCell}>
                              {row.remainBefore}
                              <span>→</span>
                              {row.remainAfter}
                            </span>
                          ) : (
                            <span className={styles.remainSpecial}>
                              {row.remainBefore}
                            </span>
                          )}
                        </td>
                        <td>{row.proxy}</td>
                        <td>
                          {row.approver !== "—" ? (
                            <span className={styles.approver}>
                              <span className={styles.approverAvatar}>김</span>
                              {row.approver}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${
                              row.status === "승인완료"
                                ? styles.statusDone
                                : row.status === "승인대기"
                                  ? styles.statusWait
                                  : styles.statusReject
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td>
                          {row.status === "승인대기" ? (
                            <div className={styles.actionBtns}>
                              <button
                                type="button"
                                className={styles.approveBtn}
                              >
                                ✓ 승인
                              </button>
                              <button
                                type="button"
                                className={styles.rejectBtn}
                              >
                                × 반려
                              </button>
                            </div>
                          ) : (
                            <span className={styles.note}>{row.note}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 오른쪽 패널 */}
            <aside className={styles.sidePanel}>
              <div className={styles.panelCard}>
                <h3>유형별 신청 현황</h3>
                <div className={styles.typeStats}>
                  <div className={styles.typeStat}>
                    <span className={styles.dotGreen} /> 연차
                    <strong>189건</strong>
                    <div className={styles.statBar}>
                      <div style={{ width: "76.5%", background: "#35d59a" }} />
                    </div>
                    <em>76.5%</em>
                  </div>
                  <div className={styles.typeStat}>
                    <span className={styles.dotBlue} /> 반차
                    <strong>32건</strong>
                    <div className={styles.statBar}>
                      <div style={{ width: "13%", background: "#3a7bff" }} />
                    </div>
                    <em>13.0%</em>
                  </div>
                  <div className={styles.typeStat}>
                    <span className={styles.dotPurple} /> 병가
                    <strong>18건</strong>
                    <div className={styles.statBar}>
                      <div style={{ width: "7.3%", background: "#a78bfa" }} />
                    </div>
                    <em>7.3%</em>
                  </div>
                  <div className={styles.typeStat}>
                    <span className={styles.dotOrange} /> 기타
                    <strong>8건</strong>
                    <div className={styles.statBar}>
                      <div style={{ width: "3.2%", background: "#fb923c" }} />
                    </div>
                    <em>3.2%</em>
                  </div>
                </div>
              </div>

              <div className={styles.panelCard}>
                <div className={styles.panelTitleRow}>
                  <h3>⚠ 연차 소진 위험</h3>
                  <span className={styles.dangerBadge}>38명</span>
                </div>
                <p className={styles.panelDesc}>
                  잔여 연차 2일 이하인 직원입니다.
                </p>
                <div className={styles.riskList}>
                  <div className={styles.riskItem}>
                    <span className={`${styles.avatar} ${styles.red}`}>최</span>
                    <div>
                      <strong>최지은</strong>
                      <small>인사총무팀</small>
                    </div>
                    <span className={styles.riskDays}>잔여 1일</span>
                  </div>
                  <div className={styles.riskItem}>
                    <span className={`${styles.avatar} ${styles.orange}`}>
                      배
                    </span>
                    <div>
                      <strong>배준혁</strong>
                      <small>원무과</small>
                    </div>
                    <span className={styles.riskDays}>잔여 2일</span>
                  </div>
                  <div className={styles.riskItem}>
                    <span className={`${styles.avatar} ${styles.orange}`}>
                      정
                    </span>
                    <div>
                      <strong>정유진</strong>
                      <small>응급의학과</small>
                    </div>
                    <span className={styles.riskDays}>잔여 2일</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
  );
}
