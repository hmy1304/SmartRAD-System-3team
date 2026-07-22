import type { ApprovalInboxData } from "@/types/approval";

export const approvalMockData: ApprovalInboxData = {
  summary: {
    totalPending: 32,
    urgentPending: 6,
    dueToday: 3,
    processedThisMonth: 198,
    approvalRate: 80.2,
  },

  documents: [
    {
      id: "DOC-2026-0142",

      priority: "urgent",
      priorityLabel: "긴급",

      title: "연차 휴가 신청 (정은지 · 응급의학과)",
      attachment: "첨부 1개",

      drafter: "정은지",
      drafterInitial: "정",
      drafterDepartment: "응급의학과",
      drafterRole: "사원",
      avatarTone: "blue",

      requestedAt: "2026.07.09",
      dDay: "D-0",

      description:
        "2026년 7월 10일부터 7월 14일까지 연차 5일을 사용하고자 합니다. 개인 사유로 인한 신청이며, 업무 인수인계는 동료 이수현 사원에게 완료하였습니다.",

      fileName: "연차신청서_정은지.pdf",
      fileMeta: "PDF · 0.3 MB",
    },

    {
      id: "DOC-2026-0141",

      priority: "normal",
      priorityLabel: "일반",

      title: "인사발령 품의서 (간호본부 · 박서현)",
      attachment: "첨부 2개",

      drafter: "박서현",
      drafterInitial: "박",
      drafterDepartment: "간호본부",
      drafterRole: "대리",
      avatarTone: "green",

      requestedAt: "2026.07.08",
      dDay: "D-2",

      description:
        "간호본부 인력 운영 계획에 따라 병동 간 인사이동 승인을 요청합니다. 신규 배치와 교대 편성 내용을 함께 검토 부탁드립니다.",

      fileName: "인사발령_박서현.pdf",
      fileMeta: "PDF · 0.5 MB",
    },

    {
      id: "DOC-2026-0140",

      priority: "normal",
      priorityLabel: "일반",

      title: "교육비 지원 신청 (영상의학과 · 오지훈)",
      attachment: "첨부 없음",

      drafter: "오지훈",
      drafterInitial: "오",
      drafterDepartment: "영상의학과",
      drafterRole: "주임",
      avatarTone: "purple",

      requestedAt: "2026.07.07",
      dDay: "D-5",

      description:
        "직무 역량 강화를 위한 외부 전문교육 수강비 지원을 신청합니다.",

      fileName: "교육비지원_오지훈.pdf",
      fileMeta: "PDF · 0.2 MB",
    },

    {
      id: "DOC-2026-0139",

      priority: "urgent",
      priorityLabel: "긴급",

      title: "재직증명서 발급 요청 (원무팀 · 강민서)",
      attachment: "첨부 1개",

      drafter: "강민서",
      drafterInitial: "강",
      drafterDepartment: "원무팀",
      drafterRole: "사원",
      avatarTone: "yellow",

      requestedAt: "2026.07.06",
      dDay: "D-0",

      description: "금융기관 제출을 위한 재직증명서 긴급 발급을 요청합니다.",

      fileName: "재직증명서_강민서.pdf",
      fileMeta: "PDF · 0.2 MB",
    },

    {
      id: "DOC-2026-0138",

      priority: "normal",
      priorityLabel: "일반",

      title: "하계휴가 집중사용 신청서 (총무팀 · 최준혁)",
      attachment: "첨부 없음",

      drafter: "최준혁",
      drafterInitial: "최",
      drafterDepartment: "총무팀",
      drafterRole: "주임",
      avatarTone: "red",

      requestedAt: "2026.07.05",
      dDay: "D-7",

      description: "하계휴가 집중 사용 기간에 맞춰 휴가 승인을 요청합니다.",

      fileName: "하계휴가신청_최준혁.pdf",
      fileMeta: "PDF · 0.2 MB",
    },
  ],

  comments: [
    {
      id: 1,
      documentId: "DOC-2026-0142",

      initial: "김",
      name: "김관리",
      tag: "결재자",
      time: "2026.07.09 10:30",

      content:
        "첨부 서류를 확인했습니다. 업무 인수인계 완료 여부를 이수현 사원에게도 확인 부탁드립니다.",

      avatarTone: "blue",
    },

    {
      id: 2,
      documentId: "DOC-2026-0142",

      initial: "이",
      name: "이수현",
      tag: "참조",
      time: "2026.07.09 11:15",

      content: "인수인계 완료되었습니다. 업무 정리 문서를 공유하겠습니다.",

      avatarTone: "purple",
    },

    {
      id: 3,
      documentId: "DOC-2026-0141",

      initial: "김",
      name: "김관리",
      tag: "결재자",
      time: "2026.07.08 15:20",

      content: "발령 대상자의 근무 일정과 부서 이동일을 확인해주세요.",

      avatarTone: "blue",
    },
  ],
};
