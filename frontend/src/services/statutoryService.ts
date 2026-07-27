import type {
    StatutoryScheduleRequest,
    StatutoryScheduleResponse,
    StatutoryDashboardSummaryResponse,
    StatutoryYearlyStatsResponse
} from "@/types/statutory";

const backendApiUrl = "/api/v1/statutory";

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

export async function getDashboardSummary(year: number, month: number): Promise<StatutoryDashboardSummaryResponse> {
    const response = await fetch(`${backendApiUrl}/schedules/dashboard-summary?year=${year}&month=${month}`, {
        method: "GET",
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch dashboard summary");
    return response.json();
}

export async function getSchedulesByMonth(year: number, month: number): Promise<StatutoryScheduleResponse[]> {
    const response = await fetch(`${backendApiUrl}/schedules/calendar?year=${year}&month=${month}`, {
        method: "GET",
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch schedules");
    return response.json();
}

export async function getUrgentSchedules(limit: number = 5): Promise<StatutoryScheduleResponse[]> {
    const response = await fetch(`${backendApiUrl}/schedules/urgent?limit=${limit}`, {
        method: "GET",
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch urgent schedules");
    return response.json();
}

export async function getYearlyStats(year: number): Promise<StatutoryYearlyStatsResponse> {
    const response = await fetch(`${backendApiUrl}/schedules/yearly-stats?year=${year}`, {
        method: "GET",
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch yearly stats");
    return response.json();
}

export async function createSchedule(request: StatutoryScheduleRequest): Promise<StatutoryScheduleResponse> {
    const response = await fetch(`${backendApiUrl}/schedules`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error("Failed to create schedule");
    return response.json();
}

export async function updateScheduleStatus(id: number, status: string): Promise<StatutoryScheduleResponse> {
    const response = await fetch(`${backendApiUrl}/schedules/${id}/status`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error("Failed to update status");
    return response.json();
}
