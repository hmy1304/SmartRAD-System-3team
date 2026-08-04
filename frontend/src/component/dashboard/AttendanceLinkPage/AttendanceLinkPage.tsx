"use client";

import { useState, useEffect, useMemo, Fragment } from "react";

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

// 캘린더용 7월 시작 요일 (2026-07-01 = 수요일 → 앞에 빈칸 3개)
const DAYS_IN_MONTH = 31;
const CAL_START_OFFSET = 3;
const CAL_DAYS = Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1);

export default function AttendanceLinkPage() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(23);
  const [keyword, setKeyword] = useState("");
  const [selectedDept, setSelectedDept] = useState("부서 전체");
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    setLoading(true);
    fetch(`/api/v1/attendance/summary?year=${currentYear}&month=${currentMonth}`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((resData) => {
        setData(Array.isArray(resData) ? resData : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch attendance summary:", err);
        setData([]);
        setLoading(false);
      });
  }, [currentYear, currentMonth]);

  const departments = useMemo(() => {
    const depts = new Set(data.map((d) => d.department));
    return ["부서 전체", ...Array.from(depts)];
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter(
      (e) =>
        (!keyword ||
          e.name.includes(keyword) ||
          e.department.includes(keyword) ||
          e.empNo.toLowerCase().includes(keyword.toLowerCase())) &&
        (selectedDept === "부서 전체" || e.department === selectedDept)
    );
  }, [data, keyword, selectedDept]);

  // 요약 수치 계산 로직
  const totalEmp = data.length;
  const normalCnt = data.filter(e => e.attend > 0).length; // 출근이력이 1일이라도 있으면
  const lateCnt = data.filter(e => e.late > 0).length;
  const absentCnt = data.filter(e => e.absent > 0).length;
  const leaveCnt = data.filter(e => e.leave > 0).length;
  const normalPercent = totalEmp > 0 ? ((normalCnt / totalEmp) * 100).toFixed(1) : "0.0";

  // 달력 일별 상세 현황 로직
  const dailyStats = useMemo(() => {
    let normal = 0;
    let late = 0;
    let absent = 0;
    let leave = 0;
    data.forEach(e => {
      const status = e.days[selectedDay - 1];
      if (status === "normal") normal++;
      else if (status === "late") late++;
      else if (status === "absent") absent++;
      else if (status === "leave") leave++;
    });
    return { normal, late, absent, leave };
  }, [data, selectedDay]);

  // 페이지네이션
  const ITEMS_PER_PAGE = 15;
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentItems = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(prev => prev - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(prev => prev + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // 탭 활성화 상태 계산 및 네비게이션 상수
  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth() + 1;

  let lastYear = thisYear;
  let lastMonth = thisMonth - 1;
  if (lastMonth === 0) {
    lastMonth = 12;
    lastYear -= 1;
  }

  let twoMonthsAgoYear = thisYear;
  let twoMonthsAgoMonth = thisMonth - 2;
  if (twoMonthsAgoMonth <= 0) {
    twoMonthsAgoMonth += 12;
    twoMonthsAgoYear -= 1;
  }

  const isThisMonth = currentYear === thisYear && currentMonth === thisMonth;
  const isLastMonth = currentYear === lastYear && currentMonth === lastMonth;
  const isCustomMonth = !isThisMonth && !isLastMonth;

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
                <button type="button" onClick={handlePrevMonth}>‹</button>
                <span>{currentYear}년 {currentMonth}월</span>
                <button type="button" onClick={handleNextMonth}>›</button>
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
            <button 
              type="button" 
              className={isThisMonth ? styles.topTabActive : styles.topTab}
              onClick={() => {
                setCurrentYear(thisYear);
                setCurrentMonth(thisMonth);
              }}
            >
              이번달 근태 
            </button>
            <button 
              type="button" 
              className={isLastMonth ? styles.topTabActive : styles.topTab}
              onClick={() => {
                setCurrentYear(lastYear);
                setCurrentMonth(lastMonth);
              }}
            >
              지난달 근태
            </button>
            <button 
              type="button" 
              className={isCustomMonth ? styles.topTabActive : styles.topTab}
              onClick={() => {
                if (!isCustomMonth) {
                  setCurrentYear(twoMonthsAgoYear);
                  setCurrentMonth(twoMonthsAgoMonth);
                }
              }}
            >
              지정 조회
            </button>
          </div>

          {/* 요약 카드 */}
          <div className={styles.summaryRow}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>👥</div>
              <div>
                <label>전체 직원</label>
                <p>
                  {totalEmp.toLocaleString()}<span>명</span>
                </p>
                <small>{currentMonth}월 근무 대상 전원</small>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={`${styles.summaryIcon} ${styles.iconGreen}`}>
                ✓
              </div>
              <div>
                <label>정상 출근 이력자</label>
                <p>
                  {normalCnt.toLocaleString()}<span>명</span>
                </p>
                <div className={styles.miniBar}>
                  <div style={{ width: `${normalPercent}%` }} />
                </div>
                <small>전체 대비 {normalPercent}%</small>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={`${styles.summaryIcon} ${styles.iconOrange}`}>
                ⚠
              </div>
              <div>
                <label>결근 / 지각 이력자</label>
                <p className={styles.textOrange}>
                  {(lateCnt + absentCnt).toLocaleString()}<span>명</span>
                </p>
                <small>결근 {absentCnt}명 · 지각 {lateCnt}명</small>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={`${styles.summaryIcon} ${styles.iconBlue}`}>
                🏖
              </div>
              <div>
                <label>휴가 이력자</label>
                <p className={styles.textBlue}>
                  {leaveCnt.toLocaleString()}<span>명</span>
                </p>
                <small>연차 등 사용</small>
              </div>
            </div>
          </div>

          {/* 하단 레이아웃: 캘린더 + 테이블 */}
          <div className={styles.contentLayout}>
            {/* 왼쪽: 캘린더 + 오늘 현황 */}
            <aside className={styles.leftPanel}>
              <div className={styles.calendarCard}>
                <div className={styles.calHeader}>
                  <strong>📅 {currentYear}년 {currentMonth}월</strong>
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
                    </button>
                  ))}
                </div>
                <div className={styles.calLegend}>
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '10px', textAlign: 'center' }}>
                    ※ 날짜를 클릭하면 해당 일자의 상세 현황을 볼 수 있습니다.
                  </p>
                </div>
              </div>

              <div className={styles.todayCard}>
                <div className={styles.todayHeader}>
                  <strong>일별 상세 현황</strong>
                  <span>{currentMonth}월 {selectedDay}일</span>
                </div>
                <div className={styles.todayList}>
                  <div>
                    <span className={styles.dotNormal} /> 정상 출근{" "}
                    <strong>{dailyStats.normal}명</strong>
                  </div>
                  <div>
                    <span className={styles.dotLate} /> 지각{" "}
                    <strong>{dailyStats.late}명</strong>
                  </div>
                  <div>
                    <span className={styles.dotAbsent} /> 결근{" "}
                    <strong>{dailyStats.absent}명</strong>
                  </div>
                  <div>
                    <span className={styles.dotLeave} /> 휴가{" "}
                    <strong>{dailyStats.leave}명</strong>
                  </div>
                </div>
              </div>
            </aside>

            {/* 오른쪽: 직원 근태 현황 */}
            <section className={styles.tableCard}>
              <div className={styles.tableHeader}>
                <div>
                  <h3>직원 근태 현황</h3>
                  <p>{currentYear}년 {currentMonth}월 · 전 직원 일별 출근 현황</p>
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
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
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
                    {currentItems.map((emp) => (
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
                  <span>총 {totalEmp.toLocaleString()}명</span>
                  <span className={styles.dotNormal} /> 출근 이력자 {normalCnt}명
                  <span className={styles.dotLate} /> 지각 이력자 {lateCnt}명
                  <span className={styles.dotAbsent} /> 결근 이력자 {absentCnt}명
                  <span className={styles.dotLeave} /> 휴가 이력자 {leaveCnt}명
                </div>
                <div className={styles.pagination}>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(currentPage - p) <= 2
                    )
                    .map((p, index, arr) => (
                      <Fragment key={p}>
                        {index > 0 && arr[index - 1] !== p - 1 && (
                          <span>…</span>
                        )}
                        <button
                          type="button"
                          className={currentPage === p ? styles.pageActive : ""}
                          onClick={() => setCurrentPage(p)}
                        >
                          {p}
                        </button>
                      </Fragment>
                    ))}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    ›
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
  );
}
