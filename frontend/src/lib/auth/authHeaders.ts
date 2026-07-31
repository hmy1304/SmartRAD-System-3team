import { getAuthToken } from "./currentUser";

/**
 * API 호출용 공통 헤더.
 *
 * 백엔드가 /common-codes, /payroll-settings 를 포함해 사실상 모든 엔드포인트에
 * 인증을 요구하므로, fetch 호출은 반드시 이 헤더를 붙여야 한다.
 */
export function getAuthHeaders(isMultipart = false): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  // multipart 는 브라우저가 boundary 를 포함해 직접 지정해야 하므로 설정하지 않는다.
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}
