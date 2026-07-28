import type { Metadata } from "next";
import EmployeeEditPage from "@/component/dashboard/EmployeePage/EmployeeEditPage";

export const metadata: Metadata = {
  title: "직원 정보 수정 | SmartRAD HR",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EmployeeEditRoutePage({ params }: Props) {
  const { id } = await params;
  return <EmployeeEditPage employeeId={id} />;
}