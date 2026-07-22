import type { DashboardData } from "@/types/dashboard";

export const dashboardMockData: DashboardData = {
  profile: {
    name: "김관리자",
    initial: "김",
    department: "인사팀",
    role: "관리자",
  },

  summaryCards: [
    {
      label: "전체 직원",
      value: "2,184",
      unit: "명",
      status: "+2.1%",
      statusType: "up",
      icon: "people",
    },
    {
      label: "금일 출근",
      value: "1,942",
      unit: "명",
      status: "정상",
      statusType: "good",
      icon: "check",
    },
    {
      label: "휴가 중",
      value: "18",
      unit: "명",
      status: "보통",
      statusType: "normal",
      icon: "calendar",
    },
    {
      label: "결재 대기",
      value: "76",
      unit: "건",
      status: "48건",
      statusType: "warn",
      icon: "document",
    },
  ],

  approvalItems: [
    {
      id: 1,
      text: "연차 휴가 신청서 5건",
      color: "red",
      badge: "긴급",
    },
    {
      id: 2,
      text: "인사발령 요청서 3건",
      color: "yellow",
      badge: "대기",
    },
    {
      id: 3,
      text: "교육비 지원신청 2건",
      color: "blue",
      badge: "일반",
    },
    {
      id: 4,
      text: "복리후생 신청 1건",
      color: "green",
      badge: "일반",
    },
  ],

  attendanceList: [
    {
      id: 1,
      name: "박서준",
      dept: "영상의학과",
      time: "07:52",
      status: "정상",
      statusType: "good",
    },
    {
      id: 2,
      name: "최유진",
      dept: "진단검사과",
      time: "08:05",
      status: "근무중",
      statusType: "working",
    },
    {
      id: 3,
      name: "이도현",
      dept: "영양팀",
      time: "09:17",
      status: "지각",
      statusType: "late",
    },
    {
      id: 4,
      name: "강민서",
      dept: "원무팀",
      time: "-",
      status: "휴무",
      statusType: "off",
    },
  ],

  notices: [
    {
      id: 1,
      title: "2026년 하반기 정기 인사 이동 안내",
      date: "2026.07.10",
    },
    {
      id: 2,
      title: "여름 휴가철 대체 근무자 등록 요청",
      date: "2026.07.08",
    },
    {
      id: 3,
      title: "직원 건강검진 일정 사전 안내",
      date: "2026.07.05",
    },
  ],

  myApprovals: [
    {
      id: 1,
      title: "워크샵 구매 품의서",
      author: "이지수",
      date: "2026.07.11",
      status: "대기중",
      statusType: "wait",
    },
    {
      id: 2,
      title: "진단시약 인수증 발행",
      author: "박성호",
      date: "2026.07.10",
      status: "승인",
      statusType: "approve",
    },
    {
      id: 3,
      title: "회의수가 개정 내부 검토",
      author: "김하은",
      date: "2026.07.09",
      status: "대기중",
      statusType: "wait",
    },
    {
      id: 4,
      title: "신규 인원 근무표 개편",
      author: "최준혁",
      date: "2026.07.08",
      status: "반려",
      statusType: "reject",
    },
  ],

  approvalCounts: {
    waiting: 32,
    approved: 198,
    rejected: 17,
  },
};