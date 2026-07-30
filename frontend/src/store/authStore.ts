"use client";

import { useState, useEffect } from "react";

export interface Permission {
  menuCode: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canApprove: boolean;
}

export interface UserProfile {
  empNo: string;
  name: string;
  roleGroupName: string;
  perms: Permission[];
  [key: string]: any;
}

export function useAuthStore() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("userProfile");
      if (stored) {
        const parsed = JSON.parse(stored);
        
        const perms = parsed.permissions || [];
        
        const isAdmin = parsed.empNo === "ADMIN-001" || parsed.roleGroupName === "최고관리자";
        if (isAdmin) {
          const allMenus = [
            "EMP_LIST", "EMP_ORG", "APPOINTMENT", "DUTY_SCHEDULE", 
            "ATTEND_ADMIN", "LEAVE_STATUS", "APPROVAL_DRAFT", "APPROVAL_INBOX", 
            "PAYROLL_PROC", "STATUTORY_REPORT", "SYSTEM_ROLES", "SYSTEM_CODE", "NOTICE"
          ];
          setUserProfile({
            ...parsed,
            perms: allMenus.map(m => ({ 
              menuCode: m, 
              canWrite: true, 
              canRead: true, 
              canDelete: true, 
              canApprove: true 
            }))
          });
        } else {
          setUserProfile({
            ...parsed,
            perms: perms
          });
        }
      }
    } catch (e) {
      console.error("Failed to parse userProfile from localStorage", e);
    }
  }, []);

  return { userProfile };
}
