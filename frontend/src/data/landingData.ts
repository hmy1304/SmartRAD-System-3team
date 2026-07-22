export type IconName = "organization" | "people" | "clock" | "welfare";

export interface FeatureItem {
  icon: IconName;
  title: string;
  description: string;
  tags: string[];
}

export interface WorkflowStep {
  number: string;
  title: string;
  description: string;
}

export interface PricingPlan {
  name: string;
  caption: string;
  price: string;
  suffix?: string;
  features: string[];
  button: string;
  featured?: boolean;
  label?: string;
}

export const navItems = [
  { label: "핵심 기능", href: "#features" },
  { label: "근무관리", href: "#workflow" },
  { label: "급여관리", href: "#payroll" },
  { label: "요금제", href: "#pricing" },
  { label: "도입문의", href: "#contact" },
];

export const featureItems: FeatureItem[] = [
  {
    icon: "organization",
    title: "조직 · 기준 정보",
    description:
      "병원 조직도, 직위·호봉, 직군과 재직 상태를 한 기준으로 관리합니다.",
    tags: ["부서", "직위", "직책"],
  },
  {
    icon: "people",
    title: "직원 인사기록",
    description:
      "인사 이력, 자격증, 교육, 경력과 발령 정보를 직원별로 통합합니다.",
    tags: ["인사카드", "면허", "경력"],
  },
  {
    icon: "clock",
    title: "근태 · 당직 관리",
    description:
      "출퇴근, 휴가, 듀티표, 초과근무를 병원 근무 형태에 맞춰 처리합니다.",
    tags: ["3교대", "당직", "휴가"],
  },
  {
    icon: "welfare",
    title: "증명서 · 경조비",
    description:
      "재직증명서 발급과 경조금 신청·승인 과정을 빠르게 전산화합니다.",
    tags: ["증명서", "결재", "경조비"],
  },
];

export const workflowSteps: WorkflowStep[] = [
  {
    number: "01",
    title: "근무표 자동 정리",
    description:
      "병동별 3교대·야간근무, 당직 인원을 한눈에 확인하고 누락을 줄입니다.",
  },
  {
    number: "02",
    title: "휴가 · 근태 승인",
    description:
      "신청부터 승인까지 대시보드에서 확인해 인사팀 처리 시간을 줄입니다.",
  },
  {
    number: "03",
    title: "부서 · 보직 발령",
    description:
      "전보, 겸직, 보직 변경 내역을 직원 인사기록에 자동을 연결합니다.",
  },
];

export const onboardingSteps = [
  {
    number: "1",
    title: "병원 조직 구조 입력",
    description:
      "부서·직군·직위 체계를 등록하고, 의료직·비의료직을 구분하고 고용 형태를 설정합니다.",
    badge: "평균 2시간",
  },
  {
    number: "2",
    title: "전 직원 데이터 등록",
    description:
      "의사·간호사·경비·청소 등 모든 직원 정보를 입력합니다. 기존 엑셀 데이터 일괄 가져오기가 가능합니다.",
    badge: "평균 1~2일",
  },
  {
    number: "3",
    title: "전 직군 자동화 완료",
    description:
      "스케줄·급여·자격증·서류 관리가 모두 자동화됩니다. 전담 컨설턴트가 온보딩을 끝까지 함께합니다.",
    badge: "즉시 실무 적용",
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    name: "Basic",
    caption: "소규모 병원 · 의원용",
    price: "₩150,000",
    suffix: "/ 월",
    features: ["직원 인사기록 관리", "기본 근태 관리", "증명서 발급"],
    button: "문의하기",
  },
  {
    name: "Hospital",
    caption: "종합병원 인사팀 추천",
    price: "₩290,000",
    suffix: "/ 월",
    features: [
      "조직·직급·보직 관리",
      "근태·당직·휴가 관리",
      "발령 이력 자동 저장",
      "급여 계산 미리보기",
    ],
    button: "시작하기",
    featured: true,
    label: "🏥 인기 플랜",
  },
  {
    name: "Enterprise",
    caption: "대형 병원 · 의료재단용",
    price: "별도 문의",
    features: ["다중 병원 관리", "API 연동 지원", "전용 관리자 설정"],
    button: "상담 요청",
  },
];
