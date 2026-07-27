import type { Metadata } from "next";

import PayrollInfoPage from "@/component/dashboard/PayrollInfoPage/PayrollInfoPage";

export const metadata: Metadata = {
  title: "급여 기본 정보 관리 | SmartRAD HR",
  description: "SmartRAD HR 급여 기본 정보 관리",
};

export default function PayrollInfoRoutePage() {
  return <PayrollInfoPage />;
}
