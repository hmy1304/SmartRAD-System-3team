import type {
  RoleGroupResponse,
  RolePermissionResponse,
  RolePermissionUpdateRequest,
  RoleGroupCreateRequest,
  DepartmentResponse,
} from "@/types/system";

const backendApiUrl = "/api-system";

function getHeaders() {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  
  if (typeof window !== "undefined") {
    // In browser, try to get token from localStorage if we implemented it, 
    // or you could use cookies if preferred. Assuming localStorage 'accessToken' for now.
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

export async function getRoleGroups(): Promise<RoleGroupResponse[]> {
  const response = await fetch(`${backendApiUrl}/role-groups`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch role groups");
  }
  return response.json();
}

export async function createRoleGroup(
  request: RoleGroupCreateRequest
): Promise<RoleGroupResponse> {
  const response = await fetch(`${backendApiUrl}/role-groups`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to create role group");
  }
  return response.json();
}

export async function getRolePermissions(
  roleGroupId: number
): Promise<RolePermissionResponse[]> {
  const response = await fetch(`${backendApiUrl}/role-groups/${roleGroupId}/permissions`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch role permissions");
  }
  return response.json();
}

export async function updateRolePermission(
  roleGroupId: number,
  menuId: number,
  request: RolePermissionUpdateRequest
): Promise<RolePermissionResponse> {
  const response = await fetch(
    `${backendApiUrl}/role-groups/${roleGroupId}/permissions/${menuId}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update role permission");
  }
  return response.json();
}

export async function getDepartments(): Promise<DepartmentResponse[]> {
  const response = await fetch(`${backendApiUrl}/departments`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch departments");
  }
  return response.json();
}

export async function deleteRoleGroup(id: number): Promise<void> {
  const response = await fetch(`${backendApiUrl}/role-groups/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete role group");
  }
}
