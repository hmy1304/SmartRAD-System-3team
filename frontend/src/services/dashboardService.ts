import type {
  DashboardAttendanceItem,
  DashboardApprovalItem,
  DashboardData,
  DashboardMyApproval,
  AttendanceStatus,
  MyApprovalStatus,
} from "@/types/dashboard";
import { getEmployees } from "@/services/employeeService";

const isServer = typeof window === "undefined";

function getBaseUrl() {
  if (isServer) {
    return (
      process.env.BACKEND_INTERNAL_URL ||
      process.env.BACKEND_URL ||
      "http://backend:8080"
    ).replace(/\/$/, "");
  }
  return "/api-system";
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (!isServer) {
    const token = localStorage.getItem("accessToken");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

function todayYmd() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getEmployeeId(): number {
  if (!isServer) {
    try {
      const raw = localStorage.getItem("userProfile");
      if (raw) {
        const p = JSON.parse(raw) as { employeeId?: number; id?: number };
        if (p.employeeId != null) return Number(p.employeeId);
        if (p.id != null) return Number(p.id);
      }
    } catch {
      /* ignore */
    }
  }
  return Number(process.env.DASHBOARD_DEFAULT_EMPLOYEE_ID ?? 1);
}

/** mock 없이 0 기준 초기값 */
function createEmptyDashboard(): DashboardData {
  return {
    profile: {
      name: "관리자",
      initial: "관",
      department: "-",
      role: "-",
    },
    summaryCards: [
      {
        label: "전체 직원",
        value: "0",
        unit: "명",
        status: "-",
        statusType: "good",
        icon: "people",
      },
      {
        label: "금일 출근",
        value: "0",
        unit: "명",
        status: "-",
        statusType: "good",
        icon: "check",
      },
      {
        label: "휴가 중",
        value: "0",
        unit: "명",
        status: "-",
        statusType: "good",
        icon: "calendar",
      },
      {
        label: "결재 대기",
        value: "0",
        unit: "건",
        status: "0건",
        statusType: "good",
        icon: "document",
      },
    ],
    approvalItems: [],
    attendanceList: [],
    notices: [],
    myApprovals: [],
    approvalCounts: {
      waiting: 0,
      approved: 0,
      rejected: 0,
    },
  };
}

type AttendanceRow = {
  id: number;
  empNo?: string;
  employeeName?: string;
  departmentName?: string;
  checkInTime?: string | null;
  status?: string;
};

function mapAttendanceStatus(status?: string): {
  status: string;
  statusType: AttendanceStatus;
} {
  const s = (status ?? "").toUpperCase();
  if (s.includes("LATE") || s.includes("지각"))
    return { status: "지각", statusType: "late" };
  if (s.includes("LEAVE") || s.includes("휴가") || s.includes("휴무"))
    return { status: "휴무", statusType: "off" };
  if (s.includes("ABSENT") || s.includes("결근"))
    return { status: "결근", statusType: "off" };
  if (s.includes("WORKING") || s.includes("근무"))
    return { status: "근무중", statusType: "working" };
  return { status: "정상", statusType: "good" };
}

function formatTime(t?: string | null) {
  if (!t) return "-";
  return String(t).slice(0, 5);
}

async function fetchTodayAttendance(): Promise<AttendanceRow[]> {
  const day = todayYmd();
  const url = `${getBaseUrl()}/api/v1/attendance/admin?startDate=${day}&endDate=${day}&size=50`;
  const res = await fetch(url, { headers: getHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(`attendance ${res.status}`);
  const json = await res.json();
  if (Array.isArray(json)) return json;
  if (Array.isArray(json.content)) return json.content;
  return [];
}

async function fetchLeaveOnCount(): Promise<number> {
  const url = `${getBaseUrl()}/api/v1/leave/applications`;
  const res = await fetch(url, { headers: getHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(`leave ${res.status}`);
  const json = await res.json();
  const list: Array<{ status?: string }> = Array.isArray(json)
    ? json
    : Array.isArray(json.content)
      ? json.content
      : [];

  return list.filter((x) => {
    const s = (x.status ?? "").toUpperCase();
    return (
      s.includes("APPROV") ||
      s.includes("PROGRESS") ||
      s.includes("승인") ||
      s.includes("진행") ||
      s === "ON_LEAVE"
    );
  }).length;
}

type ApprovalInbox = {
  summary?: { totalPending?: number; urgentPending?: number };
  documents?: Array<{
    id: string;
    title: string;
    priority?: string;
    priorityLabel?: string;
  }>;
};

async function fetchApprovalInbox(approverId: number): Promise<ApprovalInbox> {
  const url = `${getBaseUrl()}/api/v1/approvals/pending?approverId=${approverId}`;
  const res = await fetch(url, { headers: getHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(`approval ${res.status}`);
  return res.json();
}

async function fetchDraftSummary(drafterId: number): Promise<{
  waiting: number;
  approved: number;
  rejected: number;
  docs: DashboardMyApproval[];
}> {
  const url = `${getBaseUrl()}/api/v1/approvals/drafts?drafterId=${drafterId}&status=ALL`;
  const res = await fetch(url, { headers: getHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(`drafts ${res.status}`);
  const json = await res.json();

  const documents: Array<{
    id?: string | number;
    title?: string;
    status?: string;
    statusLabel?: string;
    requestedAt?: string;
    createdAt?: string;
    drafter?: string;
  }> = json.documents ?? json.content ?? [];

  let waiting = 0;
  let approved = 0;
  let rejected = 0;

  const docs: DashboardMyApproval[] = documents.slice(0, 8).map((d, i) => {
    const st = (d.status ?? d.statusLabel ?? "").toUpperCase();
    let status = "대기중";
    let statusType: MyApprovalStatus = "wait";

    if (st.includes("APPROV") || st.includes("승인")) {
      status = "승인";
      statusType = "approve";
      approved += 1;
    } else if (st.includes("REJECT") || st.includes("반려")) {
      status = "반려";
      statusType = "reject";
      rejected += 1;
    } else {
      waiting += 1;
    }

    const dateRaw = d.requestedAt ?? d.createdAt ?? "";
    return {
      id: Number(d.id) || i + 1,
      title: d.title ?? "제목 없음",
      author: d.drafter ?? "-",
      date: String(dateRaw).slice(0, 10).replaceAll("-", "."),
      status,
      statusType,
    };
  });

  if (json.summary) {
    waiting = json.summary.pendingDrafts ?? json.tabs?.inProgress ?? waiting;
    approved =
      json.summary.approvedThisMonth ?? json.tabs?.approved ?? approved;
    rejected = json.summary.rejectedDrafts ?? json.tabs?.rejected ?? rejected;
  }

  return { waiting, approved, rejected, docs };
}

function badgeColor(
  priority?: string,
  label?: string,
): { color: "red" | "yellow" | "blue" | "green"; badge: string } {
  const p = (priority ?? "").toLowerCase();
  const l = label ?? "";
  if (p === "urgent" || l.includes("긴급"))
    return { color: "red", badge: "긴급" };
  if (l.includes("대기")) return { color: "yellow", badge: "대기" };
  if (l.includes("일반")) return { color: "blue", badge: "일반" };
  return { color: "green", badge: l || "일반" };
}

export async function getDashboardData(): Promise<DashboardData> {
  const data = createEmptyDashboard();
  const employeeId = getEmployeeId();

  // profile (로컬)
  if (!isServer) {
    try {
      const raw = localStorage.getItem("userProfile");
      if (raw) {
        const p = JSON.parse(raw) as {
          name?: string;
          departmentName?: string;
          roleGroupName?: string;
        };
        if (p.name) {
          data.profile.name = p.name;
          data.profile.initial = p.name.charAt(0);
        }
        if (p.departmentName) data.profile.department = p.departmentName;
        if (p.roleGroupName) data.profile.role = p.roleGroupName;
      }
    } catch {
      /* ignore */
    }
  }

  // 1) 전체 직원
  try {
    const page = await getEmployees(1);
    const total =
      typeof page.totalElements === "number" ? page.totalElements : 0;
    data.summaryCards[0] = {
      ...data.summaryCards[0],
      value: total.toLocaleString("ko-KR"),
      status: total > 0 ? "정상" : "-",
      statusType: "good",
    };
  } catch {
    data.summaryCards[0] = {
      ...data.summaryCards[0],
      value: "0",
      status: "-",
      statusType: "good",
    };
  }

  // 2) 금일 출근 + 근무 현황
  try {
    const rows = await fetchTodayAttendance();
    const present = rows.filter((r) => {
      const s = (r.status ?? "").toUpperCase();
      return (
        !s.includes("ABSENT") &&
        !s.includes("LEAVE") &&
        !s.includes("휴무") &&
        !s.includes("결근")
      );
    });

    data.summaryCards[1] = {
      ...data.summaryCards[1],
      value: String(present.length),
      status: "정상",
      statusType: "good",
    };

    data.attendanceList = rows.slice(0, 8).map((r) => {
      const mapped = mapAttendanceStatus(r.status);
      return {
        id: r.id,
        name: r.employeeName ?? r.empNo ?? "-",
        dept: r.departmentName ?? "-",
        time: formatTime(r.checkInTime),
        status: mapped.status,
        statusType: mapped.statusType,
      } satisfies DashboardAttendanceItem;
    });
  } catch {
    data.summaryCards[1] = {
      ...data.summaryCards[1],
      value: "0",
      status: "-",
      statusType: "good",
    };
    data.attendanceList = [];
  }

  // 3) 휴가 중
  try {
    const leaveCount = await fetchLeaveOnCount();
    const leaveStatusType: "normal" | "good" =
      leaveCount > 20 ? "normal" : "good";
    data.summaryCards[2] = {
      ...data.summaryCards[2],
      value: String(leaveCount),
      status: leaveCount > 20 ? "보통" : "정상",
      statusType: leaveStatusType,
    };
  } catch {
    data.summaryCards[2] = {
      ...data.summaryCards[2],
      value: "0",
      status: "-",
      statusType: "good",
    };
  }

  // 4) 결재 대기
  try {
    const inbox = await fetchApprovalInbox(employeeId);
    const totalPending =
      inbox.summary?.totalPending ?? inbox.documents?.length ?? 0;
    const urgent = inbox.summary?.urgentPending ?? 0;
    const pendingStatusType: "warn" | "good" = urgent > 0 ? "warn" : "good";

    data.summaryCards[3] = {
      ...data.summaryCards[3],
      value: String(totalPending),
      status: `${urgent}건`,
      statusType: pendingStatusType,
    };

    data.approvalItems = (inbox.documents ?? []).slice(0, 4).map((d, idx) => {
      const { color, badge } = badgeColor(d.priority, d.priorityLabel);
      return {
        id: idx + 1,
        text: d.title,
        color,
        badge,
      } satisfies DashboardApprovalItem;
    });
  } catch {
    data.summaryCards[3] = {
      ...data.summaryCards[3],
      value: "0",
      status: "0건",
      statusType: "good",
    };
    data.approvalItems = [];
  }

  // 5) 나의 결재함
  try {
    const draft = await fetchDraftSummary(employeeId);
    data.approvalCounts = {
      waiting: draft.waiting,
      approved: draft.approved,
      rejected: draft.rejected,
    };
    data.myApprovals = draft.docs;
  } catch {
    data.approvalCounts = { waiting: 0, approved: 0, rejected: 0 };
    data.myApprovals = [];
  }

  return data;
}