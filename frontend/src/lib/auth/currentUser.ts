/**
 * 로그인 사용자 정보 접근 유틸.
 *
 * 저장 키는 LoginPage 가 실제로 쓰는 값과 반드시 일치해야 한다.
 *   localStorage["accessToken"] : JWT
 *   localStorage["userProfile"] : LoginResponse 전체 (employeeId, empNo, name, permissions ...)
 * 쿠키에는 아무것도 저장하지 않는다.
 */

export interface CurrentUser {
  employeeId: number;
  empNo: string;
  name: string;
  departmentName?: string | null;
  positionName?: string | null;
  roleGroupName?: string | null;
  permissions?: Array<{
    menuCode: string;
    canRead: boolean;
    canWrite: boolean;
    canDelete: boolean;
    canApprove: boolean;
  }>;
}

export const TOKEN_STORAGE_KEY = "accessToken";
export const PROFILE_STORAGE_KEY = "userProfile";

export function getCurrentUser(): CurrentUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.employeeId !== "number") return null;
    return parsed as CurrentUser;
  } catch (e) {
    console.error("userProfile 파싱 실패", e);
    return null;
  }
}

/** 현재 로그인 사용자의 employeeId. 로그인 정보가 없으면 null. */
export function getCurrentEmployeeId(): number | null {
  return getCurrentUser()?.employeeId ?? null;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/** 세션 정보를 지운다. 401 처리와 로그아웃이 같은 경로를 타도록 한 곳에 모아둔다. */
export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(PROFILE_STORAGE_KEY);
}
