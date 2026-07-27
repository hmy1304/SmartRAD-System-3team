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
  roleGroupId?: number;
  // Other fields can be added here if needed for partial update
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
