"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
}

// 라우트와 필요한 메뉴 권한(menuCode) 매핑
const routePermissionMap: Record<string, string> = {
  "/dashboard/approvals": "APPROVAL_INBOX",
  "/dashboard/drafts": "APPROVAL_DRAFT",
  "/dashboard/employees": "EMP_LIST",
  "/dashboard/organization": "EMP_ORG",
  "/dashboard/appointments": "APPOINTMENT",
  "/dashboard/duty": "DUTY_SCHEDULE",
  "/dashboard/attendance": "ATTEND_ADMIN",
  "/dashboard/attendance-link": "ATTEND_CHECK",
  "/dashboard/leave": "LEAVE_STATUS",
  "/dashboard/payroll/info": "PAYROLL_INFO",
  "/dashboard/payroll/processing": "PAYROLL_PROC",
  "/dashboard/statutory": "STATUTORY_REPORT",
  "/dashboard/system/roles": "SYSTEM_ROLES",
  "/dashboard/system/common-code": "SYSTEM_CODE",
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const userStr = localStorage.getItem("userProfile");
      const token = localStorage.getItem("accessToken");

      // 1. 비로그인 접근 차단
      if (!userStr || !token) {
        alert("로그인이 필요합니다.");
        router.replace("/login");
        return;
      }

      try {
        const user = JSON.parse(userStr);
        const isAdminRole = user.empNo === "ADMIN-001" || user.roleGroupName === "최고관리자";

        // 최고관리자는 모든 페이지 프리패스
        if (isAdminRole) {
          setIsAuthorized(true);
          return;
        }

        // 2. 현재 경로에 해당하는 필요 권한 찾기
        let requiredMenuCode: string | null = null;
        
        // 경로 길이가 긴 것부터 검사하여 /dashboard/attendance-link 가 /dashboard/attendance 에 먼저 매칭되는 것을 방지
        const sortedRoutes = Object.entries(routePermissionMap).sort((a, b) => b[0].length - a[0].length);
        
        for (const [route, code] of sortedRoutes) {
          if (pathname.startsWith(route)) {
            requiredMenuCode = code;
            break;
          }
        }

        // 3. 권한 검사
        if (requiredMenuCode) {
          const hasPermission = user.permissions?.some(
            (p: any) => p.menuCode === requiredMenuCode && p.canRead
          );

          if (!hasPermission) {
            alert("접근 권한이 없습니다.");
            router.replace("/dashboard");
            return;
          }
        }

        // 대시보드 홈이거나 권한이 있는 경우
        setIsAuthorized(true);
      } catch (e) {
        console.error("Auth check error:", e);
        router.replace("/login");
      }
    };

    checkAuth();
  }, [pathname, router]);

  // 권한 확인 전에는 렌더링을 차단하여 화면 깜빡임이나 데이터 유출 방지
  if (!isAuthorized) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading...</div>;
  }

  return <>{children}</>;
}
