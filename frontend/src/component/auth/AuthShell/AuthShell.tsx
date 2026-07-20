import Link from "next/link";
import BrandLogo from "@/component/common/BrandLogo/BrandLogo";

import styles from "./AuthShell.module.scss";

interface AuthShellProps {
  mode: "login" | "signup";
  children: React.ReactNode;
}

const loginFeatures = [
  {
    title: "전 직군 통합 인사관리",
    description: "의사부터 경비·청소직까지 하나로",
    icon: "user",
  },
  {
    title: "근무표 · 당직 자동 편성",
    description: "3교대 · 야간 근무 자동 배정",
    icon: "calendar",
  },
  {
    title: "급여 자동 계산",
    description: "수당 · 공제 자동 정산 및 명세서 발행",
    icon: "wallet",
  },
];

const signupSteps = [
  {
    number: "1",
    title: "병원 정보 입력",
    description: "병원명, 유형, 규모를 입력합니다",
    active: true,
  },
  {
    number: "2",
    title: "관리자 계정 생성",
    description: "인사팀 담당자 계정을 설정합니다",
    active: true,
  },
  {
    number: "3",
    title: "즉시 사용 시작",
    description: "전담 컨설턴트가 온보딩을 지원합니다",
    active: false,
  },
];

function FeatureIcon({ type }: { type: "user" | "calendar" | "wallet" }) {
  if (type === "user") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19c.5-4 2.5-6 5.5-6s5 2 5.5 6" />
        <circle cx="17" cy="9" r="2" />
        <path d="M15.5 14.5c3 .2 4.5 1.8 5 4.5" />
      </svg>
    );
  }

  if (type === "calendar") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16" />
        <path d="M8 14h2M14 14h2M8 17h2M14 17h2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h14a2 2 0 0 1 2 2v10H6a2 2 0 0 1-2-2Z" />
      <path d="M4 7V6a2 2 0 0 1 2-2h11" />
      <path d="M15 12h5v4h-5a2 2 0 1 1 0-4Z" />
    </svg>
  );
}

export default function AuthShell({ mode, children }: AuthShellProps) {
  const isLogin = mode === "login";

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <BrandLogo inverse />

          <div className={styles.headerAction}>
            <span>
              {isLogin ? "아직 계정이 없으신가요?" : "이미 계정이 있으신가요?"}
            </span>

            <Link href={isLogin ? "/signup" : "/login"}>
              {isLogin ? "회원가입" : "로그인"}
            </Link>
          </div>
        </div>
      </header>

      <main
        className={`${styles.main} ${
          isLogin ? styles.loginMain : styles.signupMain
        }`}
      >
        <aside className={styles.intro}>
          {isLogin ? (
            <>
              <span className={styles.badge}>
                <i />
                병원 인사팀을 위한 통합 ERP
              </span>

              <h1>
                다시 만나서
                <br />
                반갑습니다
              </h1>

              <p className={styles.description}>
                SmartRAD HR에 로그인하여 병원 인사 · 근태 · 급여 업무를 한
                화면에서 관리하세요.
              </p>

              <div className={styles.featureList}>
                {loginFeatures.map((feature) => (
                  <article key={feature.title}>
                    <span className={styles.featureIcon}>
                      <FeatureIcon
                        type={feature.icon as "user" | "calendar" | "wallet"}
                      />
                    </span>

                    <div>
                      <h2>{feature.title}</h2>
                      <p>{feature.description}</p>
                    </div>
                  </article>
                ))}
              </div>

              <div className={styles.loginStats}>
                <span>▥&nbsp; 700+ 병원 사용 중</span>
                <span>☆&nbsp; 4.9 고객 만족도</span>
              </div>
            </>
          ) : (
            <>
              <span className={styles.badge}>
                <i />
                무료로 시작하세요
              </span>

              <h1>
                SmartRAD HR
                <br />
                지금 도입하기
              </h1>

              <p className={styles.description}>
                30일 무료 체험으로 병원의 모든 인사 업무를 경험해보세요.
                신용카드 없이 즉시 시작 가능합니다.
              </p>

              <div className={styles.stepList}>
                {signupSteps.map((step, index) => (
                  <article key={step.number}>
                    <div className={styles.stepLine}>
                      <span
                        className={`${styles.stepNumber} ${
                          step.active ? styles.stepActive : ""
                        }`}
                      >
                        {step.number}
                      </span>

                      {index < signupSteps.length - 1 && <i />}
                    </div>

                    <div>
                      <h2>{step.title}</h2>
                      <p>{step.description}</p>
                    </div>
                  </article>
                ))}
              </div>

              <div className={styles.securityBox}>
                <strong>♢&nbsp; 보안 및 인증</strong>

                <p>
                  ✓ ISO 27001 인증 보안 시스템&nbsp;&nbsp; ✓ 개인정보보호법 완전
                  준수&nbsp;&nbsp; ✓ 데이터 암호화
                </p>
              </div>
            </>
          )}
        </aside>

        <section
          className={`${styles.card} ${
            isLogin ? styles.loginCard : styles.signupCard
          }`}
        >
          {children}
        </section>
      </main>

      <footer className={styles.footer}>
        <div>
          <span>© 2026 SmartRAD HR. All rights reserved.</span>

          <nav>
            <a href="#terms">이용약관</a>
            <a href="#privacy">개인정보처리방침</a>
            <a href="#support">고객지원</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
