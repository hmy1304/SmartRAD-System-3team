import ActionLink from "@/component/common/ActionLink/ActionLink";
import styles from "./FinalCta.module.scss";

export default function FinalCta() {
  return (
    <section className={styles.section} id="contact">
      <div className={styles.inner}>
        <h2>
          병원 인사 업무,
          <br />
          이제 SmartRAD HR로 정리하세요
        </h2>
        <p>
          Spring Boot와 Next.js 기반 ERP 시스템을 소개하고, 병원 환경에 맞춘
          도입 범위를 함께 설계합니다.
        </p>
        <div className={styles.actions}>
          <ActionLink href="mailto:contact@smartrad.example">무료 데모 요청</ActionLink>
          <ActionLink href="#features" variant="secondary">
            기능 자세히 보기
          </ActionLink>
        </div>
      </div>
    </section>
  );
}
