import type { Metadata } from "next";

import ApprovalInboxPage from "@/component/dashboard/ApprovalInboxPage/ApprovalInboxPage";
import { getApprovalInboxData } from "@/services/approvalService";

export const metadata: Metadata = {
  title: "결재 대기함 | SmartRAD HR",
  description: "SmartRAD HR 전자결재 결재 대기 문서 목록",
};

export default async function ApprovalInboxRoutePage() {
  const initialData = await getApprovalInboxData();

  return <ApprovalInboxPage initialData={initialData} />;
}
