import { dashboardMockData } from "@/data/dashboard/dashboardMockData";
import type { DashboardData } from "@/types/dashboard";
import { getEmployees } from "@/services/employeeService";

export async function getDashboardData(): Promise<DashboardData> {
  const data: DashboardData = structuredClone(dashboardMockData);

  try {
    const page = await getEmployees(1);
    const total = page.totalElements;
    if (typeof total === "number") {
      data.summaryCards = data.summaryCards.map((card, index) =>
        index === 0
          ? {
              ...card,
              value: total.toLocaleString("ko-KR"),
            }
          : card,
      );
    }
  } catch {
    // API 실패 시 mock 유지
  }

  return data;
}