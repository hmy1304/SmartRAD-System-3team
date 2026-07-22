import ActionLink from "@/component/common/ActionLink/ActionLink";
import HrDashboardPreview from "@/component/ui/HrDashboardPreview/HrDashboardPreview";
import styles from "./Hero.module.scss";

const roles = [
  "의사",
  "간호사",
  "의료기사",
  "행정직",
  "계약직",
  "부서",
  "직위",
  "근무조",
];

export default function Hero() {
  return (
    <section className={styles.hero} id="top">
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.inner}>
        <span className={styles.eyebrow}> <span className={styles.dot}>●</span>병원 인사팀을 위한 통합 ERP</span>
        <h1>
          복잡한 병원 인사를
          <br />한 화면에서 정확하게
        </h1>
        <p>
          SmartRAD HR은 의사, 간호사, 행정직, 계약직까지 병원 조직에
          <br />
          맞춘 인사·근태·발령·증명서 관리를 지원하는 병원 전용 인사관리
          ERP입니다.
        </p>
        <div className={styles.actions}>
          <ActionLink href="#features">기능 살펴보기</ActionLink>
          <ActionLink href="#contact" variant="secondary">
            도입 상담 받기 →
          </ActionLink>
        </div>
        <div className={styles.preview}>
          <HrDashboardPreview />
        </div>
      </div>

      <div className={styles.roleBar}>
        <span>병원 인사 업무에 필요한 기준 정보를 하나로 연결합니다</span>
        <span className={styles.divider}>|</span>
        <div>
          {roles.map((role) => (
            <b key={role}>{role}</b>
          ))}
        </div>
      </div>
    </section>
  );
}
