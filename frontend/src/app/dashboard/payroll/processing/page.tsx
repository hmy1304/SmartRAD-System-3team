import type { Metadata } from "next";

import PayrollProcessingPage from "@/component/dashboard/PayrollProcessingPage/PayrollProcessingPage";

export const metadata: Metadata = {
  title: "급여 처리 | SmartRAD HR",
  description: "SmartRAD HR 급여 처리",
};

export default function PayrollProcessingRoutePage() {
  return <PayrollProcessingPage />;
}
