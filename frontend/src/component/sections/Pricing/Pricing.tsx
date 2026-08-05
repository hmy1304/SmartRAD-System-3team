import ActionLink from "@/component/common/ActionLink/ActionLink";
import SectionBadge from "@/component/common/SectionBadge/SectionBadge";
import { pricingPlans } from "@/data/landingData";
import styles from "./Pricing.module.scss";
import FadeIn from "@/component/common/FadeIn/FadeIn";

export default function Pricing() {
  return (
    <section className={styles.section} id="pricing">
      <div className={styles.inner}>
        <div className={styles.heading}>
          <FadeIn delay={0.1}>
            <SectionBadge>Pricing</SectionBadge>
          </FadeIn>
          <FadeIn delay={0.2}>
            <h2>병원 규모에 맞춘 요금제</h2>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p>필요한 기능과 직원 규모에 따라 알맞은 플랜을 선택하세요.</p>
          </FadeIn>
        </div>

        <div className={styles.grid}>
          {pricingPlans.map((plan, index) => (
            <FadeIn key={plan.name} delay={0.4 + index * 0.1}>
              <article
                className={`${styles.card} ${plan.featured ? styles.featured : ""}`}
              >
                {plan.label && <span className={styles.label}>{plan.label}</span>}
                <h3>{plan.name}</h3>
                <p className={styles.caption}>{plan.caption}</p>
                <div className={styles.price}>
                  {plan.price}
                  {plan.suffix && <small>{plan.suffix}</small>}
                </div>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <ActionLink
                  href="#contact"
                  variant={plan.featured ? "primary" : "ghost"}
                  full
                >
                  {plan.button}
                </ActionLink>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
