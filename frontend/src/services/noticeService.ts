export interface NoticeResponse {
  id: number;
  title: string;
  content: string;
  noticeTypeCode: string;
  noticeTypeName: string;
  isImportant: boolean;
  authorId: number;
  authorName: string;
  viewCount: number;
  expirationDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeSummary {
  id: number;
  title: string;
  noticeTypeCode?: string;
  noticeTypeName?: string;
  isImportant?: boolean;
  createdAt?: string;
  authorName?: string;
}

export interface NoticeCreateRequest {
  authorId: number;
  title: string;
  content: string;
  noticeTypeCode: string;
  isImportant?: boolean;
  expirationDate?: string | null; // YYYY-MM-DD
}

export interface NoticeUpdateRequest {
  title?: string;
  content?: string;
  noticeTypeCode?: string;
  isImportant?: boolean;
  expirationDate?: string | null;
}

const base = "/api-system";

function headers(): HeadersInit {
  const h: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) h["Authorization"] = `Bearer ${token}`;
  }
  return h;
}

/** UI 라벨 → common_code */
export const NOTICE_TYPE_CODE_MAP: Record<string, string> = {
  일반공지: "NOTICE_GENERAL",
  긴급공지: "NOTICE_URGENT",
  "행사 안내": "NOTICE_GENERAL",
  "교육 안내": "NOTICE_GENERAL",
  보안공지: "NOTICE_URGENT",
};

export async function getNotices(size = 20): Promise<{
  content: NoticeSummary[];
  totalElements: number;
}> {
  const res = await fetch(`${base}/notices?size=${size}`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`공지 목록 실패: ${res.status}`);
  return res.json();
}

export async function getNotice(id: number | string): Promise<NoticeResponse> {
  const res = await fetch(`${base}/notices/${id}`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`공지 상세 실패: ${res.status}`);
  return res.json();
}

export async function createNotice(
  body: NoticeCreateRequest,
): Promise<NoticeResponse> {
  const res = await fetch(`${base}/notices`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`공지 등록 실패 (${res.status}): ${t}`);
  }
  return res.json();
}

export async function updateNotice(
  id: number | string,
  body: NoticeUpdateRequest,
): Promise<NoticeResponse> {
  const res = await fetch(`${base}/notices/${id}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`공지 수정 실패 (${res.status}): ${t}`);
  }
  return res.json();
}

export async function deleteNotice(id: number | string): Promise<void> {
  const res = await fetch(`${base}/notices/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) throw new Error(`공지 삭제 실패: ${res.status}`);
}

export function getAuthorIdFromStorage(): number | null {
  try {
    const raw = localStorage.getItem("userProfile");
    if (!raw) return null;
    const p = JSON.parse(raw) as { employeeId?: number; id?: number };
    return p.employeeId ?? p.id ?? null;
  } catch {
    return null;
  }
}