export interface MenuResponse {
  id: number;
  menuCode: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoleGroupResponse {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermissionResponse {
  id: number;
  roleGroupId: number;
  menuId: number;
  menuCode: string;
  menuName: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canApprove: boolean;
}

export interface RolePermissionUpdateRequest {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canApprove: boolean;
}

export interface RoleGroupCreateRequest {
  name: string;
  description: string;
}

export interface DepartmentResponse {
  id: number;
  name: string;
  parentId?: number;
}
