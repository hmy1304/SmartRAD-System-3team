import type { Metadata } from "next";

import DashboardPage from "@/component/dashboard/DashboardPage/DashboardPage";
import { getDashboardData } from "@/services/dashboardService";

export const metadata: Metadata = {
  title: "대시보드 | SmartRAD HR",
  description: "SmartRAD HR 병원 인사관리 대시보드",
};

export default async function DashboardRoutePage() {
  const initialData = await getDashboardData();
  return <DashboardPage initialData={initialData} />;
}
