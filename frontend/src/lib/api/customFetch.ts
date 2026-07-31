import { getAuthHeaders } from "../auth/authHeaders";
import { clearSession } from "../auth/currentUser";

/**
 * 인증 헤더가 자동으로 붙는 fetch 래퍼.
 *
 * 401 이면 남아있는 만료 토큰을 지우고 로그인 화면으로 보낸다.
 * 이 정리를 하지 않으면 AuthGuard 는 토큰이 있다고 판단해 통과시키는데
 * 모든 API 는 401 을 돌려주어 화면이 빈 채로 멈춘다.
 */
export async function customFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const isMultipart = options.body instanceof FormData;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(isMultipart),
      ...((options.headers as Record<string, string>) || {}),
    },
  });

  if (response.status === 401 && typeof window !== "undefined") {
    clearSession();
    window.location.href = "/login";
  }

  return response;
}
