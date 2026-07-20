import styles from "./WorkDashboard.module.scss";

const rows = [
  ["응급센터", "야간", "정상", "당직 12명"],
  ["중환자실", "데이", "정상", "간호 31명"],
  ["영상의학과", "오전", "확인", "근태 2건"],
  ["원무팀", "상근", "정상", "휴가 3명"],
];

export default function WorkDashboard() {
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <strong>오늘의 근무 대시보드</strong>
        <span>정상 운영</span>
      </div>
      <div className={styles.stats}>
        {["1,842|출근 완료", "128|당직", "76|휴가"].map((item) => {
          const [value, label] = item.split("|");
          return (
            <div key={label}>
              <small>{label}</small>
              <b>{value}</b>
            </div>
          );
        })}
      </div>
      <div className={styles.table}>
        {rows.map((row) => (
          <div key={row.join("-")}>
            {row.map((cell, index) => (
              <span key={cell} className={index === 2 ? styles.status : ""}>
                {cell}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
