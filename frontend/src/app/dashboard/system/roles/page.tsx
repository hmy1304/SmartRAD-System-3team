import { Metadata } from "next";
import RoleManagementPage from "@/component/dashboard/RoleManagementPage/RoleManagementPage";

export const metadata: Metadata = {
  title: "사용자/권한 관리 | SmartRAD HR",
  description: "직원 계정을 관리하고 시스템 접근 권한을 설정합니다.",
};

export default function RolesPage() {
  return <RoleManagementPage />;
}
