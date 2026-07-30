import { approvalMockData } from "@/data/dashboard/approvalMockData";
import type { ApprovalInboxData } from "@/types/approval";

interface ApprovalApiEnvelope {
  data: ApprovalInboxData;
}

const isServer = typeof window === "undefined";

function getBaseUrl() {
  if (isServer) {
    return (
      process.env.BACKEND_INTERNAL_URL ||
      process.env.BACKEND_URL ||
      "http://backend:8080"
    ).replace(/\/$/, "");
  }
  // Client requests use the Next.js rewrite proxy to /api-system
  return "/api-system";
}

const useMockData = process.env.NEXT_PUBLIC_USE_APPROVAL_MOCK_DATA === "true";
const approvalPendingPath = process.env.APPROVAL_PENDING_API_PATH ?? "/api/v1/approvals/pending";

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (!isServer) {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

function isDataEnvelope(
  value: ApprovalInboxData | ApprovalApiEnvelope,
): value is ApprovalApiEnvelope {
  return "data" in value;
}

export async function getApprovalInboxData(
  approverId?: number,
): Promise<ApprovalInboxData> {
  if (useMockData) {
    return approvalMockData;
  }

  let id = approverId;
  if (id == null && !isServer) {
    try {
      const raw = localStorage.getItem("userProfile");
      if (raw) {
        const p = JSON.parse(raw) as { employeeId?: number };
        if (p.employeeId) id = Number(p.employeeId);
      }
    } catch {
      /* ignore */
    }
  }
  if (id == null) id = 1;

  const requestUrl = `${getBaseUrl()}${approvalPendingPath}?approverId=${id}`;

  const response = await fetch(requestUrl, {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `결재 대기함 조회 실패: ${response.status} ${response.statusText}`,
    );
  }

  const responseData = (await response.json()) as
    | ApprovalInboxData
    | ApprovalApiEnvelope;

  return isDataEnvelope(responseData) ? responseData.data : responseData;
}

export async function getDraftApprovals(drafterId: string, status: string = "ALL"): Promise<import("@/types/approval").ApprovalDraftData> {
  if (useMockData) {
    return {
      summary: { totalDrafts: 0, pendingDrafts: 0, approvedThisMonth: 0, rejectedDrafts: 0, temporaryDrafts: 0 },
      tabs: { inProgress: 0, rejected: 0, approved: 0, temporary: 0 },
      documents: []
    };
  }

  const requestUrl = new URL(`${getBaseUrl()}/api/v1/approvals/drafts`, isServer ? undefined : window.location.origin);
  requestUrl.searchParams.append("drafterId", drafterId);
  requestUrl.searchParams.append("status", status);

  const response = await fetch(isServer ? requestUrl.toString() : requestUrl.pathname + requestUrl.search, {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`기안 문서함 조회 실패: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

export async function createDocument(data: any): Promise<any> {
  if (useMockData) return {};
  
  const requestUrl = `${getBaseUrl()}/api/v1/approvals`;
  const response = await fetch(requestUrl, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`문서 기안 실패: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}
