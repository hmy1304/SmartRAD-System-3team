import BrandLogo from "@/component/common/BrandLogo/BrandLogo";
import styles from "./Footer.module.scss";

const groups = [
  ["제품", "핵심 기능", "근태 관리", "급여 관리"],
  ["ERP", "라이선스", "운영 정책", "유지보수"],
  ["기술", "Spring Boot", "Next.js", "Docker"],
  ["문의", "도입 상담", "고객지원", "자료 요청"],
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandArea}>
          <BrandLogo inverse />
          <p>
            병원의 인사, 근태, 발령, 급여, 증명서 업무를
            <br />
            하나로 연결하는 병원 전용 인사관리 ERP입니다.
          </p>
        </div>

        <div className={styles.links}>
          {groups.map(([title, ...items]) => (
            <div key={title}>
              <strong>{title}</strong>
              {items.map((item) => (
                <a key={item} href="#top">
                  {item}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.bottom}>
        <span>
          © 2026 SmartRAD HR. Hospital Human Resource ERP Landing Page.
        </span>
        <div>
          <a href="#top">이용약관</a>
          <a href="#top">개인정보처리방침</a>
          <a href="#top">고객센터</a>
        </div>
      </div>
    </footer>
  );
}
