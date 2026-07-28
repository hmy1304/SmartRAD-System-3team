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
 * 1. 상단 KPI 요약 수치 및 우측 위젯 통계 실시간 DB 조회 (연/월 필터 장착)
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
 * 2. 휴가 신청 현황 테이블 목록 실시간 조회 (연/월 구간 검색 장착)
 */
export async function fetchLeaveApplications(
  status?: string,
  type?: string,
  keyword?: string,
  year?: number,
  month?: number,
): Promise<LeaveApplicationResponse[]> {
  const params = new URLSearchParams();
  if (status && status !== "전체") params.append("status", status);
  if (type && type !== "≡ 유형 전체" && type !== "전체") params.append("type", type);
  if (keyword) params.append("keyword", keyword);
  if (year) params.append("year", year.toString());
  if (month) params.append("month", month.toString());

  const response = await fetch(`${apiUrl}/applications?${params.toString()}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("휴가 신청 내역 조회 실패");
  }
  return response.json();
}

/**
 * 3. 사원별 연차 할당 대장 실시간 조회 (없을 시 15일 할당 자동 개설)
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
 * 4. 신규 휴가 신청 등록 (첨부파일 포함 FormData 전송)
 */
export async function submitLeaveApplication(
  formData: FormData,
): Promise<LeaveApplicationResponse> {
  const response = await fetch(`${apiUrl}/applications`, {
    method: "POST",
    headers: getHeaders(true), // Multipart boundary 허용
    body: formData,
  });
  if (!response.ok) {
    throw new Error("휴가 신청 등록 실패");
  }
  return response.json();
}

/**
 * 5. 선택 휴가 일괄 승인/반려 (트랜잭션 연도별 연차 차감/복구 연계)
 */
export async function updateLeaveStatuses(
  applicationIds: (number | string)[],
  status: "승인완료" | "반려" | "승인대기",
  note?: string,
): Promise<void> {
  const response = await fetch(`${apiUrl}/applications/status`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ applicationIds, status, note }),
  });
  if (!response.ok) {
    throw new Error("결재 상태 변경 실패");
  }
}

/**
 * 6. 휴가 신청 즉시 취소 및 첨부파일 소각
 */
export async function deleteLeaveApplication(
  id: number | string,
): Promise<void> {
  const response = await fetch(`${apiUrl}/applications/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("휴가 신청 취소 실패");
  }
}

/**
 * 7. 백엔드 서버 사이드 감사 보고서 엑셀(CSV) 스트림 직접 다운로드 요청
 */
export async function downloadLeaveReportServer(
  year?: number,
  month?: number,
  status?: string,
  type?: string,
  keyword?: string,
): Promise<void> {
  const params = new URLSearchParams();
  if (year) params.append("year", year.toString());
  if (month) params.append("month", month.toString());
  if (status && status !== "전체") params.append("status", status);
  if (type && type !== "≡ 유형 전체") params.append("type", type);
  if (keyword) params.append("keyword", keyword);

  const headers: Record<string, string> = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${apiUrl}/export?${params.toString()}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error("서버 보고서 다운로드 실패");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const fileName = `휴가감사보고서_${year || "전체"}년_${month ? month + "월" : "전체월"}.csv`;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
