import type {
  LeaveSummaryResponse,
  LeaveApplicationResponse,
  EmployeeQuotaResponse,
} from "@/types/leave";

const apiUrl = "/api/v1/leave";

function getHeaders(isMultipart = false): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

/**
 * 1. 상단 KPI 요약 수치 및 우측 위젯 통계 조회
 */
export async function fetchLeaveSummary(
  year?: number,
  month?: number,
  departmentId?: number,
): Promise<LeaveSummaryResponse> {
  const params = new URLSearchParams();
  if (year) params.append("year", year.toString());
  if (month) params.append("month", month.toString());
  if (departmentId) params.append("departmentId", departmentId.toString());

  const response = await fetch(`${apiUrl}/summary?${params.toString()}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("휴가 통계 데이터 조회 실패");
  }
  return response.json();
}

/**
 * 2. 휴가 신청 현황 테이블 목록 조회
 */
export async function fetchLeaveApplications(
  status?: string,
  type?: string,
  keyword?: string,
): Promise<LeaveApplicationResponse[]> {
  const params = new URLSearchParams();
  if (status && status !== "전체") params.append("status", status);
  if (type && type !== "≡ 유형 전체" && type !== "전체") params.append("type", type);
  if (keyword) params.append("keyword", keyword);

  const response = await fetch(`${apiUrl}/applications?${params.toString()}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("휴가 신청 목록 조회 실패");
  }
  return response.json();
}

/**
 * 3. 특정 사원의 실시간 연차 할당 대장 조회
 */
export async function fetchEmployeeQuota(
  employeeId: number | string,
  year?: number,
): Promise<EmployeeQuotaResponse> {
  const params = new URLSearchParams();
  if (year) params.append("year", year.toString());

  const response = await fetch(
    `${apiUrl}/quota/${employeeId}?${params.toString()}`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );
  if (!response.ok) {
    throw new Error("사원 연차 정보 조회 실패");
  }
  return response.json();
}

/**
 * 4. 신규 휴가 신청 등록 (첨부파일 전송 포함)
 */
export async function submitLeaveApplication(
  formData: FormData,
): Promise<LeaveApplicationResponse> {
  const response = await fetch(`${apiUrl}/applications`, {
    method: "POST",
    headers: getHeaders(true),
    body: formData,
  });
  if (!response.ok) {
    throw new Error("휴가 신청 등록에 실패했습니다.");
  }
  return response.json();
}

/**
 * 5. 선택 항목 일괄 승인/반려 (트랜잭션 연차 감시 연동)
 */
export async function updateLeaveStatuses(
  applicationIds: (number | string)[],
  status: "승인완료" | "반려" | "APPROVED" | "REJECTED",
  note?: string,
): Promise<void> {
  const numericIds = applicationIds.map((id) => Number(id));
  const response = await fetch(`${apiUrl}/applications/status`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ applicationIds: numericIds, status, note: note || "" }),
  });
  if (!response.ok) {
    throw new Error("결재 상태 변경에 실패했습니다.");
  }
}

/**
 * 6. 휴가 신청 파기 및 첨부파일 즉시 삭제
 */
export async function deleteLeaveApplication(
  id: number | string,
): Promise<void> {
  const response = await fetch(`${apiUrl}/applications/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("휴가 신청 삭제에 실패했습니다.");
  }
}
