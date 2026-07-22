import { approvalMockData } from "@/data/dashboard/approvalMockData";
import type { ApprovalInboxData } from "@/types/approval";

interface ApprovalApiEnvelope {
  data: ApprovalInboxData;
}

const useMockData = process.env.USE_APPROVAL_MOCK_DATA !== "false";

const backendApiUrl = process.env.BACKEND_API_URL;

const approvalPendingPath =
  process.env.APPROVAL_PENDING_API_PATH ?? "/api/v1/approvals/pending";

function isDataEnvelope(
  value: ApprovalInboxData | ApprovalApiEnvelope,
): value is ApprovalApiEnvelope {
  return "data" in value;
}

export async function getApprovalInboxData(): Promise<ApprovalInboxData> {
  /*
   * 백엔드 연결 전:
   * USE_APPROVAL_MOCK_DATA=true
   */
  if (useMockData) {
    return approvalMockData;
  }

  if (!backendApiUrl) {
    throw new Error("BACKEND_API_URL 환경변수가 설정되지 않았습니다.");
  }

  const requestUrl = new URL(approvalPendingPath, backendApiUrl).toString();

  const response = await fetch(requestUrl, {
    method: "GET",

    headers: {
      Accept: "application/json",
    },

    /*
     * 결재 데이터는 변경이 잦으므로
     * 요청할 때마다 최신 데이터를 조회합니다.
     */
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
