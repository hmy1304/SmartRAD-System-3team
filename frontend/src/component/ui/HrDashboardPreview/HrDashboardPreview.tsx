import styles from "./HrDashboardPreview.module.scss";

const summaryItems = [
  ["전체 직원", "2,184"],
  ["오늘 당직", "128"],
  ["대기 결재", "23"],
  ["서류 처리율", "98%"],
];

const rows = [
  ["경영지원팀", "선임비서팀", "완료"],
  ["간호본부", "병동 이동", "완료"],
  ["응급의학과", "보직 변경", "대기"],
];

export default function HrDashboardPreview() {
  return (
    <div className={styles.window} aria-label="SmartRAD HR 대시보드 미리보기">
      <div className={styles.windowBar}>
        <span />
        <span />
        <span />
      </div>

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <strong>SmartRAD HR</strong>
          {[
            "통합 대시보드",
            "직원 인사기록",
            "근무표 / 당직",
            "급여 / 복지",
            "증명서 발급",
          ].map((item, index) => (
            <span key={item} className={index === 0 ? styles.selected : ""}>
              {item}
            </span>
          ))}
        </aside>

        <div className={styles.content}>
          <div className={styles.summaryGrid}>
            {summaryItems.map(([label, value]) => (
              <div key={label} className={styles.summaryCard}>
                <small>{label}</small>
                <b>{value}</b>
              </div>
            ))}
          </div>

          <div className={styles.dashboardGrid}>
            <div className={styles.approvalCard}>
              <div className={styles.panelTitle}>인사 발령 현황</div>
              {rows.map(([department, title, status]) => (
                <div key={`${department}-${title}`} className={styles.approvalRow}>
                  <span className={styles.rowIcon}>↗</span>
                  <span>{department} · {title}</span>
                  <em className={status === "대기" ? styles.wait : ""}>{status}</em>
                </div>
              ))}
            </div>

            <div className={styles.chartCard}>
              <div className={styles.panelTitle}>월별 근태 처리량</div>
              <div className={styles.chart}>
                {[45, 72, 58, 86, 68, 94].map((height, index) => (
                  <span key={index} style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
