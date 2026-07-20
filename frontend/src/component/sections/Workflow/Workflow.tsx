import SectionBadge from "@/component/common/SectionBadge/SectionBadge";
import WorkDashboard from "./WorkDashboard";
import { workflowSteps } from "@/data/landingData";
import styles from "./Workflow.module.scss";

export default function Workflow() {
  return (
    <section className={styles.section} id="workflow">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <SectionBadge>Work Flow</SectionBadge>
          <h2>병원 근무 흐름에 맞춘 인사 처리</h2>
          <p>
            부서 이동, 당직 편성, 휴가 승인처럼 매일 반복되는 업무를 단계별로
            정리합니다.
          </p>

          <div className={styles.steps}>
            {workflowSteps.map((step) => (
              <article key={step.number}>
                <strong>{step.number}</strong>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <WorkDashboard />
      </div>
    </section>
  );
}
