"use client";

import { useState } from "react";

import styles from "./AttendanceLinkPage.module.scss";

type DayStatus = "normal" | "late" | "absent" | "leave" | "planned" | "empty";

interface EmployeeRow {
  id: string;
  name: string;
  initial: string;
  empNo: string;
  department: string;
  tone: "blue" | "light_blue" | "green" | "purple" | "orange" | "red";
  days: DayStatus[]; // 1~31
  attend: number;
  late: number;
  absent: number;
  leave: number;
}

const DAYS_IN_MONTH = 31;

const MOCK: EmployeeRow[] = [
  {
    id: "1",
    name: "박서준",
    initial: "박",
    empNo: "EMP-20191",
    department: "영상의학과",
    tone: "blue",
    days: Array(31)
      .fill("normal")
      .map((v, i) => (i === 12 || i === 13 ? "leave" : v)),
    attend: 20,
    late: 0,
    absent: 0,
    leave: 2,
  },
  {
    id: "2",
    name: "오하윤",
    initial: "오",
    empNo: "EMP-20733",
    department: "영상의학과",
    tone: "green",
    days: Array(31)
      .fill("normal")
      .map((v, i) => (i === 8 ? "late" : v)),
    attend: 21,
    late: 1,
    absent: 0,
    leave: 0,
  },
  {
    id: "3",
    name: "신유나",
    initial: "신",
    empNo: "EMP-21098",
    department: "영상의학과",
    tone: "purple",
    days: Array(31)
      .fill("normal")
      .map((v, i) => {
        if (i === 15) return "absent";
        if (i === 20 || i === 21) return "leave";
        return v;
      }),
    attend: 18,
    late: 0,
    absent: 1,
    leave: 2,
  },
  {
    id: "4",
    name: "배준혁",
    initial: "배",
    empNo: "EMP-21455",
    department: "원무과",
    tone: "orange",
    days: Array(31).fill("leave"),
    attend: 0,
    late: 0,
    absent: 0,
    leave: 22,
  },
  {
    id: "5",
    name: "최지은",
    initial: "최",
    empNo: "EMP-21890",
    department: "인사총무팀",
    tone: "red",
    days: Array(31)
      .fill("normal")
      .map((v, i) => (i === 5 ? "late" : v)),
    attend: 21,
    late: 1,
    absent: 0,
    leave: 0,
  },
  {
    id: "6",
    name: "이다영",
    initial: "이",
    empNo: "EMP-22104",
    department: "간호부",
    tone: "light_blue",
    days: Array(31).fill("normal"),
    attend: 22,
    late: 0,
    absent: 0,
    leave: 0,
  },
  {
    id: "7",
    name: "김민서",
    initial: "김",
    empNo: "EMP-24512",
    department: "진단검사의학과",
    tone: "green",
    days: Array(31)
      .fill("normal")
      .map((v, i) => (i === 18 ? "absent" : v)),
    attend: 20,
    late: 0,
    absent: 1,
    leave: 0,
  },
  {
    id: "8",
    name: "정유진",
    initial: "정",
    empNo: "EMP-26001",
    department: "응급의학과",
    tone: "orange",
    days: Array(31)
      .fill("normal")
      .map((v, i) => (i === 3 || i === 10 ? "late" : v)),
    attend: 20,
    late: 2,
    absent: 0,
    leave: 0,
  },
];

// 캘린더용 7월 시작 요일 (2026-07-01 = 수요일 → 앞에 빈칸 3개)
const CAL_START_OFFSET = 3;
const CAL_DAYS = Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1);

