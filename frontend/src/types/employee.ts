export interface EmployeeSummaryResponse {
  id: number;
  empNo: string;
  name: string;
  departmentName: string;
  positionName?: string;
  roleGroupName: string;
  accountStatus: string; // "ACTIVE" | "LOCKED"
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface EmployeeUpdateRequest {
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  birthDate?: string; // "YYYY-MM-DD"
  address?: string;
  internalPhone?: string;
  emergencyContact?: string;
  emergencyRelation?: string;
  departmentId?: number;
  positionCode?: string;
  jobCategoryCode?: string;
  employmentTypeCode?: string;
  hireRouteCode?: string;
  workTypeCode?: string;
  workWard?: string;
  payStep?: number;
  payrollTypeCode?: string;
  payrollDate?: number;
  bankAccount?: string;
  bankName?: string;
  taxTypeCode?: string;
  roleGroupId?: number;
  isShiftWorker?: boolean;
}

export interface AccountStatusUpdateRequest {
  accountStatus: "ACTIVE" | "LOCKED";
}

export interface EmployeeCreateRequest {
  empNo: string;
  name: string;
  email?: string;
  joinDate: string; // "YYYY-MM-DD"
  departmentId?: number;
  roleGroupId?: number;
}

export type EmployeeStatus = "active" | "leave" | "retire";
export type EmploymentType = "정규직" | "계약직" | "인턴" | "파트타임";

export interface EmployeeListItem {
  id: string;
  name: string;
  initial: string;
  department: string;
  position: string;
  employeeNo: string;
  status: EmployeeStatus;
  statusLabel: string;
  employmentType: EmploymentType;
  avatarTone: "blue" | "light_blue" | "green" | "purple" | "orange" | "red";
}

export interface EmployeeDetail {
  id: string;
  name: string;
  initial: string;
  department: string;
  position: string;
  employeeNo: string;
  status: EmployeeStatus;
  statusLabel: string;
  employmentType: EmploymentType;
  avatarTone: "blue" | "light_blue" | "green" | "purple" | "orange" | "red";

  // 인적사항
  birthDate: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;

  // 의료 전문 정보
  licenseType: string;
  licenseNo: string;
  specialty: string;
  acquiredDate: string;

  // 소속 및 직무
  departmentFull: string;
  jobTitle: string;
  rank: string;
  hireDate: string;
  employeeNoFull: string;
  workType: string;
  duty: string;

  // 직급·호봉
  currentRank: string;
  currentPayGrade: string;
  promotionDate: string;
  nextPromotion: string;

  // 증명·급여
  bankName: string;
  accountNo: string;
  salaryDay: string;

  // 직급·호봉 변동 이력
  rankHistory: {
    date: string;
    type: string;
    fromRank: string;
    toRank: string;
    fromGrade: string;
    toGrade: string;
    author: string;
  }[];
}

export interface EmployeeManagementData {
  totalCount: number;
  employees: EmployeeListItem[];
  selectedEmployee: EmployeeDetail | null;
}


export interface AppointmentResponse {
  id: number;
  employeeId: number;
  employeeName: string;
  appointmentTypeCode: string;
  appointmentTypeName: string;
  afterDepartmentId: number | null;
  afterDepartmentName: string | null;
  afterPositionCode: string | null;
  afterPositionName: string | null;
  afterPayStep: number | null;
  applyDate: string; // YYYY-MM-DD
  applied: boolean;
  note: string | null;
}

export interface AppointmentCreateRequest {
  employeeId: number;
  appointmentTypeCode: string;
  afterDepartmentId?: number;
  afterPositionCode?: string;
  afterPayStep?: number;
  applyDate: string; // YYYY-MM-DD
  note?: string;
}

export type LicenseStatus = "valid" | "renew" | "expired";
export type EducationStatus = "done" | "pending" | "missed";

export interface EmployeeLicenseItem {
  id: string;
  type: "의료면허" | "전문 자격증" | "안전 자격증" | "기타";
  name: string;
  number: string;
  issuer: string;
  specialty?: string;
  issueDate: string; // YYYY-MM-DD
  expireDate?: string; // 없으면 영구
  noExpire: boolean;
  needRenewAlarm: boolean;
  status: LicenseStatus;
}

export interface EmployeeEducationItem {
  id: string;
  category: "법정 의무교육" | "전문 기술교육" | "직무 역량교육" | "외부 교육" | "기타";
  name: string;
  startDate: string;
  endDate: string;
  hours: string;
  org: string;
  status: EducationStatus;
  score?: string;
  completion?: "수료" | "미수료" | "예정";
}

export type HealthResult = "normal" | "caution" | "abnormal" | "missed";

export interface HealthCheckItemResult {
  name: string;
  value: string;
  range: string;
  judgment: "정상" | "주의" | "이상";
}

export interface HealthCheckRecord {
  id: string;
  date: string;
  type: "일반 건강검진" | "특수 건강검진" | "채용 신체검사" | "기타";
  result: HealthResult;
  resultLabel: string;
  note: string;
  org: string;
  grade?: string;
  items: HealthCheckItemResult[];
  memo?: string;
}

export interface HealthSchedule {
  date: string;
  type: "일반 건강검진" | "특수 건강검진" | "기타";
  org: string;
  alarm: "30" | "14" | "7" | "none";
}