import type {
  EmployeeSummaryResponse,
  Page,
  // EmployeeUpdateRequest,
  AccountStatusUpdateRequest,
  AppointmentResponse,
  AppointmentCreateRequest,
  EmployeeManagementData,
  EmployeeProfileResponse,
} from "@/types/employee";
import { employeeMockData } from "@/data/dashboard/employeeMockData";

export interface AccountIssueResponse {
  empNo: string;
  temporaryPassword?: string;
}

const isServer = typeof window === "undefined";

/**
 * 서버(RSC): Docker 내부 backend 또는 localhost
 * 클라이언트: Next rewrite 프록시 /api-system
 */
function getBaseUrl() {
  if (typeof window === "undefined") {
    return (
      process.env.BACKEND_INTERNAL_URL ||
      process.env.BACKEND_URL ||
      "http://backend:8080"
    ).replace(/\/$/, "");
  }
  return "/api-system";
}

/** mock은 명시적으로 true일 때만 */
const useMockData =
  process.env.NEXT_PUBLIC_USE_EMPLOYEE_MOCK_DATA === "true";

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

function mapStatus(accountStatus?: string): {
  status: "active" | "leave" | "retire";
  statusLabel: string;
} {
  switch (accountStatus) {
    case "ACTIVE":
      return { status: "active", statusLabel: "재직" };
    case "LEAVE":
      return { status: "leave", statusLabel: "휴직" };
    case "RETIRED":
    case "LOCKED":
      return { status: "retire", statusLabel: "퇴직" };
    default:
      return { status: "active", statusLabel: accountStatus ?? "재직" };
  }
}

const AVATAR_TONES = [
  "blue",
  "orange",
  "purple",
  "green",
  "red",
  "light_blue",
] as const;

function mapRowsToManagementData(data: any): EmployeeManagementData {
  const rows: any[] = Array.isArray(data) ? data : (data.content ?? []);
  const totalCount =
    typeof data.totalElements === "number" ? data.totalElements : rows.length;

  const employees = rows.map((item: any, index: number) => {
    const { status, statusLabel } = mapStatus(item.accountStatus);
    return {
      id: String(item.id),
      name: item.name ?? "",
      initial: (item.name ?? "?").charAt(0),
      department: item.departmentName ?? "",
      position: item.positionName ?? "",
      employeeNo: item.empNo ?? "",
      status,
      statusLabel,
      employmentType: (item.jobCategoryName as any) ?? "정규직",
      avatarTone: AVATAR_TONES[index % AVATAR_TONES.length],
    };
  });

  const first = employees[0];
  const selectedEmployee = first
    ? {
        ...first,
        birthDate: "",
        gender: "",
        phone: "",
        email: "",
        address: "",
        emergencyContact: "",
        licenseType: "",
        licenseNo: "",
        specialty: "",
        acquiredDate: "",
        departmentFull: first.department,
        jobTitle: first.position,
        rank: "",
        hireDate: "",
        employeeNoFull: first.employeeNo,
        workType: String(first.employmentType ?? ""),
        duty: "",
        currentRank: first.position,
        currentPayGrade: "",
        promotionDate: "",
        nextPromotion: "",
        bankName: "",
        accountNo: "",
        salaryDay: "",
        rankHistory: [],
      }
    : null;

  return {
    totalCount,
    employees,
    selectedEmployee,
  };
}

// ---------- 목록 (관리 페이지용) ----------

/** 목록 조회 **/
export async function getEmployeeManagementData(): Promise<EmployeeManagementData> {
  // 디버그: mock 완전 차단
  // if (useMockData) return employeeMockData;

  try {
    const base = getBaseUrl();
    console.log("[getEmployeeManagementData] base =", base);

    const response = await fetch(`${base}/employees?size=50`, {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    });

    console.log("[getEmployeeManagementData] status =", response.status);

    if (!response.ok) {
      // mock 대신 빈 목록 → 화면에서 바로 구분 가능
      return { totalCount: 0, employees: [], selectedEmployee: null };
    }

    const data = await response.json();
    console.log(
      "[getEmployeeManagementData] rows =",
      Array.isArray(data) ? data.length : data.content?.length,
    );
    return mapRowsToManagementData(data);
  } catch (err) {
    console.error("[getEmployeeManagementData] error:", err);
    return { totalCount: 0, employees: [], selectedEmployee: null };
  }
}

// ---------- 목록 (원본 Page) ----------

