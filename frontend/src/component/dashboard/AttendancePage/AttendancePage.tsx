"use client";


import styles from "./AttendancePage.module.scss";

type Status = "정상" | "지각" | "결근" | "조기퇴근";

interface AttendanceRow {
  id: string;
  name: string;
  initial: string;
  position: string;
  department: string;
  tone: "blue" | "green" | "red" | "purple" | "orange";
  checkIn: string | null;
  checkOut: string | null;
  workTime: string | null;
  status: Status;
  note: string;
}

const MOCK: AttendanceRow[] = [
  {
    id: "1",
    name: "박서준",
    initial: "박",
    position: "부장",
    department: "영상의학과",
    tone: "blue",
    checkIn: "08:52",
    checkOut: "퇴근 전",
    workTime: "7h 13m",
    status: "정상",
    note: "-",
  },
  {
    id: "2",
    name: "오하윤",
    initial: "오",
    position: "과장",
    department: "영상의학과",
    tone: "green",
    checkIn: "09:23",
    checkOut: "퇴근 전",
    workTime: "6h 42m",
    status: "지각",
    note: "23분 지각 · 사유 확인",
  },
  {
    id: "3",
    name: "최지은",
    initial: "최",
    position: "과장",
    department: "인사총무팀",
    tone: "red",
    checkIn: null,
    checkOut: null,
    workTime: null,
    status: "결근",
    note: "확인 필요",
  },
  {
    id: "4",
    name: "이다영",
    initial: "이",
    position: "주임간호사",
    department: "간호부",
    tone: "purple",
    checkIn: "07:01",
    checkOut: "15:12",
    workTime: "8h 11m",
    status: "정상",
    note: "야간 근무 종료",
  },
  {
    id: "5",
    name: "정유진",
    initial: "정",
    position: "인턴",
    department: "응급의학과",
    tone: "orange",
    checkIn: "08:59",
    checkOut: "15:30",
    workTime: "6h 31m",
    status: "조기퇴근",
    note: "1.5h 조기 퇴근 · 승인 대기",
  },
];

export default function AttendancePage() {
  return (
    <main className={styles.main}>
          {/* 페이지 헤더 */}
          <div className={styles.pageHeader}>
            <div>
              <h1>출퇴근 관리</h1>
              <p>직원별 출퇴근 기록을 조회하고 이상 내역을 관리합니다.</p>
            </div>
            <div className={styles.pageActions}>
              <div className={styles.dateSelect}>
                <span>📅</span>
                <span>2026.07.11 (금)</span>
              </div>
              <select className={styles.deptSelect} defaultValue="전체 부서">
                <option>전체 부서</option>
                <option>영상의학과</option>
                <option>간호부</option>
                <option>인사총무팀</option>
              </select>
              <button type="button" className={styles.outlineBtn}>
                내보내기
              </button>
            </div>
          </div>

          {/* 요약 카드 */}
          <div className={styles.summaryRow}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryTop}>
                <label>전체 직원</label>
                <span className={styles.iconBlue}>👥</span>
              </div>
              <p className={styles.summaryValue}>
                2,184<span>명</span>
              </p>
              <span className={styles.summarySub}>● 오늘 출근 대상</span>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryTop}>
                <label>정상 출근</label>
                <span className={styles.iconGreen}>✓</span>
              </div>
              <p className={styles.summaryValue}>
                1,967<span>명</span>
              </p>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: "90.1%" }}
                />
              </div>
              <span className={styles.summarySub}>90.1%</span>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryTop}>
                <label>지각</label>
                <span className={styles.iconOrange}>⏱</span>
              </div>
              <p className={`${styles.summaryValue} ${styles.textOrange}`}>
                47<span>명</span>
              </p>
              <span className={styles.summarySubWarn}>전일 대비 +5명</span>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryTop}>
                <label>미출근 / 결근</label>
                <span className={styles.iconRed}>○</span>
              </div>
              <p className={`${styles.summaryValue} ${styles.textRed}`}>
                12<span>명</span>
              </p>
              <span className={styles.summarySubDanger}>확인 필요</span>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryTop}>
                <label>조기 퇴근</label>
                <span className={styles.iconPurple}>↩</span>
              </div>
              <p className={`${styles.summaryValue} ${styles.textPurple}`}>
                8<span>명</span>
              </p>
              <span className={styles.summarySub}>승인 대기 3건</span>
            </div>
          </div>

          {/* 테이블 */}
          <section className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>직원</th>
                  <th>부서</th>
                  <th>출근 시각</th>
                  <th>퇴근 시각</th>
                  <th>근무 시간</th>
                  <th>상태</th>
                  <th>비고</th>
                </tr>
              </thead>
              <tbody>
                {MOCK.map((row) => (
                  <tr key={row.id}>
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
                      {row.checkIn ? (
                        <span className={styles.timeIn}>→ {row.checkIn}</span>
                      ) : (
                        <span className={styles.timeNone}>× 미출근</span>
                      )}
                    </td>
                    <td>
                      {row.checkOut === "퇴근 전" ? (
                        <span className={styles.timePending}>퇴근 전</span>
                      ) : row.checkOut ? (
                        <span className={styles.timeOut}>← {row.checkOut}</span>
                      ) : (
                        <span className={styles.timeDash}>—</span>
                      )}
                    </td>
                    <td>{row.workTime ?? "—"}</td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          row.status === "정상"
                            ? styles.statusNormal
                            : row.status === "지각"
                              ? styles.statusLate
                              : row.status === "결근"
                                ? styles.statusAbsent
                                : styles.statusEarly
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          row.note.includes("확인") || row.note.includes("대기")
                            ? styles.noteWarn
                            : styles.noteNormal
                        }
                      >
                        {row.note}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>
  );
}
