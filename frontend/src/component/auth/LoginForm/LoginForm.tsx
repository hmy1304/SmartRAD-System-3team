"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import styles from "./LoginForm.module.scss";

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    /*
      실제 로그인 API 연결 위치

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
    */

    router.push("/dashboard");
  };

  return (
    <div className={styles.formArea}>
      <h1>로그인</h1>
      <p className={styles.description}>병원 인사팀 계정으로 로그인하세요</p>

      <form onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>아이디 (이메일)</span>

          <input
            type="email"
            name="email"
            placeholder="hospital@example.com"
            autoComplete="email"
            required
          />
        </label>

        <label className={styles.field}>
          <span>비밀번호</span>

          <div className={styles.passwordField}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••••"
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {showPassword ? (
                  <>
                    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                    <circle cx="12" cy="12" r="2.5" />
                  </>
                ) : (
                  <>
                    <path d="m3 3 18 18" />
                    <path d="M10.6 6.2A9.5 9.5 0 0 1 12 6c6 0 9.5 6 9.5 6a15 15 0 0 1-2.2 2.8" />
                    <path d="M6.2 6.2C3.9 7.8 2.5 12 2.5 12s3.5 6 9.5 6c1.3 0 2.5-.3 3.5-.7" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </label>

        <div className={styles.options}>
          <label className={styles.remember}>
            <input type="checkbox" defaultChecked />
            <span>로그인 상태 유지</span>
          </label>

          <a href="#password">비밀번호 찾기</a>
        </div>

        <button type="submit" className={styles.loginButton}>
          로그인
          <span>→</span>
        </button>

        <div className={styles.divider}>
          <span />
          <b>또는</b>
          <span />
        </div>

        <button type="button" className={styles.kakaoButton}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 4C6.5 4 2 7.3 2 11.3c0 2.6 1.9 4.9 4.7 6.2L5.5 21l4.2-2.2c.7.1 1.5.2 2.3.2 5.5 0 10-3.3 10-7.7S17.5 4 12 4Z" />
          </svg>
          카카오 로그인
        </button>

        <p className={styles.signupLink}>
          아직 계정이 없으신가요?
          <Link href="/signup">회원가입</Link>
        </p>
      </form>
    </div>
  );
}
