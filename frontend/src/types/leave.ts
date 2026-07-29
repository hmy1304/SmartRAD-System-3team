export interface TypeStat {
  type: string;
  count: number;
  percentage: number;
}

export interface RiskEmployee {
  employeeId: number;
  name: string;
  initial: string;
  department: string;
  remainingDays: number;
  tone: string;
  tagStyle: string;
}

export interface LeaveSummaryResponse {
  totalAllocatedDays: number;
  totalUsedDays: number;
  usedPercentage: number;
  totalRemainingDays: number;
  thisMonthApplications: number;
  pendingApplications: number;
  riskEmployeeCount: number;
  typeStats: TypeStat[];
  riskEmployees: RiskEmployee[];
}

export interface LeaveApplicationResponse {
  id: string | number;
  employeeId: number;
  name: string;
  initial: string;
  position: string;
  department: string;
  tone: "blue" | "cyan" | "green" | "purple" | "red" | "orange" | "amber";
  type: string;
  applyDate: string;
  period: string;
  days: string;
  remainText: string;
  remainType: "normal" | "doc" | "danger";
  proxy: string;
  approver: string;
  status: "승인대기" | "승인완료" | "반려";
  note: string;
  attachmentName?: string;
  hasAttachment?: boolean;
}

export interface EmployeeQuotaResponse {
  employeeId: number;
  employeeName: string;
  initial: string;
  departmentName: string;
  positionName: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}
