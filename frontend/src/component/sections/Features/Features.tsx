import SectionBadge from "@/component/common/SectionBadge/SectionBadge";
import FeatureIcon from "./FeatureIcon";
import { featureItems } from "@/data/landingData";
import styles from "./Features.module.scss";

export default function Features() {
  return (
    <section className={styles.section} id="features">
      <div className={styles.inner}>
        <div className={styles.heading}>
          <SectionBadge>Core Features</SectionBadge>
          <h2>병원 인사관리에 꼭 필요한 기능</h2>
          <p>
            조직 기준 정보부터 근태, 발령, 증명서까지 반복 업무를 줄여줍니다.
          </p>
        </div>

        <div className={styles.grid}>
          {featureItems.map((item) => (
            <article key={item.title} className={styles.card}>
              <span className={styles.icon}>
                <FeatureIcon name={item.icon} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <div className={styles.tags}>
                {item.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
