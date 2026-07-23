"use client";

import React from "react";
import styles from "./DashboardHeader.module.scss";

interface ProfileData {
  initial?: string;
  name?: string;
  department?: string;
  role?: string;
}

interface DashboardHeaderProps {
  profile?: ProfileData;
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export default function DashboardHeader({ profile }: DashboardHeaderProps) {
  const defaultProfile = {
    initial: "김",
    name: "김관리",
    department: "인사팀",
    role: "관리자",
  };

  const currentProfile = profile || defaultProfile;

  return (
    <header className={styles.topHeader}>
      <label className={styles.search}>
        <span>⌕</span>
        <input type="search" placeholder="직원, 부서, 문서를 검색하세요" />
      </label>

      <div className={styles.topActions}>
        <div className={styles.profile}>
          <span>{currentProfile.initial || currentProfile.name?.[0] || "김"}</span>
          <div>
            <strong>{currentProfile.name}님</strong>
            <small>
              {currentProfile.department} · {currentProfile.role}
            </small>
          </div>
        </div>
        <button
          className={styles.logoutBtn}
          onClick={() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userProfile');
            window.location.href = '/login';
          }}
        >
          로그아웃
        </button>
      </div>
    </header>
  );
}