export default function AttendanceLinkPage() {
  const [selectedDay, setSelectedDay] = useState(23);
  const [keyword, setKeyword] = useState("");

  const filtered = MOCK.filter(
    (e) =>
      !keyword ||
      e.name.includes(keyword) ||
      e.department.includes(keyword) ||
      e.empNo.toLowerCase().includes(keyword.toLowerCase()),
  );

  return (
    <main className={styles.main}>
          {/* 페이지 헤더 */}
          <div className={styles.pageHeader}>
            <div>
              <h1>근태 연동</h1>
              <p>
                전 직원 월별 근태 현황을 통합 관리합니다. 출근·결근·지각·휴가를
                한 곳에서 확인하세요.
              </p>
            </div>
            <div className={styles.pageActions}>
              <div className={styles.monthNav}>
                <button type="button">‹</button>
                <span>2026년 7월</span>
                <button type="button">›</button>
              </div>
              <button type="button" className={styles.outlineBtn}>
                엑셀 내보내기
              </button>
              <button type="button" className={styles.primaryBtn}>
                근태 보고서 출력
              </button>
            </div>
          </div>

          {/* 탭 */}
          <div className={styles.topTabs}>
            <button type="button" className={styles.topTabActive}>
              이번달 근태 <span>2026년 7월</span>
            </button>
            <button type="button" className={styles.topTab}>
              지난달 근태
            </button>
            <button type="button" className={styles.topTab}>
              급여 계산용
            </button>
          </div>

          {/* 요약 카드 */}
          <div className={styles.summaryRow}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>👥</div>
              <div>
                <label>전체 직원</label>
                <p>
                  2,184<span>명</span>
                </p>
                <small>7월 근무 대상 전원</small>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={`${styles.summaryIcon} ${styles.iconGreen}`}>
                ✓
              </div>
              <div>
                <label>정상 출근</label>
                <p>
                  2,089<span>명</span>
                </p>
                <div className={styles.miniBar}>
                  <div style={{ width: "95.6%" }} />
                </div>
                <small>전체 대비 95.6%</small>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={`${styles.summaryIcon} ${styles.iconOrange}`}>
                ⚠
              </div>
              <div>
                <label>결근 / 지각</label>
                <p className={styles.textOrange}>
                  57<span>확인 필요</span>
                </p>
                <small>결근 12명 · 지각 45명</small>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={`${styles.summaryIcon} ${styles.iconBlue}`}>
                🏖
              </div>
              <div>
                <label>휴가 중</label>
                <p className={styles.textBlue}>
                  38<span>명</span>
                </p>
                <small>연차 29 · 병가 6 · 기타 3</small>
              </div>
            </div>
          </div>

          {/* 하단 레이아웃: 캘린더 + 테이블 */}
          <div className={styles.contentLayout}>
            {/* 왼쪽: 캘린더 + 오늘 현황 */}
            <aside className={styles.leftPanel}>
              <div className={styles.calendarCard}>
                <div className={styles.calHeader}>
                  <strong>📅 2026년 7월</strong>
                  <span className={styles.calBadge}>이번달</span>
                </div>
                <div className={styles.calWeekdays}>
                  {["일", "월", "화", "수", "목", "금", "토"].map((w) => (
                    <span key={w}>{w}</span>
                  ))}
                </div>
                <div className={styles.calGrid}>
                  {Array.from({ length: CAL_START_OFFSET }).map((_, i) => (
                    <span key={`e${i}`} className={styles.calEmpty} />
                  ))}
                  {CAL_DAYS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`${styles.calDay} ${selectedDay === d ? styles.calDayActive : ""}`}
                      onClick={() => setSelectedDay(d)}
                    >
                      {d}
                      {/* 예시 점 */}
                      {d === 8 || d === 15 ? (
                        <i className={styles.dotLate} />
                      ) : null}
                      {d === 12 || d === 13 ? (
                        <i className={styles.dotLeave} />
                      ) : null}
                      {d === 23 ? <i className={styles.dotNormal} /> : null}
                    </button>
                  ))}
                </div>
                <div className={styles.calLegend}>
                  <span>
                    <i className={styles.dotNormal} /> 정상
                  </span>
                  <span>
                    <i className={styles.dotLate} /> 지각
                  </span>
                  <span>
                    <i className={styles.dotAbsent} /> 결근
                  </span>
                  <span>
                    <i className={styles.dotLeave} /> 휴가
                  </span>
                  <span>
                    <i className={styles.dotPlanned} /> 예정
                  </span>
                </div>
              </div>

              <div className={styles.todayCard}>
                <div className={styles.todayHeader}>
                  <strong>오늘 현황</strong>
                  <span>07월 23일 (수)</span>
                </div>
                <div className={styles.todayList}>
                  <div>
                    <span className={styles.dotNormal} /> 정상 출근{" "}
                    <strong>2,089명</strong>
                  </div>
                  <div>
                    <span className={styles.dotLate} /> 지각{" "}
                    <strong>45명</strong>
                  </div>
                  <div>
                    <span className={styles.dotAbsent} /> 결근{" "}
                    <strong>12명</strong>
                  </div>
                  <div>
                    <span className={styles.dotLeave} /> 휴가{" "}
                    <strong>38명</strong>
                  </div>
                </div>
              </div>
            </aside>

            {/* 오른쪽: 직원 근태 현황 */}
            <section className={styles.tableCard}>
              <div className={styles.tableHeader}>
                <div>
                  <h3>직원 근태 현황</h3>
                  <p>2026년 7월 · 전 직원 일별 출근 현황</p>
                </div>
                <div className={styles.tableActions}>
                  <input
                    className={styles.searchInput}
                    placeholder="직원 검색"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                  <select
                    className={styles.deptSelect}
                    defaultValue="부서 전체"
                  >
                    <option>부서 전체</option>
                    <option>영상의학과</option>
                    <option>간호부</option>
                    <option>원무과</option>
                  </select>
                </div>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.colName}>직원명</th>
                      <th className={styles.colDept}>부서</th>
                      <th className={styles.colDays}>
                        이번달 근태 현황 (1일 ~ 30일, 총 22 근무일)
                      </th>
                      <th>출근</th>
                      <th>지각</th>
                      <th>결근</th>
                      <th>휴가</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((emp) => (
                      <tr key={emp.id}>
                        <td className={styles.colName}>
                          <div className={styles.person}>
                            <span
                              className={`${styles.avatar} ${styles[emp.tone]}`}
                            >
                              {emp.initial}
                            </span>
                            <div>
                              <strong>{emp.name}</strong>
                              <small>{emp.empNo}</small>
                            </div>
                          </div>
                        </td>
                        <td className={styles.colDept}>{emp.department}</td>
                        <td className={styles.colDays}>
                          <div className={styles.dayBars}>
                            {emp.days.map((s, i) => (
                              <span
                                key={i}
                                className={`${styles.dayBar} ${styles[`bar_${s}`]}`}
                                title={`${i + 1}일`}
                              />
                            ))}
                          </div>
                        </td>
                        <td className={styles.numCell}>{emp.attend}</td>
                        <td
                          className={`${styles.numCell} ${emp.late > 0 ? styles.textOrange : ""}`}
                        >
                          {emp.late || "0"}
                        </td>
                        <td
                          className={`${styles.numCell} ${emp.absent > 0 ? styles.textRed : ""}`}
                        >
                          {emp.absent || "0"}
                        </td>
                        <td
                          className={`${styles.numCell} ${emp.leave > 0 ? styles.textBlue : ""}`}
                        >
                          {emp.leave || "0"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={styles.tableFooter}>
                <div className={styles.footerLegend}>
                  <span>총 2,184명</span>
                  <span className={styles.dotNormal} /> 출근 2,089명
                  <span className={styles.dotLate} /> 지각 45명
                  <span className={styles.dotAbsent} /> 결근 12명
                  <span className={styles.dotLeave} /> 휴가 38명
                </div>
                <div className={styles.pagination}>
                  <button type="button">‹</button>
                  <button type="button" className={styles.pageActive}>
                    1
                  </button>
                  <button type="button">2</button>
                  <button type="button">3</button>
                  <span>…</span>
                  <button type="button">274</button>
                  <button type="button">›</button>
                </div>
              </div>
            </section>
          </div>
        </main>
  );
}
