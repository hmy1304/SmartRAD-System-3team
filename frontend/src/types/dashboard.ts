export type DashboardSummaryStatus = "up" | "good" | "normal" | "warn";

export type DashboardSummaryIcon = "people" | "check" | "calendar" | "document";

export type ApprovalItemColor = "red" | "yellow" | "blue" | "green";

export type AttendanceStatus = "good" | "working" | "late" | "off";

export type MyApprovalStatus = "wait" | "approve" | "reject";

export interface DashboardProfile {
  name: string;
  initial: string;
  department: string;
  role: string;
}

export interface DashboardSummaryCard {
  label: string;
  value: string;
  unit: string;
  status: string;
  statusType: DashboardSummaryStatus;
  icon: DashboardSummaryIcon;
}

export interface DashboardApprovalItem {
  id: number;
  text: string;
  color: ApprovalItemColor;
  badge: string;
}

export interface DashboardAttendanceItem {
  id: number;
  name: string;
  dept: string;
  time: string;
  status: string;
  statusType: AttendanceStatus;
}

export interface DashboardNotice {
  id: number;
  title: string;
  date: string;
}

export interface DashboardMyApproval {
  id: number;
  title: string;
  author: string;
  date: string;
  status: string;
  statusType: MyApprovalStatus;
}

export interface DashboardApprovalCounts {
  waiting: number;
  approved: number;
  rejected: number;
}

export interface DashboardData {
  profile: DashboardProfile;
  summaryCards: DashboardSummaryCard[];
  approvalItems: DashboardApprovalItem[];
  attendanceList: DashboardAttendanceItem[];
  notices: DashboardNotice[];
  myApprovals: DashboardMyApproval[];
  approvalCounts: DashboardApprovalCounts;
}
