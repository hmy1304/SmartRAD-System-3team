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

/** 결재 대기함 조회. 결재자는 서버가 JWT 에서 판별하므로 별도 식별자를 보내지 않는다. */
export async function getApprovalInboxData(): Promise<ApprovalInboxData> {


  const requestUrl = `${getBaseUrl()}${approvalPendingPath}`;

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

/** 기안 문서함 조회. 기안자는 서버가 JWT 에서 판별한다. */
export async function getDraftApprovals(status: string = "ALL"): Promise<import("@/types/approval").ApprovalDraftData> {


  const requestUrl = new URL(`${getBaseUrl()}/api/v1/approvals/drafts`, isServer ? undefined : window.location.origin);
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

  
  const response = await fetch(`${getBaseUrl()}/api/v1/approvals`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`기안 생성 실패: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

export async function resubmitDocument(documentId: string | number, data: any): Promise<any> {
  const response = await fetch(`${getBaseUrl()}/api/v1/approvals/${documentId}/resubmit`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`재신청 실패: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

export async function getApprovalDetail(id: number | string): Promise<any> {

  const requestUrl = `${getBaseUrl()}/api/v1/approvals/${id}`;
  const response = await fetch(requestUrl, {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`문서 상세 조회 실패: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}
