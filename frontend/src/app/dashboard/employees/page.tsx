import type { Metadata } from "next";
import EmployeeManagementPage from "@/component/dashboard/EmployeePage/EmployeeManagementPage";
import { getEmployeeManagementData } from "@/services/employeeService";

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "직원관리 | SmartRAD HR",
  description: "SmartRAD HR 직원 관리",
};

export default async function EmployeesPage() {
  const initialData = await getEmployeeManagementData();
  return <EmployeeManagementPage initialData={initialData} />;
}
