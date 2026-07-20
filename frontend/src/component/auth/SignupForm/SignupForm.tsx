"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./SignupForm.module.scss";

export default function SignupForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    /*
      실제 회원가입 API 연결 위치

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
    */

    router.push("/login");
  };

  return (
    <div className={styles.formArea}>
      <h1>회원가입</h1>

      <div className={styles.progress}>
        <span className={styles.active}>병원 정보</span>
        <b>›</b>
        <span>계정 생성</span>
      </div>

      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>
            <i />
            병원 정보
          </legend>

          <div className={styles.twoColumns}>
            <label className={styles.field}>
              <span>병원명 *</span>
              <input
                type="text"
                name="hospitalName"
                placeholder="○○종합병원"
                required
              />
            </label>

            <label className={styles.field}>
              <span>병원 유형 *</span>

              <select name="hospitalType" defaultValue="종합병원">
                <option>종합병원</option>
                <option>대학병원</option>
                <option>전문병원</option>
                <option>병원</option>
                <option>의원</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>지역 *</span>

              <select name="region" defaultValue="서울특별시">
                <option>서울특별시</option>
                <option>경기도</option>
                <option>인천광역시</option>
                <option>부산광역시</option>
                <option>대구광역시</option>
                <option>기타 지역</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>직원 수 *</span>

              <select name="employeeCount" defaultValue="500~1,000명">
                <option>100명 미만</option>
                <option>100~499명</option>
                <option>500~1,000명</option>
                <option>1,000명 이상</option>
              </select>
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <i />
            관리자 계정
          </legend>

          <div className={styles.twoColumns}>
            <label className={styles.field}>
              <span>이름 *</span>
              <input
                type="text"
                name="managerName"
                placeholder="홍길동"
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.emptyLabel}>직책</span>

              <select name="position" defaultValue="인사팀장">
                <option>인사팀장</option>
                <option>인사담당자</option>
                <option>관리자</option>
                <option>원무팀장</option>
              </select>
            </label>
          </div>

          <label className={styles.field}>
            <span>이메일 (아이디) *</span>

            <div className={styles.emailField}>
              <input
                type="email"
                name="email"
                placeholder="admin@hospital.com"
                required
              />

              <b>사용 가능</b>
            </div>
          </label>

          <div className={styles.twoColumns}>
            <label className={styles.field}>
              <span>비밀번호 *</span>

              <div className={styles.passwordField}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  minLength={8}
                  placeholder="8자 이상 입력"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label="비밀번호 표시 전환"
                >
                  ◉
                </button>
              </div>
            </label>

            <label className={styles.field}>
              <span>비밀번호 확인 *</span>

              <div className={styles.passwordField}>
                <input
                  type={showPasswordConfirm ? "text" : "password"}
                  name="passwordConfirm"
                  minLength={8}
                  placeholder="동일하게 입력"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm((prev) => !prev)}
                  aria-label="비밀번호 확인 표시 전환"
                >
                  ◉
                </button>
              </div>
            </label>
          </div>

          <label className={styles.field}>
            <span>연락처 *</span>
            <input
              type="tel"
              name="phone"
              placeholder="010-0000-0000"
              required
            />
          </label>
        </fieldset>

        <div className={styles.agreement}>
          <label className={styles.allAgreement}>
            <input type="checkbox" defaultChecked />
            <strong>전체 약관에 동의합니다</strong>
            <a href="#all">상세보기</a>
          </label>

          <label>
            <input type="checkbox" defaultChecked />
            <span>[필수] 이용약관</span>
            <a href="#terms">보기</a>
          </label>

          <label>
            <input type="checkbox" defaultChecked />
            <span>[필수] 개인정보 처리방침</span>
            <a href="#privacy">보기</a>
          </label>

          <label>
            <input type="checkbox" />
            <span>[선택] 마케팅 수신 동의</span>
            <a href="#marketing">보기</a>
          </label>
        </div>

        <button type="submit" className={styles.submitButton}>
          회원가입 완료
          <span>→</span>
        </button>
      </form>
    </div>
  );
}
