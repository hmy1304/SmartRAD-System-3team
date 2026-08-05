import SectionBadge from "@/component/common/SectionBadge/SectionBadge";
import { onboardingSteps } from "@/data/landingData";
import styles from "./Onboarding.module.scss";
import FadeIn from "@/component/common/FadeIn/FadeIn";

export default function Onboarding() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.heading}>
          <FadeIn delay={0.1}>
            <SectionBadge>Introduction process</SectionBadge>
          </FadeIn>
          <FadeIn delay={0.2}>
            <h2>
              어떤 규모의 병원도
              <br />
              쉽게 시작할 수 있습니다
            </h2>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p>
              직원 100명의 의원부터 3,000명의 상급종합병원까지, 규모에 관계없이
              빠르게 도입하세요.
            </p>
          </FadeIn>
        </div>

        <div className={styles.steps}>
          {onboardingSteps.map((step, index) => (
            <FadeIn key={step.number} delay={0.4 + index * 0.1}>
              <article>
                <div
                  className={`${styles.number} ${index === 1 ? styles.active : ""}`}
                >
                  {step.number}
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <span>{step.badge}</span>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
