"use client";

import { useEffect, useState } from "react";

export type MenuCode =
  | "APPROVAL_INBOX"
  | "APPROVAL_DRAFT"
  | "EMP_LIST"
  | "EMP_ORG"
  | "APPOINTMENT"
  | "DUTY_SCHEDULE"
  | "ATTEND_ADMIN"
  | "ATTEND_CHECK"
  | "LEAVE_STATUS"
  | "PAYROLL_INFO"
  | "PAYROLL_PROC"
  | "STATUTORY_REPORT"
  | "SYSTEM_ROLES"
  | "SYSTEM_CODE"
  | "NOTICE"
  | string;

export function hasPermission(menuCode: MenuCode, action: "canRead" | "canWrite" | "canDelete" | "canApprove"): boolean {
  if (typeof window === "undefined") return false;
  try {
    const userStr = localStorage.getItem("userProfile");
    if (!userStr) return false;
    const user = JSON.parse(userStr);
    
    // 최고관리자나 시스템 관리자 또는 관리자 계정인 경우 슈퍼권한 부여
    if (user.roleGroupName === "최고관리자" || user.roleGroupName === "시스템 관리자" || user.roleGroupName?.includes("관리자") || user.empNo === "ADMIN-001") {
      return true;
    }

    if (user.permissions && Array.isArray(user.permissions)) {
      const p = user.permissions.find((perm: any) => perm.menuCode === menuCode || perm.menuName === menuCode);
      if (p && typeof p[action] !== "undefined") {
        return !!p[action];
      }
    }
    // 기본값 거부 (False)
    return false;
  } catch (e) {
    return false;
  }
}

export function usePageGuard(menuCode: MenuCode, action: "canRead" | "canWrite" | "canDelete" | "canApprove" = "canRead") {
  const [authorized, setAuthorized] = useState<boolean>(true);

  useEffect(() => {
    const allowed = hasPermission(menuCode, action);
    setAuthorized(allowed);
    if (!allowed) {
      alert(`[접근 차단] 해당 기능(${menuCode})에 대한 접근/조회 권한이 없습니다. 관리자에게 문의하세요.`);
      window.location.href = "/dashboard";
    }
  }, [menuCode, action]);

  return authorized;
}
