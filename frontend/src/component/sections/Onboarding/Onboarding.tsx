import SectionBadge from "@/component/common/SectionBadge/SectionBadge";
import { onboardingSteps } from "@/data/landingData";
import styles from "./Onboarding.module.scss";

export default function Onboarding() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.heading}>
          <SectionBadge>Introduction process</SectionBadge>
          <h2>
            어떤 규모의 병원도
            <br />
            쉽게 시작할 수 있습니다
          </h2>
          <p>
            직원 100명의 의원부터 3,000명의 상급종합병원까지, 규모에 관계없이
            빠르게 도입하세요.
          </p>
        </div>

        <div className={styles.steps}>
          {onboardingSteps.map((step, index) => (
            <article key={step.number}>
              <div
                className={`${styles.number} ${index === 1 ? styles.active : ""}`}
              >
                {step.number}
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <span>{step.badge}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
