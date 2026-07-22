import { dashboardMockData } from "@/data/dashboard/dashboardMockData";
import type { DashboardData } from "@/types/dashboard";

interface DashboardApiResponse {
  data: DashboardData;
}

const useMockData = process.env.USE_DASHBOARD_MOCK_DATA !== "false";

const backendApiUrl = process.env.BACKEND_API_URL;

const dashboardApiPath = process.env.DASHBOARD_API_PATH ?? "/api/v1/dashboard";

function hasDataWrapper(
  response: DashboardData | DashboardApiResponse,
): response is DashboardApiResponse {
  return "data" in response;
}

export async function getDashboardData(): Promise<DashboardData> {
  // dashboardMockData를 실제로 사용해야 TS6133 오류가 사라집니다.
  if (useMockData) {
    return dashboardMockData;
  }

  if (!backendApiUrl) {
    throw new Error("BACKEND_API_URL 환경변수가 설정되지 않았습니다.");
  }

  const requestUrl = new URL(dashboardApiPath, backendApiUrl).toString();

  const response = await fetch(requestUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `대시보드 조회 실패: ${response.status} ${response.statusText}`,
    );
  }

  const responseData = (await response.json()) as
    | DashboardData
    | DashboardApiResponse;

  return hasDataWrapper(responseData) ? responseData.data : responseData;
}