export async function getEmployees(
  size = 50,
  keyword?: string,
  departmentId?: string,
  roleGroupId?: string,
): Promise<Page<EmployeeSummaryResponse>> {
  const base = getBaseUrl();
  let url = `${base}/employees?size=${size}`;
  if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
  if (departmentId) url += `&departmentId=${encodeURIComponent(departmentId)}`;
  if (roleGroupId) url += `&roleGroupId=${encodeURIComponent(roleGroupId)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch employees");
  }
  return response.json();
}

// ---------- 등록 / 상세 / 수정 ----------

export interface CreateEmployeeRequest {
  empNo: string;
  name: string;
  email?: string;
  phone?: string;
  joinDate: string;
  isShiftWorker?: boolean;
  gender?: string;
  birthDate?: string;
  address?: string;
  internalPhone?: string;
  emergencyContact?: string;
  emergencyRelation?: string;
  departmentId: number;
  positionCode?: string;
  jobCategoryCode?: string;
  employmentTypeCode?: string;
  hireRouteCode?: string;
  workTypeCode?: string;
  workWard?: string;
  payStep?: number;
  payrollTypeCode?: string;
  payrollDate?: number;
  bankAccount?: string;
  taxTypeCode?: string;
  roleGroupId?: number;
}

export async function createEmployeeDetailed(
  payload: CreateEmployeeRequest,
): Promise<{ id: number; empNo?: string }> {
  const base = getBaseUrl();
  const response = await fetch(`${base}/employees`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`직원 등록 실패 (${response.status}): ${text}`);
  }

  return response.json();
}

/** 직원 상세 */
export async function getEmployeeById(id: number | string) {
  const base = getBaseUrl();
  const response = await fetch(`${base}/employees/${id}`, {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`직원 조회 실패: ${response.status}`);
  }
  return response.json();
}

/** 직원 종합 프로필 조회 (360도 뷰) */
export async function getEmployeeProfile(
  id: string | number,
): Promise<EmployeeProfileResponse> {
  const base = getBaseUrl();
  const response = await fetch(`${base}/employees/${id}/profile`, {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`직원 종합 프로필 조회 실패: ${response.status}`);
  }
  return response.json();
}

/** 직원 부분 수정 (PATCH) — null 필드는 서버에서 무시 */
export type EmployeeUpdateRequest = {
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  birthDate?: string; // YYYY-MM-DD
  address?: string;
  internalPhone?: string;
  emergencyContact?: string;
  emergencyRelation?: string;
  departmentId?: number;
  positionCode?: string;
  jobCategoryCode?: string;
  employmentTypeCode?: string;
  hireRouteCode?: string;
  workTypeCode?: string;
  workWard?: string;
  payStep?: number;
  payrollTypeCode?: string;
  payrollDate?: number;
  bankAccount?: string;
  bankName?: string;
  taxTypeCode?: string;
  roleGroupId?: number;
  isShiftWorker?: boolean;
};

export async function updateEmployee(
  id: number | string,
  payload: EmployeeUpdateRequest,
): Promise<void> {
  const base = getBaseUrl();
  const response = await fetch(`${base}/employees/${id}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`직원 수정 실패 (${response.status}): ${text}`);
  }
}

export async function updateEmployeeRole(
  id: number,
  roleGroupId: number,
): Promise<void> {
  const base = getBaseUrl();
  const request: EmployeeUpdateRequest = { roleGroupId };
  const response = await fetch(`${base}/employees/${id}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to update employee role");
  }
}

export async function updateAccountStatus(
  id: number,
  accountStatus: "ACTIVE" | "LOCKED",
): Promise<void> {
  const base = getBaseUrl();
  const request: AccountStatusUpdateRequest = { accountStatus };
  const response = await fetch(`${base}/employees/${id}/account-status`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to update account status");
  }
}

export async function issueAccount(id: number): Promise<AccountIssueResponse> {
  const base = getBaseUrl();
  const response = await fetch(`${base}/employees/${id}/issue-account`, {
    method: "POST",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to issue account");
  }
  return response.json();
}

export async function deleteEmployees(ids: number[]): Promise<void> {
  const base = getBaseUrl();
  const response = await fetch(`${base}/employees?ids=${ids.join(",")}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete employees");
  }
}

// ---------- 발령 ----------

export async function getAppointmentHistory(
  employeeId: number | string,
): Promise<AppointmentResponse[]> {
  const base = getBaseUrl();
  const response = await fetch(
    `${base}/appointments/history/${employeeId}`,
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

export async function createAppointment(
  payload: AppointmentCreateRequest,
): Promise<AppointmentResponse> {
  const base = getBaseUrl();
  const response = await fetch(`${base}/appointments`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`이력 등록 실패 (${response.status}): ${text}`);
  }
  return response.json();
}