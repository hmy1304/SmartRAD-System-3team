const backendApiUrl = "/api/v1/attendance";

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

export type AttendanceRecord = {
  id: number;
  employeeId: number;
  empNo: string;
  employeeName: string;
  departmentName: string;
  positionName: string;
  workDate: string | number[];
  checkInTime?: string | number[] | null;
  checkOutTime?: string | number[] | null;
  status: string;
  note?: string;
  isCorrected?: boolean;
  correctionReason?: string;
  correctedBy?: string;
};

// LocalTime은 배열([h,m,s]) 또는 "HH:mm:ss" 문자열로 내려올 수 있어 방어적으로 파싱
export function formatAttendanceTime(timeVal?: string | number[] | null): string | null {
  if (!timeVal) return null;
  if (Array.isArray(timeVal)) {
    const h = String(timeVal[0]).padStart(2, "0");
    const m = String(timeVal[1]).padStart(2, "0");
    return `${h}:${m}`;
  }
  return String(timeVal).slice(0, 5);
}

function todayDateStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function nowTimeStr(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export async function checkIn(employeeId: number, note?: string): Promise<AttendanceRecord> {
  const res = await fetch(`${backendApiUrl}/check-in`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      employeeId,
      workDate: todayDateStr(),
      checkInTime: nowTimeStr(),
      note,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `출근 체크 실패: ${res.status}`);
  }
  return res.json();
}

export async function checkOut(employeeId: number, note?: string): Promise<AttendanceRecord> {
  const res = await fetch(`${backendApiUrl}/check-out`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      employeeId,
      workDate: todayDateStr(),
      checkOutTime: nowTimeStr(),
      note,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `퇴근 체크 실패: ${res.status}`);
  }
  return res.json();
}

export async function getMyAttendanceToday(employeeId: number): Promise<AttendanceRecord | null> {
  const today = todayDateStr();
  const res = await fetch(
    `${backendApiUrl}/me?employeeId=${employeeId}&startDate=${today}&endDate=${today}`,
    { headers: getHeaders(), cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error(`오늘 근태 조회 실패: ${res.status}`);
  }
  const list: AttendanceRecord[] = await res.json();
  return list.length > 0 ? list[0] : null;
}
