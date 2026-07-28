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

export type DepartmentResponse = {
  id: number;
  name: string;
  parentId?: number | null;
  parentName?: string | null;
};

export async function getDepartments(): Promise<DepartmentResponse[]> {
  const res = await fetch(`${backendApiUrl}/departments`, {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`부서 목록 조회 실패: ${res.status}`);
  }
  return res.json();
}

export async function createDepartment(payload: {
  name: string;
  parentId?: number;
}): Promise<DepartmentResponse> {
  const res = await fetch(`${backendApiUrl}/departments`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`부서 등록 실패 (${res.status}): ${text}`);
  }
  return res.json();
}

export async function updateDepartment(
  id: number | string,
  payload: { name?: string; parentId?: number },
): Promise<DepartmentResponse> {
  const res = await fetch(`${backendApiUrl}/departments/${id}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`부서 수정 실패 (${res.status}): ${text}`);
  }
  return res.json();
}