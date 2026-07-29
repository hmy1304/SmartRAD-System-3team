"use client";

import React, { useState } from 'react';
import styles from './LoginPage.module.scss';
import BrandLogo from '@/component/common/BrandLogo/BrandLogo';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [empNo, setEmpNo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const response = await fetch('/api-system/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empNo, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '로그인에 실패했습니다. 다시 시도해주세요.');
      }

      const data = await response.json();
      
      // 토큰과 사용자 정보를 브라우저 로컬 스토리지에 저장합니다.
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('userProfile', JSON.stringify(data));
      }

      // 대시보드로 이동
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <BrandLogo inverse={true} />
        </div>
        <div className={styles.headerRight}>
          <span>아직 계정이 없으신가요?</span>
          <button className={styles.signupBtn}>회원가입</button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.leftPanel}>
          <div className={styles.leftContent}>
            <div className={styles.badge}>
              <span className={styles.dot}>●</span> 병원 인사팀을 위한 통합 ERP
            </div>
            
            <h1 className={styles.title}>
              다시 만나서<br />반갑습니다
            </h1>
            
            <p className={styles.description}>
              SmartRAD HR에 로그인하여 병원 인사·근태·급여 업무를 한<br />
              화면에서 관리하세요.
            </p>

            <div className={styles.features}>
              <div className={styles.feature}>
                <div className={styles.iconBox}>👨‍⚕️</div>
                <div className={styles.text}>
                  <h3>전 직군 통합 인사관리</h3>
                  <p>의사부터 경비·청소직까지 하나로</p>
                </div>
              </div>
              
              <div className={styles.feature}>
                <div className={styles.iconBox}>📅</div>
                <div className={styles.text}>
                  <h3>근무표·당직 자동 편성</h3>
                  <p>3교대·야간 근무 자동 배정</p>
                </div>
              </div>
              
              <div className={styles.feature}>
                <div className={styles.iconBox}>💸</div>
                <div className={styles.text}>
                  <h3>급여 자동 계산</h3>
                  <p>수당·공제 자동 정산 및 명세서 발행</p>
                </div>
              </div>
            </div>

            <div className={styles.stats}>
              <div className={styles.statItem}>
                <span className={styles.icon}>🏥</span> 700+ 병원 사용 중
              </div>
              <div className={styles.statItem}>
                <span className={styles.star}>⭐</span> 4.9 고객 만족도
              </div>
            </div>
          </div>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.loginCard}>
            <div className={styles.cardHeader}>
              <h2>로그인</h2>
              <p>병원 인사팀 계정으로 로그인하세요</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className={styles.formGroup}>
                <label>아이디 (이메일)</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    placeholder="hospital@example.com"
                    value={empNo}
                    onChange={(e) => setEmpNo(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>비밀번호</label>
                <div className={styles.inputWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}

              <div className={styles.formOptions}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" />
                  <span>로그인 상태 유지</span>
                </label>
                <a href="#" className={styles.forgotPassword}>비밀번호 찾기</a>
              </div>

              <button type="submit" className={styles.loginBtn}>
                로그인 <span className={styles.arrow}>→</span>
              </button>

              <div className={styles.mobileSignup}>
                아직 계정이 없으신가요? <a href="#">회원가입</a>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.copyright}>
          © 2026 SmartRAD HR. All rights reserved.
        </div>
        <div className={styles.footerLinks}>
          <a href="#">이용약관</a>
          <a href="#">개인정보처리방침</a>
          <a href="#">고객지원</a>
        </div>
      </footer>
    </div>
  );
}
