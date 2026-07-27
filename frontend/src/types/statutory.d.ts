export interface StatutoryScheduleRequest {
    title: string;
    agency: string;
    category: string;
    target: string;
    deadline: string; // YYYY-MM-DD
    headCount: number;
    estimatedAmount: number;
    memo: string;
}

export interface StatutoryScheduleResponse {
    id: number;
    title: string;
    agency: string;
    category: string;
    target: string;
    deadline: string; // YYYY-MM-DD
    headCount: number;
    estimatedAmount: number;
    memo: string;
    status: string; // PENDING, COMPLETED
}

export interface StatutoryDashboardSummaryResponse {
    thisMonthTotal: number;
    thisMonthCompleted: number;
    urgentCount: number;
}

export interface MonthlyStat {
    month: number;
    totalCount: number;
    completedCount: number;
}

export interface StatutoryYearlyStatsResponse {
    year: number;
    monthlyStats: MonthlyStat[];
}
