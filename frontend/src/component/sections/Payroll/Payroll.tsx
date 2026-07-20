import SectionBadge from "@/component/common/SectionBadge/SectionBadge";
import PayrollCard from "./PayrollCard";
import styles from "./Payroll.module.scss";

const benefits = [
  "근무 기록 기반 수당 자동 반영",
  "직급 · 직책별 급여 기준 관리",
  "급여명세서 PDF 다운로드",
  "승인 전 검토용 급여 시뮬레이션",
];

export default function Payroll() {
  return (
    <section className={styles.section} id="payroll">
      <div className={styles.inner}>
        <PayrollCard />

        <div className={styles.copy}>
          <SectionBadge>Payroll</SectionBadge>
          <h2>
            복잡한 병원 급여
            <br />
            계산을 자동으로
          </h2>
          <p>
            근무표, 야간근무, 당직, 직책 수당, 휴가 정보를 급여 계산과 연결해
            누락과 수기 입력을 줄입니다.
          </p>
          <ul>
            {benefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
