import SectionBadge from "@/component/common/SectionBadge/SectionBadge";
import WorkDashboard from "./WorkDashboard";
import { workflowSteps } from "@/data/landingData";
import styles from "./Workflow.module.scss";
import FadeIn from "@/component/common/FadeIn/FadeIn";

export default function Workflow() {
  return (
    <section className={styles.section} id="workflow">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <FadeIn delay={0.1}>
            <SectionBadge>Work Flow</SectionBadge>
          </FadeIn>
          <FadeIn delay={0.2}>
            <h2>병원 근무 흐름에 맞춘 인사 처리</h2>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p>
              부서 이동, 당직 편성, 휴가 승인처럼 매일 반복되는 업무를 단계별로
              정리합니다.
            </p>
          </FadeIn>

          <div className={styles.steps}>
            {workflowSteps.map((step, idx) => (
              <FadeIn key={step.number} delay={0.4 + idx * 0.1}>
                <article>
                  <strong>{step.number}</strong>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>

        <FadeIn delay={0.5}>
          <WorkDashboard />
        </FadeIn>
      </div>
    </section>
  );
}
