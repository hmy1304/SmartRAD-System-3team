"use client";

import { useState } from "react";

import styles from "./DutyPage.module.scss";

type Shift = "D" | "E" | "N" | "OFF" | "AL" | "";

interface EmployeeDuty {
  id: string;
  name: string;
  initial: string;
  position: string;
  tone: "blue" | "green" | "purple" | "orange";
  shifts: Shift[]; // 1~31일
  summary: { d: number; e: number; n: number; off: number };
}

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const WEEKDAYS = ["수", "목", "금", "토", "일", "월", "화"]; // 2026년 7월 1일 = 수요일 기준 예시

const MOCK_EMPLOYEES: EmployeeDuty[] = [
  {
    id: "1",
    name: "박서준",
    initial: "박",
    position: "부장",
    tone: "blue",
    shifts: [
      "D",
      "E",
      "D",
      "OFF",
      "OFF",
      "D",
      "N",
      "N",
      "D",
      "E",
      "OFF",
      "D",
      "AL",
      "D",
      "E",
      "D",
      "OFF",
      "OFF",
      "D",
      "N",
      "N",
      "D",
      "E",
      "OFF",
      "OFF",
      "D",
      "D",
      "E",
      "N",
      "OFF",
      "OFF",
    ],
    summary: { d: 11, e: 5, n: 5, off: 10 },
  },
  {
    id: "2",
    name: "오하윤",
    initial: "오",
    position: "과장",
    tone: "green",
    shifts: [
      "E",
      "D",
      "N",
      "OFF",
      "OFF",
      "E",
      "D",
      "D",
      "N",
      "OFF",
      "OFF",
      "E",
      "D",
      "D",
      "N",
      "E",
      "D",
      "N",
      "OFF",
      "OFF",
      "E",
      "D",
      "D",
      "N",
      "OFF",
      "OFF",
      "E",
      "D",
      "N",
      "OFF",
      "D",
    ],
    summary: { d: 9, e: 6, n: 6, off: 10 },
  },
  {
    id: "3",
    name: "신유나",
    initial: "신",
    position: "대리",
    tone: "purple",
    shifts: [
      "N",
      "N",
      "D",
      "OFF",
      "OFF",
      "E",
      "D",
      "N",
      "N",
      "D",
      "",
      "",
      "E",
      "D",
      "D",
      "N",
      "E",
      "OFF",
      "OFF",
      "D",
      "E",
      "N",
      "N",
      "D",
      "OFF",
      "OFF",
      "AL",
      "D",
      "E",
      "N",
      "OFF",
    ],
    summary: { d: 8, e: 5, n: 8, off: 8 },
  },
  {
    id: "4",
    name: "배준혁",
    initial: "배",
    position: "주임",
    tone: "orange",
    shifts: [
      "D",
      "OFF",
      "E",
      "OFF",
      "OFF",
      "D",
      "D",
      "N",
      "D",
      "N",
      "OFF",
      "OFF",
      "E",
      "D",
      "E",
      "D",
      "OFF",
      "OFF",
      "D",
      "N",
      "N",
      "D",
      "E",
      "OFF",
      "OFF",
      "D",
      "D",
      "E",
      "N",
      "D",
      "OFF",
    ],
    summary: { d: 12, e: 5, n: 5, off: 9 },
  },
];

// 일별 D 근무 인원 수 (하단 요약)
const DAILY_D_COUNT = [
  2, 1, 2, 0, 0, 2, 3, 1, 2, 1, 0, 0, 2, 3, 2, 1, 2, 0, 0, 1, 2, 0, 2, 2, 1, 0,
  1, 2, 3, 0, 1,
];

export default function DutyPage() {
  const [month] = useState("2026년 7월");

  return (
    <main className={styles.main}>
          {/* 페이지 헤더 */}
          <div className={styles.pageHeader}>
            <div>
              <h1>듀티표 편성</h1>
              <p>부서별 월간 근무 스케줄을 편성하고 관리합니다.</p>
            </div>
            <div className={styles.pageActions}>
              <div className={styles.monthNav}>
                <button type="button">‹</button>
                <span>{month}</span>
                <button type="button">›</button>
              </div>
              <select className={styles.deptSelect} defaultValue="영상의학과">
                <option>영상의학과</option>
                <option>간호부</option>
                <option>진단검사의학과</option>
              </select>
              <button type="button" className={styles.outlineBtn}>
                인쇄
              </button>
              <button type="button" className={styles.primaryBtn}>
                듀티표 발행
              </button>
            </div>
          </div>

          {/* 범례 + 인원 요약 */}
          <div className={styles.legendBar}>
            <div className={styles.legend}>
              <span>
                <i className={styles.legD} /> D 주간
              </span>
              <span>
                <i className={styles.legE} /> E 오후
              </span>
              <span>
                <i className={styles.legN} /> N 야간
              </span>
              <span>
                <i className={styles.legOff} /> OFF 휴무
              </span>
              <span>
                <i className={styles.legAl} /> AL 연차
              </span>
            </div>
            <div className={styles.headcount}>
              <span>총 총 12명</span>
              <span className={styles.remain}>잔여 1명</span>
            </div>
          </div>

          {/* 듀티 테이블 */}
          <div className={styles.tableWrap}>
            <table className={styles.dutyTable}>
              <thead>
                <tr>
                  <th className={styles.stickyCol}>직원</th>
                  {DAYS.map((d, i) => (
                    <th
                      key={d}
                      className={
                        WEEKDAYS[i % 7] === "토" || WEEKDAYS[i % 7] === "일"
                          ? styles.weekend
                          : ""
                      }
                    >
                      <span className={styles.dayNum}>{d}</span>
                      <span className={styles.dayWeek}>{WEEKDAYS[i % 7]}</span>
                    </th>
                  ))}
                  <th className={styles.summaryCol}>D/E/N/OFF</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_EMPLOYEES.map((emp) => (
                  <tr key={emp.id}>
                    <td className={styles.stickyCol}>
                      <div className={styles.empCell}>
                        <span
                          className={`${styles.avatar} ${styles[emp.tone]}`}
                        >
                          {emp.initial}
                        </span>
                        <div>
                          <strong>{emp.name}</strong>
                          <small>{emp.position}</small>
                        </div>
                      </div>
                    </td>
                    {emp.shifts.map((shift, i) => (
                      <td key={i}>
                        {shift ? (
                          <span
                            className={`${styles.shift} ${styles[`shift${shift}`]}`}
                          >
                            {shift}
                          </span>
                        ) : (
                          <span className={styles.shiftEmpty}>+</span>
                        )}
                      </td>
                    ))}
                    <td className={styles.summaryCol}>
                      <span className={styles.summaryText}>
                        {emp.summary.d}/{emp.summary.e}/{emp.summary.n}/
                        {emp.summary.off}
                      </span>
                    </td>
                  </tr>
                ))}

                {/* 하단 일별 D 현황 */}
                <tr className={styles.dailyRow}>
                  <td className={styles.stickyCol}>
                    <strong>일별 D 현황</strong>
                  </td>
                  {DAILY_D_COUNT.map((count, i) => (
                    <td key={i}>
                      <span
                        className={
                          count === 0 ? styles.dailyZero : styles.dailyCount
                        }
                      >
                        {count}
                      </span>
                    </td>
                  ))}
                  <td className={styles.summaryCol} />
                </tr>
              </tbody>
            </table>
          </div>
        </main>
  );
}
