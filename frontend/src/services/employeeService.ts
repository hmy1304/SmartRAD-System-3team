import type {
  EmployeeSummaryResponse,
  Page,
  EmployeeUpdateRequest,
  AccountStatusUpdateRequest,
  EmployeeCreateRequest,
} from "@/types/employee";
import { employeeMockData } from "@/data/dashboard/employeeMockData";
import type { EmployeeManagementData } from "@/types/employee";

export interface AccountIssueResponse {
  empNo: string;
  temporaryPassword?: string; // Optional depending on how the backend sends it
}

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

export async function getEmployees(
  size = 50,
  keyword?: string,
  departmentId?: string,
  roleGroupId?: string
): Promise<Page<EmployeeSummaryResponse>> {
  let url = `${backendApiUrl}/employees?size=${size}`;
  if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
  if (departmentId) url += `&departmentId=${encodeURIComponent(departmentId)}`;
  if (roleGroupId) url += `&roleGroupId=${encodeURIComponent(roleGroupId)}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch employees");
  }
  return response.json();
}

export async function updateEmployeeRole(
  id: number,
  roleGroupId: number
): Promise<void> {
  const request: EmployeeUpdateRequest = { roleGroupId };
  const response = await fetch(`${backendApiUrl}/employees/${id}`, {
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
  accountStatus: "ACTIVE" | "LOCKED"
): Promise<void> {
  const request: AccountStatusUpdateRequest = { accountStatus };
  const response = await fetch(`${backendApiUrl}/employees/${id}/account-status`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to update account status");
  }
}

export async function issueAccount(id: number): Promise<any> {
  const response = await fetch(`${backendApiUrl}/employees/${id}/issue-account`, {
    method: "POST",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to issue account");
  }
  return response.json();
}

export async function deleteEmployees(ids: number[]): Promise<void> {
  const response = await fetch(`${backendApiUrl}/employees?ids=${ids.join(',')}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete employees");
  }
}


export async function createEmployee(request: EmployeeCreateRequest): Promise<void> {
  const response = await fetch(`${backendApiUrl}/employees`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to create employee");
  }
}

const useMockData = process.env.USE_EMPLOYEE_MOCK_DATA !== "false";
const employeeApiPath = process.env.EMPLOYEE_API_PATH ?? "/api/v1/employees";

/** 목록 조회 */
export async function getEmployeeManagementData(): Promise<EmployeeManagementData> {
  if (useMockData) {
    return employeeMockData;
  }

  const response = await fetch(
    employeeApiPath,
    {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`직원 목록 조회 실패: ${response.status}`);
  }

  return response.json();
}

/** 직원 등록 요청 타입 */
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

/** 직원 등록 (상세) */
export async function createEmployeeDetailed(
  payload: CreateEmployeeRequest,
): Promise<{ id: number; empNo?: string }> {
  if (!backendApiUrl) {
    throw new Error("BACKEND_API_URL 환경변수가 설정되지 않았습니다.");
  }

  const response = await fetch(
    new URL("/employees", backendApiUrl).toString(),
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`직원 등록 실패 (${response.status}): ${text}`);
  }

  return response.json();
}
