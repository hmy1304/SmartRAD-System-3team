import type { Metadata } from "next";

import ApprovalInboxPage from "@/component/dashboard/ApprovalInboxPage/ApprovalInboxPage";

export const metadata: Metadata = {
  title: "결재 대기함 | SmartRAD HR",
  description: "SmartRAD HR 전자결재 결재 대기문서 목록",
};

export default function ApprovalInboxRoutePage() {
  return <ApprovalInboxPage />;
}
