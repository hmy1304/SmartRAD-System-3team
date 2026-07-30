const backendApiUrl = "/api-system";

function getHeaders() {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}

/** 발령 이력 응답 */
export interface AppointmentResponse {
  id: number;
  employeeId: number;
  employeeName: string;
  appointmentTypeCode: string;
  appointmentTypeName: string;
  beforeDepartmentId: number | null;
  beforeDepartmentName: string | null;
  beforePositionCode: string | null;
  beforePositionName: string | null;
  afterDepartmentId: number | null;
  afterDepartmentName: string | null;
  afterPositionCode: string | null;
  afterPositionName: string | null;
  afterPayStep: number | null;
  applyDate: string;
  applied: boolean;
  status: string;
  note: string | null;
}

/** 발령 등록 요청 */
export interface AppointmentCreateRequest {
  employeeId: number;
  appointmentTypeCode: string;
  afterDepartmentId?: number | null;
  afterPositionCode?: string | null;
  afterPayStep?: number | null;
  applyDate: string; // YYYY-MM-DD
  note?: string;
}

/** 발령 유형 UI -> 공통코드 매핑 */
export const APPOINTMENT_TYPE_CODE_MAP: Record<string, string> = {
  승진: "APT_PROMOTE",
  전보: "APT_TRANSFER",
  보직변경: "APT_TRANSFER",
  파직: "APT_DISPATCH",
  복직: "APT_PROMOTE",
  휴직: "APT_DEMOTE",
  기타: "APT_TRANSFER",
  퇴직: "APT_PROMOTE",
  "부서 이동": "APT_TRANSFER",
  인사발령: "APT_TRANSFER",
  "표창/포상": "APT_PROMOTE",
  강등: "APT_DEMOTE",
  파견: "APT_DISPATCH",
};

export const getAllAppointments = async (): Promise<AppointmentResponse[]> => {
  const res = await fetch(`${backendApiUrl}/appointments`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch appointments');
  return res.json();
};

/** 발령 등록 POST /appointments */
export async function createAppointment(
  payload: AppointmentCreateRequest,
): Promise<AppointmentResponse> {
  const response = await fetch(`${backendApiUrl}/appointments`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`발령 등록 실패 (${response.status}): ${text}`);
  }

  return response.json();
}

/** 직원별 발령 이력 GET /appointments/history/{employeeId} */
export async function getAppointmentHistory(
  employeeId: number | string,
): Promise<AppointmentResponse[]> {
  const response = await fetch(
    `${backendApiUrl}/appointments/history/${employeeId}`,
    {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`발령 이력 조회 실패: ${response.status}`);
  }

  return response.json();
}
