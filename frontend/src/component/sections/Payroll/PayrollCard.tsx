import styles from "./PayrollCard.module.scss";

const rows = [
  ["기본급", "3,800,000"],
  ["야간 · 당직 수당", "620,000"],
  ["직책 수당", "250,000"],
  ["공제 합계", "-418,000"],
];

export default function PayrollCard() {
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <strong>급여 계산 미리보기</strong>
        <span>2026.07</span>
      </div>
      <div className={styles.rows}>
        {rows.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <b className={value.startsWith("-") ? styles.minus : ""}>{value}</b>
          </div>
        ))}
      </div>
      <div className={styles.total}>
        <span>실지급액</span>
        <b>4,252,000원</b>
      </div>
    </div>
  );
}
