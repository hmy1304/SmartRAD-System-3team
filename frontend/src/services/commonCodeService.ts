export interface CommonCode {
  code: string;
  groupCode: string;
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CommonCodeCreateRequest {
  code: string;
  groupCode: string;
  name: string;
  description?: string;
  sortOrder?: number;
}

export interface CommonCodeUpdateRequest {
  name: string;
  description?: string;
  sortOrder?: number;
  isActive: boolean;
}

import { customFetch } from "@/lib/api/customFetch";

const API_BASE = "/common-codes"; // Next.js API proxy를 통해 호출

export async function fetchGroupCodes(): Promise<string[]> {
  const res = await customFetch(`${API_BASE}/groups`);
  if (!res.ok) throw new Error("Failed to fetch group codes");
  return res.json();
}

export async function fetchCommonCodes(groupCode?: string): Promise<CommonCode[]> {
  const url = groupCode ? `${API_BASE}?groupCode=${groupCode}&includeInactive=true` : `${API_BASE}?includeInactive=true`;
  const res = await customFetch(url);
  if (!res.ok) throw new Error("Failed to fetch common codes");
  return res.json();
}

export async function createCommonCode(data: CommonCodeCreateRequest): Promise<CommonCode> {
  const res = await customFetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to create code: ${errorBody}`);
  }
  return res.json();
}

export async function updateCommonCode(code: string, data: CommonCodeUpdateRequest): Promise<CommonCode> {
  const res = await customFetch(`${API_BASE}/${code}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update code");
  return res.json();
}
