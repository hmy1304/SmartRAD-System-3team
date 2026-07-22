import type { Metadata } from "next";

import DraftDocumentsPage from "@/component/dashboard/DraftDocumentsPage/DraftDocumentsPage";

export const metadata: Metadata = {
  title: "기안 문서함 | SmartRAD HR",
  description: "SmartRAD HR 전자결재 기안 문서함",
};

export default function DraftDocumentsRoutePage() {
  return <DraftDocumentsPage />;
}
