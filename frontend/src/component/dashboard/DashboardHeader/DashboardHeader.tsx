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
  const [currentUser, setCurrentUser] = React.useState<ProfileData>({
    initial: "유",
    name: "사용자",
    department: "부서",
    role: "직무",
  });

  React.useEffect(() => {
    if (profile) {
      setCurrentUser(profile);
      return;
    }
    const stored = localStorage.getItem("userProfile");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const name = parsed.name || "사용자";
        setCurrentUser({
          initial: name[0] || "유",
          name: name,
          department: parsed.departmentName || "부서 미지정",
          role: parsed.roleGroupName || parsed.positionName || "일반직원",
        });
      } catch (e) {
        // ignore JSON parse error
      }
    }
  }, [profile]);

  const currentProfile = currentUser;

  return (
    <header className={styles.topHeader}>

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
