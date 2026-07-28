"use client";

import {
  useMemo,
  useState,
  useEffect,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  createEmployeeDetailed,
  getAppointmentHistory,
  createAppointment,
} from "@/services/employeeService";
import type {
  EmployeeManagementData,
  AppointmentResponse,
  EmployeeLicenseItem,
  EmployeeEducationItem,
  HealthCheckRecord,
  HealthSchedule,
} from "@/types/employee";
import styles from "./EmployeeManagementPage.module.scss";
import AddressSearchModal from "./AddressSearchModal";
import BankAccountVerifyModal from "./BankAccountVerifyModal";
import EmploymentHistoryModal, {
  type EmploymentHistoryForm,
} from "./EmploymentHistoryModal";
import LicenseModal from "./LicenseModal";
import EducationModal from "./EducationModal";
import HealthCheckModal from "./HealthCheckModal";
import HealthScheduleModal from "./HealthScheduleModal";

interface Props {
  initialData: EmployeeManagementData;
}

const FILTERS = ["전체", "정규직", "계약직", "인턴"] as const;

const initialForm = {
  empNo: "",
  name: "",
  birthDate: "",
  gender: "",
  phone: "",
  internalPhone: "",
  email: "",
  zipCode: "",
  address: "",
  emergencyContact: "",
  emergencyRelation: "",
  departmentId: "",
  positionCode: "",
  jobCategoryCode: "",
  employmentTypeCode: "",
  joinDate: "",
  hireRouteCode: "",
  workTypeCode: "",
  workWard: "",
  payStep: "",
  payrollTypeCode: "",
  payrollDate: "",
  bankName: "",
  bankAccount: "",
  taxTypeCode: "",
};

const TYPE_CODE_MAP: Record<string, string> = {
  재직: "APPOINT_JOIN",
  승진: "APPOINT_PROMOTE",
  "부서 이동": "APPOINT_TRANSFER",
  인사발령: "APPOINT_HR",
  "표창/수상": "APPOINT_AWARD",
};

const DEPT_ID_MAP: Record<string, number> = {
  영상의학과: 3,
  간호부: 4,
  중환자실: 2,
  원무과: 5,
  원장실: 1,
};

export default function EmployeeManagementPage({ initialData }: Props) {
  const router = useRouter();

  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("전체");
  const [selectedId, setSelectedId] = useState(
    initialData.selectedEmployee?.id ?? null,
  );
  const [activeTab, setActiveTab] = useState<
    "basic" | "history" | "license" | "health"
  >("basic");

  const [mode, setMode] = useState<"list" | "create">("list");
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [bankVerifyOpen, setBankVerifyOpen] = useState(false);
  const [bankVerified, setBankVerified] = useState(false);

  // 재직·휴직
  const [histories, setHistories] = useState<AppointmentResponse[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  const [leaveType, setLeaveType] = useState<"병가" | "육아휴직" | "개인사유" | "">("");
  const [leaveStart, setLeaveStart] = useState("");
  const [leaveEnd, setLeaveEnd] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);

  const [retireDate, setRetireDate] = useState("");
  const [retireReason, setRetireReason] = useState("");
  const [retireDetail, setRetireDetail] = useState("");
  const [retireSubmitting, setRetireSubmitting] = useState(false);

  const filteredEmployees = useMemo(() => {
    return initialData.employees.filter((emp) => {
      const matchFilter = filter === "전체" || emp.employmentType === filter;
      const matchKeyword =
        !keyword ||
        emp.name.includes(keyword) ||
        emp.department.includes(keyword) ||
        emp.employeeNo.toLowerCase().includes(keyword.toLowerCase());
      return matchFilter && matchKeyword;
    });
  }, [initialData.employees, filter, keyword]);

  const selected = initialData.selectedEmployee;

  const onFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openCreate = () => {
    setForm(initialForm);
    setFormError("");
    setBankVerified(false);
    setMode("create");
  };

  const onCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (
      !form.empNo.trim() ||
      !form.name.trim() ||
      !form.joinDate ||
      !form.departmentId
    ) {
      setFormError("사번, 성명, 입사일, 부서는 필수입니다.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      await createEmployeeDetailed({
        empNo: form.empNo.trim(),
        name: form.name.trim(),
        email: form.email || undefined,
        phone: form.phone || undefined,
        joinDate: form.joinDate,
        gender: form.gender || undefined,
        birthDate: form.birthDate || undefined,
        address: form.address || undefined,
        internalPhone: form.internalPhone || undefined,
        emergencyContact: form.emergencyContact || undefined,
        emergencyRelation: form.emergencyRelation || undefined,
        departmentId: Number(form.departmentId),
        positionCode: form.positionCode || undefined,
        jobCategoryCode: form.jobCategoryCode || undefined,
        employmentTypeCode: form.employmentTypeCode || undefined,
        hireRouteCode: form.hireRouteCode || undefined,
        workTypeCode: form.workTypeCode || undefined,
        workWard: form.workWard || undefined,
        payStep: form.payStep ? Number(form.payStep) : undefined,
        payrollTypeCode: form.payrollTypeCode || undefined,
        payrollDate: form.payrollDate ? Number(form.payrollDate) : undefined,
        bankAccount: form.bankAccount || undefined,
        taxTypeCode: form.taxTypeCode || undefined,
      });

      alert("직원이 등록되었습니다.");
      setMode("list");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  // 발령 이력 조회
  useEffect(() => {
    if (!selectedId || activeTab !== "history") return;

    const empId = Number(selectedId);
    if (Number.isNaN(empId)) {
      setHistories([]);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setHistoryLoading(true);
        setHistoryError("");
        const list = await getAppointmentHistory(empId);
        if (!cancelled) setHistories(list);
      } catch (err) {
        if (!cancelled) {
          setHistoryError(
            err instanceof Error ? err.message : "이력 조회 실패",
          );
          setHistories([]);
        }
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedId, activeTab]);

  const onSaveHistory = async (data: EmploymentHistoryForm) => {
    const empId = Number(selectedId);
    if (Number.isNaN(empId)) {
      throw new Error("유효한 직원 ID가 아닙니다. (mock 데이터일 수 있습니다)");
    }

    await createAppointment({
      employeeId: empId,
      appointmentTypeCode: TYPE_CODE_MAP[data.type] ?? "APPOINT_HR",
      afterDepartmentId: DEPT_ID_MAP[data.department],
      afterPositionCode: data.position || undefined,
      applyDate: data.startDate,
      note: [
        data.endDate ? `종료: ${data.endDate}` : "종료: 현재",
        data.employmentType ? `고용형태: ${data.employmentType}` : "",
        data.handler ? `처리자: ${data.handler}` : "",
      ]
        .filter(Boolean)
        .join(" | "),
    });

    const list = await getAppointmentHistory(empId);
    setHistories(list);
    setHistoryModalOpen(false);
    alert("이력이 저장되었습니다.");
  };

  const onLeaveSubmit = async () => {
    const empId = Number(selectedId);
    if (Number.isNaN(empId)) {
      alert("유효한 직원 ID가 아닙니다.");
      return;
    }
    if (!leaveType) {
      alert("휴직 유형을 선택하세요.");
      return;
    }
    if (!leaveStart) {
      alert("휴직 시작일을 입력하세요.");
      return;
    }

    setLeaveSubmitting(true);
    try {
      await createAppointment({
        employeeId: empId,
        appointmentTypeCode: "APPOINT_LEAVE",
        applyDate: leaveStart,
        note: [
          `휴직유형: ${leaveType}`,
          leaveEnd ? `종료예정: ${leaveEnd}` : "",
          leaveReason ? `사유: ${leaveReason}` : "",
        ]
          .filter(Boolean)
          .join(" | "),
      });

      const list = await getAppointmentHistory(empId);
      setHistories(list);
      setLeaveType("");
      setLeaveStart("");
      setLeaveEnd("");
      setLeaveReason("");
      alert("휴직 신청이 등록되었습니다.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "휴직 신청 실패");
    } finally {
      setLeaveSubmitting(false);
    }
  };

  const onRetireSubmit = async () => {
    const empId = Number(selectedId);
    if (Number.isNaN(empId)) {
      alert("유효한 직원 ID가 아닙니다.");
      return;
    }
    if (!retireDate) {
      alert("퇴직 예정일을 선택하세요.");
      return;
    }
    if (!retireReason) {
      alert("퇴직 사유를 선택하세요.");
      return;
    }
    if (retireReason === "other" && !retireDetail.trim()) {
      alert("기타 사유를 입력하세요.");
      return;
    }

    setRetireSubmitting(true);
    try {
      await createAppointment({
        employeeId: empId,
        appointmentTypeCode: "APPOINT_RETIRE",
        applyDate: retireDate,
        note: [
          `퇴직사유: ${retireReason}`,
          retireReason === "other" ? `상세: ${retireDetail}` : "",
        ]
          .filter(Boolean)
          .join(" | "),
      });

      const list = await getAppointmentHistory(empId);
      setHistories(list);
      setRetireDate("");
      setRetireReason("");
      setRetireDetail("");
      alert("퇴직 처리가 등록되었습니다.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "퇴직 처리 실패");
    } finally {
      setRetireSubmitting(false);
    }
  };

    const [licenses, setLicenses] = useState<EmployeeLicenseItem[]>([
    {
      id: "1",
      type: "의료면허",
      name: "방사선사 면허",
      number: "RAD-26-09821",
      issuer: "보건복지부",
      issueDate: "2019-01-15",
      noExpire: true,
      needRenewAlarm: false,
      status: "valid",
    },
    {
      id: "2",
      type: "전문 자격증",
      name: "전문방사선사",
      number: "SRAD-2021-0447",
      issuer: "대한방사선사협회",
      issueDate: "2021-06-10",
      noExpire: true,
      needRenewAlarm: false,
      status: "valid",
    },
    {
      id: "3",
      type: "안전 자격증",
      name: "의료기기 안전관리 자격증",
      number: "MED-2020-1193",
      issuer: "",
      issueDate: "2020-03-22",
      expireDate: "2025-03-21",
      noExpire: false,
      needRenewAlarm: true,
      status: "renew",
    },
  ]);

  const [educations, setEducations] = useState<EmployeeEducationItem[]>([
    {
      id: "1",
      category: "법정 의무교육",
      name: "방사선 피폭 안전관리 교육",
      startDate: "2025-03-14",
      endDate: "2025-03-15",
      hours: "8",
      org: "한국방사선진흥협회",
      status: "done",
      score: "96",
      completion: "수료",
    },
    {
      id: "2",
      category: "법정 의무교육",
      name: "의료기기 품질 관리 법정교육",
      startDate: "2024-11-05",
      endDate: "2024-11-06",
      hours: "16",
      org: "의료기기안전관리원",
      status: "done",
      score: "88",
      completion: "수료",
    },
    {
      id: "3",
      category: "전문 기술교육",
      name: "인체조직 방사선 특수검사 심화과정",
      startDate: "2025-08-20",
      endDate: "2025-08-22",
      hours: "24",
      org: "국립암센터 교육원",
      status: "pending",
      completion: "예정",
    },
    {
      id: "4",
      category: "전문 기술교육",
      name: "AI 의료영상 분석 기초 과정",
      startDate: "2024-07-10",
      endDate: "2024-07-12",
      hours: "20",
      org: "서울대 의과대학 연구소",
      status: "done",
      score: "100",
      completion: "수료",
    },
  ]);

  const [eduFilter, setEduFilter] = useState<"전체" | "이수완료" | "대기중">("전체");
  const [licenseModal, setLicenseModal] = useState<{
    open: boolean;
    mode: "create" | "edit";
    item?: EmployeeLicenseItem | null;
  }>({ open: false, mode: "create" });
  const [eduModal, setEduModal] = useState<{
    open: boolean;
    mode: "create" | "edit";
    item?: EmployeeEducationItem | null;
  }>({ open: false, mode: "create" });


    const [healthRecords, setHealthRecords] = useState<HealthCheckRecord[]>([
    {
      id: "1",
      date: "2024-11-15",
      type: "일반 건강검진",
      result: "normal",
      resultLabel: "정상",
      note: "이상 소견 없음",
      org: "원내 의원",
      grade: "정상 (A등급)",
      items: [
        { name: "신장 / 체중", value: "176cm / 74kg", range: "-", judgment: "정상" },
        { name: "혈압", value: "118 / 76 mmHg", range: "120/80 미만", judgment: "정상" },
        { name: "혈당 (공복)", value: "95 mg/dL", range: "100 미만", judgment: "정상" },
        { name: "총 콜레스테롤", value: "188 mg/dL", range: "200 미만", judgment: "정상" },
        { name: "방사선 피폭량", value: "2.1 mSv/년", range: "20 mSv 이하", judgment: "정상" },
      ],
    },
    {
      id: "2",
      date: "2023-11-08",
      type: "일반 건강검진",
      result: "caution",
      resultLabel: "주의",
      note: "콜레스테롤 수치 경계",
      org: "원내 의원",
      items: [],
    },
    {
      id: "3",
      date: "2022-11-21",
      type: "일반 건강검진",
      result: "normal",
      resultLabel: "정상",
      note: "이상 소견 없음",
      org: "원내 의원",
      items: [],
    },
    {
      id: "4",
      date: "2021-10-19",
      type: "특수 건강검진",
      result: "normal",
      resultLabel: "정상",
      note: "방사선 피폭 이상 없음",
      org: "원내 의원",
      items: [],
    },
    {
      id: "5",
      date: "2020-11-03",
      type: "일반 건강검진",
      result: "normal",
      resultLabel: "정상",
      note: "이상 소견 없음",
      org: "원내 의원",
      items: [],
    },
  ]);

  const [selectedHealthId, setSelectedHealthId] = useState("1");
  const [nextSchedule, setNextSchedule] = useState<HealthSchedule | null>({
    date: "2025-11-15",
    type: "일반 건강검진",
    org: "원내 의원",
    alarm: "30",
  });
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [scheduleModal, setScheduleModal] = useState<{
    open: boolean;
    mode: "create" | "edit";
  }>({ open: false, mode: "create" });

  const selectedHealth =
    healthRecords.find((h) => h.id === selectedHealthId) ?? healthRecords[0];

  return (
    <>
      <main className={styles.main}>
        {mode === "create" ? (
          <form className={styles.createForm} onSubmit={onCreateSubmit}>
            <div className={styles.createHeader}>
              <div>
                <h1>직원 추가</h1>
                <p>새 직원 정보를 입력하고 등록합니다.</p>
              </div>
            </div>

            <div className={styles.createBody}>
              {/* 인적사항 */}
              <section className={styles.createCard}>
                <div className={styles.createCardTitle}>
                  <span className={styles.createBadgeBlue}>👤</span>
                  <h2>인적사항</h2>
                  <em>필수 항목 포함</em>
                </div>

                <div className={styles.createGrid3}>
                  <label className={styles.createField}>
                    <span>
                      성명 <b>필수</b>
                    </span>
                    <input
                      name="name"
                      value={form.name}
                      onChange={onFormChange}
                      placeholder="성명을 입력하세요"
                    />
                  </label>
                  <label className={styles.createField}>
                    <span>생년월일</span>
                    <input
                      type="date"
                      name="birthDate"
                      value={form.birthDate}
                      onChange={onFormChange}
                    />
                  </label>
                  <div className={styles.createField}>
                    <span>성별</span>
                    <div className={styles.segment}>
                      <button
                        type="button"
                        className={form.gender === "M" ? styles.segActive : ""}
                        onClick={() => setForm((p) => ({ ...p, gender: "M" }))}
                      >
                        남성
                      </button>
                      <button
                        type="button"
                        className={form.gender === "F" ? styles.segActive : ""}
                        onClick={() => setForm((p) => ({ ...p, gender: "F" }))}
                      >
                        여성
                      </button>
                    </div>
                  </div>
                </div>

                <div className={styles.createGrid3}>
                  <label className={styles.createField}>
                    <span>휴대폰</span>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={onFormChange}
                      placeholder="010-0000-0000"
                    />
                  </label>
                  <label className={styles.createField}>
                    <span>내선 번호</span>
                    <input
                      name="internalPhone"
                      value={form.internalPhone}
                      onChange={onFormChange}
                      placeholder="02-0000-0000"
                    />
                  </label>
                  <label className={styles.createField}>
                    <span>이메일</span>
                    <input
                      name="email"
                      value={form.email}
                      onChange={onFormChange}
                      placeholder="example@hospital.kr"
                    />
                  </label>
                </div>

                <label className={styles.createField}>
                  <span>주소</span>
                  <div className={styles.addressRow}>
                    <input
                      name="zipCode"
                      value={form.zipCode}
                      onChange={onFormChange}
                      placeholder="우편번호"
                      readOnly
                    />
                    <button
                      type="button"
                      className={styles.addressSearchBtn}
                      onClick={() => setAddressOpen(true)}
                    >
                      검색
                    </button>
                  </div>
                  <input
                    name="address"
                    value={form.address}
                    onChange={onFormChange}
                    placeholder="상세 주소를 입력하세요 (동, 호수 등)"
                  />
                </label>

                <div className={styles.createGrid2}>
                  <label className={styles.createField}>
                    <span>긴급 연락처</span>
                    <input
                      name="emergencyContact"
                      value={form.emergencyContact}
                      onChange={onFormChange}
                      placeholder="010-0000-0000"
                    />
                  </label>
                  <label className={styles.createField}>
                    <span>관계</span>
                    <input
                      name="emergencyRelation"
                      value={form.emergencyRelation}
                      onChange={onFormChange}
                      placeholder="예) 배우자, 부모"
                    />
                  </label>
                </div>
              </section>

              {/* 소속 및 직무 */}
              <section className={styles.createCard}>
                <div className={styles.createCardTitle}>
                  <span className={styles.createBadgeGreen}>🏢</span>
                  <h2>소속 및 직무</h2>
                </div>

                <div className={styles.createGrid3}>
                  <label className={styles.createField}>
                    <span>
                      부서 <b>필수</b>
                    </span>
                    <select
                      name="departmentId"
                      value={form.departmentId}
                      onChange={onFormChange}
                    >
                      <option value="">부서 선택</option>
                      <option value="1">원장실</option>
                      <option value="2">중환자실</option>
                      <option value="3">영상의학과</option>
                      <option value="4">간호부</option>
                    </select>
                  </label>
                  <label className={styles.createField}>
                    <span>직위</span>
                    <select
                      name="positionCode"
                      value={form.positionCode}
                      onChange={onFormChange}
                    >
                      <option value="">직위 선택</option>
                      <option value="POS_01">수석</option>
                      <option value="POS_02">수간호사</option>
                      <option value="POS_03">과장</option>
                      <option value="POS_04">대리</option>
                    </select>
                  </label>
                  <label className={styles.createField}>
                    <span>직군</span>
                    <select
                      name="jobCategoryCode"
                      value={form.jobCategoryCode}
                      onChange={onFormChange}
                    >
                      <option value="">직군 선택</option>
                      <option value="JOB_01">전문의</option>
                      <option value="JOB_02">간호사</option>
                      <option value="JOB_03">행정직</option>
                    </select>
                  </label>
                </div>

                <div className={styles.createGrid3}>
                  <label className={styles.createField}>
                    <span>고용 형태</span>
                    <select
                      name="employmentTypeCode"
                      value={form.employmentTypeCode}
                      onChange={onFormChange}
                    >
                      <option value="">선택</option>
                      <option value="EMP_FULL">정규직</option>
                      <option value="EMP_CONTRACT">계약직</option>
                      <option value="EMP_INTERN">인턴</option>
                    </select>
                  </label>
                  <label className={styles.createField}>
                    <span>
                      입사일 <b>필수</b>
                    </span>
                    <input
                      type="date"
                      name="joinDate"
                      value={form.joinDate}
                      onChange={onFormChange}
                    />
                  </label>
                  <label className={styles.createField}>
                    <span>
                      사번 <b>필수</b>
                    </span>
                    <input
                      name="empNo"
                      value={form.empNo}
                      onChange={onFormChange}
                      placeholder="예) RN-2002"
                    />
                  </label>
                </div>

                <div className={styles.createGrid3}>
                  <label className={styles.createField}>
                    <span>입사 경로</span>
                    <select
                      name="hireRouteCode"
                      value={form.hireRouteCode}
                      onChange={onFormChange}
                    >
                      <option value="">선택</option>
                      <option value="HIRE_OPEN">공개채용</option>
                      <option value="HIRE_REF">추천</option>
                    </select>
                  </label>
                  <label className={styles.createField}>
                    <span>근무 형태</span>
                    <select
                      name="workTypeCode"
                      value={form.workTypeCode}
                      onChange={onFormChange}
                    >
                      <option value="">선택</option>
                      <option value="WORK_DAY">상근</option>
                      <option value="WORK_SHIFT">교대</option>
                    </select>
                  </label>
                  <label className={styles.createField}>
                    <span>근무 병동</span>
                    <input
                      name="workWard"
                      value={form.workWard}
                      onChange={onFormChange}
                      placeholder="근무 장소"
                    />
                  </label>
                </div>
              </section>

              {/* 행정 / 급여 */}
              <section className={styles.createCard}>
                <div className={styles.createCardTitle}>
                  <span className={styles.createBadgePurple}>💳</span>
                  <h2>행정 / 급여</h2>
                </div>

                <div className={styles.createGrid3}>
                  <label className={styles.createField}>
                    <span>호봉</span>
                    <input
                      name="payStep"
                      value={form.payStep}
                      onChange={onFormChange}
                      placeholder="숫자"
                    />
                  </label>
                  <label className={styles.createField}>
                    <span>급여 유형</span>
                    <select
                      name="payrollTypeCode"
                      value={form.payrollTypeCode}
                      onChange={onFormChange}
                    >
                      <option value="">선택</option>
                      <option value="PAY_ANNUAL">연봉</option>
                      <option value="PAY_STEP">호봉제</option>
                    </select>
                  </label>
                  <label className={styles.createField}>
                    <span>지급일</span>
                    <select
                      name="payrollDate"
                      value={form.payrollDate}
                      onChange={onFormChange}
                    >
                      <option value="">선택</option>
                      <option value="25">25일</option>
                      <option value="28">28일</option>
                    </select>
                  </label>
                </div>

                <label className={styles.createField}>
                  <span>계좌 정보</span>
                  <div className={styles.accountRow}>
                    <select
                      name="bankName"
                      value={form.bankName}
                      onChange={(e) => {
                        setBankVerified(false);
                        onFormChange(e);
                      }}
                    >
                      <option value="">은행 선택</option>
                      <option value="국민은행">국민은행</option>
                      <option value="신한은행">신한은행</option>
                      <option value="우리은행">우리은행</option>
                      <option value="하나은행">하나은행</option>
                    </select>
                    <input
                      name="bankAccount"
                      value={form.bankAccount}
                      onChange={(e) => {
                        setBankVerified(false);
                        onFormChange(e);
                      }}
                      placeholder="계좌번호를 입력하세요"
                    />
                    <button
                      type="button"
                      className={styles.verifyBtn}
                      onClick={() => {
                        if (!form.bankName || !form.bankAccount.trim()) {
                          setFormError("은행과 계좌번호를 먼저 입력하세요.");
                          return;
                        }
                        setFormError("");
                        setBankVerifyOpen(true);
                      }}
                    >
                      {bankVerified ? "✓ 인증완료" : "인증"}
                    </button>
                  </div>
                </label>

                <label className={styles.createField}>
                  <span>세금 유형</span>
                  <select
                    name="taxTypeCode"
                    value={form.taxTypeCode}
                    onChange={onFormChange}
                  >
                    <option value="">선택</option>
                    <option value="TAX_EARNED">근로소득</option>
                  </select>
                </label>
              </section>
            </div>

            <div className={styles.createFooter}>
              {formError && <p className={styles.formError}>{formError}</p>}
              <p className={styles.createNote}>
                * 사번, 성명, 입사일, 부서는 필수입니다.
              </p>
              <div className={styles.createActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setMode("list")}
                >
                  × 취소
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={submitting}
                >
                  {submitting ? "등록 중..." : "직원 등록 완료"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className={styles.contentLayout}>
            <section className={styles.listBox}>
              <div className={styles.listHeader}>
                <div>
                  <h1 className={styles.listTitle}>직원 목록</h1>
                  <p className={styles.listCount}>
                    총 {initialData.totalCount.toLocaleString()}명
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.addBtn}
                  onClick={openCreate}
                >
                  + 직원 추가
                </button>
              </div>

              <div className={styles.listSearch}>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="직원 검색"
                />
              </div>

              <div className={styles.filterTabs}>
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={filter === f ? styles.filterActive : ""}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className={styles.empList}>
                {filteredEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    className={`${styles.empCard} ${
                      selectedId === emp.id ? styles.empCardActive : ""
                    }`}
                    onClick={() => setSelectedId(emp.id)}
                  >
                    <span
                      className={`${styles.avatar} ${styles[emp.avatarTone]}`}
                    >
                      {emp.initial}
                    </span>
                    <div className={styles.empInfo}>
                      <div className={styles.empNameRow}>
                        <strong>{emp.name}</strong>
                        <span
                          className={`${styles.statusBadge} ${styles[emp.status]}`}
                        >
                          {emp.statusLabel}
                        </span>
                      </div>
                      <p>
                        {emp.department} · {emp.position}
                      </p>
                      <small>{emp.employeeNo}</small>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {selected && (
              <section className={styles.detailPanel}>
                <div className={styles.profileHeader}>
                  <div className={styles.profileLeft}>
                    <span
                      className={`${styles.profileAvatar} ${styles[selected.avatarTone]}`}
                    >
                      {selected.initial}
                    </span>
                    <div className={styles.profileMeta}>
                      <div className={styles.profileNameRow}>
                        <h2>{selected.name}</h2>
                        <span
                          className={`${styles.statusBadge} ${styles[selected.status]}`}
                        >
                          {selected.statusLabel}
                        </span>
                      </div>
                      <p className={styles.profileDept}>
                        {selected.department} · {selected.position}
                      </p>
                      <p className={styles.profileSub}>
                        <span>{selected.employeeNo}</span>
                        <span className={styles.dot}>·</span>
                        <span>입사일 {selected.hireDate}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={styles.editBtn}
                    onClick={() => {
                      if (!selectedId) return;
                      router.push(`/dashboard/employees/${selectedId}/edit`);
                    }}
                  >
                    정보 수정
                  </button>
                </div>

                <div className={styles.tabs}>
                  {[
                    { key: "basic", label: "기본정보" },
                    { key: "history", label: "재직·휴직" },
                    { key: "license", label: "자격증·교육" },
                    { key: "health", label: "건강검진" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      className={
                        activeTab === tab.key ? styles.tabActive : ""
                      }
                      onClick={() =>
                        setActiveTab(tab.key as typeof activeTab)
                      }
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeTab === "basic" && (
                  <div className={styles.detailBody}>
                    <div className={styles.cardGrid}>
                      <article className={styles.card}>
                        <div className={styles.cardTitle}>
                          <span
                            className={`${styles.cardIcon} ${styles.iconBlue}`}
                          >
                            👤
                          </span>
                          <h3>인적사항</h3>
                        </div>
                        <div className={styles.infoGrid}>
                          <div>
                            <label>성명</label>
                            <p>{selected.name}</p>
                          </div>
                          <div>
                            <label>생년월일</label>
                            <p>{selected.birthDate}</p>
                          </div>
                          <div>
                            <label>성별</label>
                            <p>{selected.gender}</p>
                          </div>
                          <div>
                            <label>연락처</label>
                            <p>{selected.phone}</p>
                          </div>
                          <div>
                            <label>이메일</label>
                            <p>{selected.email}</p>
                          </div>
                          <div className={styles.full}>
                            <label>주소</label>
                            <p>{selected.address}</p>
                          </div>
                          <div className={styles.full}>
                            <label>긴급 연락처</label>
                            <p>{selected.emergencyContact}</p>
                          </div>
                        </div>
                      </article>

                      <article className={styles.card}>
                        <div className={styles.cardTitle}>
                          <span
                            className={`${styles.cardIcon} ${styles.iconGreen}`}
                          >
                            🏢
                          </span>
                          <h3>소속 및 직무</h3>
                        </div>
                        <div className={styles.infoGrid}>
                          <div>
                            <label>부서</label>
                            <p>{selected.departmentFull}</p>
                          </div>
                          <div>
                            <label>직위</label>
                            <p>{selected.jobTitle}</p>
                          </div>
                          <div>
                            <label>입사일</label>
                            <p>{selected.hireDate}</p>
                          </div>
                          <div>
                            <label>사번</label>
                            <p>{selected.employeeNoFull}</p>
                          </div>
                        </div>
                      </article>
                    </div>
                  </div>
                )}

                {activeTab === "history" && (
                  <div className={styles.detailBody}>
                    <div className={styles.summaryRow}>
                      <div className={styles.summaryCard}>
                        <div className={styles.summaryIconGreen}>●</div>
                        <div>
                          <label>현재 재직 상태</label>
                          <p className={styles.statusText}>
                            {selected.statusLabel || "재직"}
                          </p>
                        </div>
                      </div>
                      <div className={styles.summaryCard}>
                        <div className={styles.summaryIconBlue}>📅</div>
                        <div>
                          <label>입사일</label>
                          <p>{selected.hireDate || "-"}</p>
                        </div>
                      </div>
                      <div className={styles.summaryCard}>
                        <div className={styles.summaryIconOrange}>⏱</div>
                        <div>
                          <label>근속 기간</label>
                          <p>-</p>
                        </div>
                      </div>
                      <div className={styles.summaryCard}>
                        <div className={styles.summaryIconPurple}>📋</div>
                        <div>
                          <label>총 휴직 기간</label>
                          <p>0일</p>
                        </div>
                      </div>
                    </div>

                    <div className={styles.historyLayout}>
                      <article className={styles.card}>
                        <div className={styles.cardTitleRow}>
                          <div className={styles.cardTitle}>
                            <span
                              className={`${styles.cardIcon} ${styles.iconGreen}`}
                            >
                              📄
                            </span>
                            <h3>재직·발령 이력</h3>
                          </div>
                          <button
                            type="button"
                            className={styles.addHistoryBtn}
                            onClick={() => setHistoryModalOpen(true)}
                          >
                            + 이력 추가
                          </button>
                        </div>

                        {historyLoading && <p>이력을 불러오는 중...</p>}
                        {historyError && (
                          <p className={styles.formError}>{historyError}</p>
                        )}

                        <div className={styles.timeline}>
                          {histories.map((h) => (
                            <div key={h.id} className={styles.timelineItem}>
                              <div
                                className={`${styles.timelineDot} ${styles.dotBlue}`}
                              >
                                ✓
                              </div>
                              <div className={styles.timelineContent}>
                                <div className={styles.timelineHeader}>
                                  <strong>
                                    {h.appointmentTypeName ||
                                      h.appointmentTypeCode}
                                  </strong>
                                  <span>{h.applyDate}</span>
                                </div>
                                <p>
                                  {[h.afterDepartmentName, h.afterPositionName]
                                    .filter(Boolean)
                                    .join(" · ") || "발령 정보"}
                                </p>
                                <small>
                                  {[
                                    h.afterPayStep != null
                                      ? `호봉: ${h.afterPayStep}`
                                      : "",
                                    h.note ?? "",
                                  ]
                                    .filter(Boolean)
                                    .join(" | ")}
                                </small>
                              </div>
                            </div>
                          ))}
                          {!historyLoading && histories.length === 0 && (
                            <p style={{ color: "#8a97ad", fontSize: 14 }}>
                              등록된 이력이 없습니다.
                            </p>
                          )}
                        </div>
                      </article>

                      <div className={styles.rightColumn}>
                        <article className={styles.card}>
                          <div className={styles.cardTitleRow}>
                            <div className={styles.cardTitle}>
                              <span
                                className={`${styles.cardIcon} ${styles.iconOrange}`}
                              >
                                📝
                              </span>
                              <h3>휴직 신청</h3>
                            </div>
                            <button
                              type="button"
                              className={styles.leaveApplyBtn}
                              onClick={onLeaveSubmit}
                              disabled={leaveSubmitting}
                            >
                              {leaveSubmitting ? "처리 중..." : "+ 휴직 신청"}
                            </button>
                          </div>

                          <div className={styles.formGroup}>
                            <label>휴직 유형 선택</label>
                            <div className={styles.typeButtons}>
                              {(
                                ["병가", "육아휴직", "개인사유"] as const
                              ).map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  className={
                                    leaveType === t
                                      ? styles.typeBtnActive
                                      : styles.typeBtn
                                  }
                                  onClick={() => setLeaveType(t)}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className={styles.dateRow}>
                            <div className={styles.formGroup}>
                              <label>휴직 시작일</label>
                              <input
                                type="date"
                                className={styles.dateInput}
                                value={leaveStart}
                                onChange={(e) => setLeaveStart(e.target.value)}
                              />
                            </div>
                            <div className={styles.formGroup}>
                              <label>휴직 종료일 (예정)</label>
                              <input
                                type="date"
                                className={styles.dateInput}
                                value={leaveEnd}
                                onChange={(e) => setLeaveEnd(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className={styles.formGroup}>
                            <label>휴직 사유 작성</label>
                            <textarea
                              className={styles.textarea}
                              rows={4}
                              maxLength={500}
                              value={leaveReason}
                              onChange={(e) => setLeaveReason(e.target.value)}
                              placeholder={
                                "개인 사유를 구체적으로 작성해 주세요.\n예) 부모님 간병으로 인한 휴직 신청이며, 요양 기간 동안 전담 보호가 필요합니다."
                              }
                            />
                            <div className={styles.charCount}>
                              {leaveReason.length} / 500
                            </div>
                          </div>
                        </article>

                        <article className={styles.card}>
                          <div className={styles.cardTitle}>
                            <span
                              className={`${styles.cardIcon} ${styles.iconBlue}`}
                            >
                              📤
                            </span>
                            <h3>퇴직 처리</h3>
                          </div>

                          <div className={styles.dateRow}>
                            <div className={styles.formGroup}>
                              <label>퇴직 예정일</label>
                              <input
                                type="date"
                                className={styles.dateInput}
                                value={retireDate}
                                onChange={(e) => setRetireDate(e.target.value)}
                              />
                            </div>
                            <div className={styles.formGroup}>
                              <label>퇴직 사유</label>
                              <select
                                className={styles.selectInput}
                                value={retireReason}
                                onChange={(e) =>
                                  setRetireReason(e.target.value)
                                }
                              >
                                <option value="">선택</option>
                                <option value="personal">개인 사유</option>
                                <option value="career">이직</option>
                                <option value="contract">계약 만료</option>
                                <option value="other">기타</option>
                              </select>
                            </div>
                          </div>

                          {retireReason === "other" && (
                            <div className={styles.formGroup}>
                              <label>
                                기타 사유 상세 입력{" "}
                                <b className={styles.required}>필수</b>
                              </label>
                              <textarea
                                className={`${styles.textarea} ${styles.retireDetail}`}
                                rows={3}
                                maxLength={300}
                                value={retireDetail}
                                onChange={(e) =>
                                  setRetireDetail(e.target.value)
                                }
                                placeholder={
                                  "기타 퇴직 사유를 구체적으로 작성해 주세요.\n퇴직 사유는 인사 기록에 영구 보존됩니다."
                                }
                              />
                              <div className={styles.charCount}>
                                {retireDetail.length} / 300
                              </div>
                              <p className={styles.retireHint}>
                                ‘기타’ 선택 시 반드시 사유를 입력해야 처리가
                                진행됩니다.
                              </p>
                            </div>
                          )}

                          <button
                            type="button"
                            className={styles.retireBtn}
                            onClick={onRetireSubmit}
                            disabled={retireSubmitting}
                          >
                            {retireSubmitting
                              ? "처리 중..."
                              : "퇴직 처리 진행"}
                          </button>
                        </article>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "license" && selected && (
                  <div className={styles.detailBody}>
                    <div className={styles.summaryRow}>
                      <div className={styles.summaryCard}>
                        <div className={styles.summaryIconOrange}>🏅</div>
                        <div>
                          <label>보유 면허 / 자격증</label>
                          <p>{licenses.length}건</p>
                        </div>
                      </div>
                      <div className={styles.summaryCard}>
                        <div className={styles.summaryIconGreen}>🎓</div>
                        <div>
                          <label>이수 교육</label>
                          <p>{educations.filter((e) => e.status === "done").length}건</p>
                        </div>
                      </div>
                      <div className={styles.summaryCard}>
                        <div className={styles.summaryIconBlue}>⏳</div>
                        <div>
                          <label>이수 대기 교육</label>
                          <p>{educations.filter((e) => e.status === "pending").length}건</p>
                        </div>
                      </div>
                      <div className={styles.summaryCard}>
                        <div className={styles.summaryIconPurple}>🔄</div>
                        <div>
                          <label>갱신 필요 자격</label>
                          <p>{licenses.filter((l) => l.status === "renew").length}건</p>
                        </div>
                      </div>
                    </div>

                    <div className={styles.historyLayout}>
                      <article className={styles.card}>
                        <div className={styles.cardTitleRow}>
                          <div className={styles.cardTitle}>
                            <span className={`${styles.cardIcon} ${styles.iconOrange}`}>🏅</span>
                            <h3>면허 / 자격증 목록</h3>
                          </div>
                          <button
                            type="button"
                            className={styles.addLicenseBtn}
                            onClick={() =>
                              setLicenseModal({ open: true, mode: "create", item: null })
                            }
                          >
                            + 자격 추가
                          </button>
                        </div>

                        <div className={styles.certList}>
                          {licenses.map((lic) => (
                            <div key={lic.id} className={styles.certItem}>
                              <div
                                className={`${styles.certIcon} ${
                                  lic.status === "renew" ? styles.certPurple : styles.certOrange
                                }`}
                              >
                                🏅
                              </div>
                              <div className={styles.certContent}>
                                <div className={styles.certHeader}>
                                  <strong>{lic.name}</strong>
                                  <span
                                    className={`${styles.certBadge} ${
                                      lic.status === "valid"
                                        ? styles.badgeValid
                                        : styles.badgeExpire
                                    }`}
                                  >
                                    {lic.status === "valid" ? "유효" : "갱신 필요"}
                                  </span>
                                </div>
                                <p className={styles.certNo}># {lic.number}</p>
                                <div className={styles.certMeta}>
                                  <span>취득: {lic.issueDate}</span>
                                  {lic.expireDate && <span>만료: {lic.expireDate}</span>}
                                  {lic.issuer && <span>{lic.issuer}</span>}
                                </div>
                              </div>
                              <button
                                type="button"
                                className={styles.iconBtn}
                                onClick={() =>
                                  setLicenseModal({ open: true, mode: "edit", item: lic })
                                }
                              >
                                ✎
                              </button>
                              <button
                                type="button"
                                className={styles.iconBtn}
                                onClick={() =>
                                  setLicenses((prev) => prev.filter((x) => x.id !== lic.id))
                                }
                              >
                                🗑
                              </button>
                            </div>
                          ))}
                        </div>
                      </article>

                      <article className={styles.card}>
                        <div className={styles.cardTitleRow}>
                          <div className={styles.cardTitle}>
                            <span className={`${styles.cardIcon} ${styles.iconGreen}`}>🎓</span>
                            <h3>교육 이수 목록</h3>
                          </div>
                          <div className={styles.eduActions}>
                            <div className={styles.eduFilters}>
                              {(["전체", "이수완료", "대기중"] as const).map((f) => (
                                <button
                                  key={f}
                                  type="button"
                                  className={
                                    eduFilter === f
                                      ? styles.eduFilterActive
                                      : styles.eduFilterBtn
                                  }
                                  onClick={() => setEduFilter(f)}
                                >
                                  {f}
                                </button>
                              ))}
                            </div>
                            <button
                              type="button"
                              className={styles.addEduBtn}
                              onClick={() =>
                                setEduModal({ open: true, mode: "create", item: null })
                              }
                            >
                              + 추가
                            </button>
                          </div>
                        </div>

                        <div className={styles.eduList}>
                          {educations
                            .filter((e) => {
                              if (eduFilter === "이수완료") return e.status === "done";
                              if (eduFilter === "대기중") return e.status === "pending";
                              return true;
                            })
                            .map((edu) => (
                              <div key={edu.id} className={styles.eduItem}>
                                <div
                                  className={`${styles.eduIcon} ${
                                    edu.status === "done"
                                      ? styles.eduGreen
                                      : edu.status === "pending"
                                        ? styles.eduOrange
                                        : styles.eduPurple
                                  }`}
                                >
                                  🎓
                                </div>
                                <div className={styles.eduContent}>
                                  <div className={styles.eduHeader}>
                                    <strong>{edu.name}</strong>
                                    <span
                                      className={`${styles.eduBadge} ${
                                        edu.status === "done"
                                          ? styles.eduDone
                                          : styles.eduPending
                                      }`}
                                    >
                                      {edu.status === "done"
                                        ? "이수완료"
                                        : edu.status === "pending"
                                          ? "대기중"
                                          : "미이수"}
                                    </span>
                                  </div>
                                  <div className={styles.eduMeta}>
                                    <span>
                                      {edu.startDate} ~ {edu.endDate}
                                    </span>
                                    <span>{edu.hours}시간</span>
                                    <span>{edu.org}</span>
                                  </div>
                                </div>
                                {edu.score && (
                                  <div className={styles.eduScore}>
                                    <strong>{edu.score}점</strong>
                                    <span>{edu.completion}</span>
                                  </div>
                                )}
                                <button
                                  type="button"
                                  className={styles.iconBtn}
                                  onClick={() =>
                                    setEduModal({ open: true, mode: "edit", item: edu })
                                  }
                                >
                                  ✎
                                </button>
                              </div>
                            ))}
                        </div>
                      </article>
                    </div>
                  </div>
                )}

                {activeTab === "health" && selected && (
                  <div className={styles.detailBody}>
                    <div className={styles.summaryRow}>
                      <div className={styles.summaryCard}>
                        <div className={styles.summaryIconBlue}>📋</div>
                        <div>
                          <label>총 검진 횟수</label>
                          <p>{healthRecords.length}회</p>
                        </div>
                      </div>
                      <div className={styles.summaryCard}>
                        <div className={styles.summaryIconGreen}>📅</div>
                        <div>
                          <label>최근 검진일</label>
                          <p>{healthRecords[0]?.date ?? "-"}</p>
                        </div>
                      </div>
                      <div className={styles.summaryCard}>
                        <div className={styles.summaryIconOrange}>📆</div>
                        <div>
                          <label>다음 예정일</label>
                          <p>{nextSchedule?.date ?? "-"}</p>
                        </div>
                      </div>
                      <div className={styles.summaryCard}>
                        <div className={styles.summaryIconGreen}>🛡</div>
                        <div>
                          <label>이상 소견</label>
                          <p className={styles.statusText}>
                            {selectedHealth?.result === "normal"
                              ? "정상"
                              : selectedHealth?.resultLabel}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className={styles.historyLayout}>
                      <article className={styles.card}>
                        <div className={styles.cardTitleRow}>
                          <div className={styles.cardTitle}>
                            <span className={`${styles.cardIcon} ${styles.iconBlue}`}>📋</span>
                            <h3>건강검진 이력</h3>
                          </div>
                          <button
                            type="button"
                            className={styles.addHealthBtn}
                            onClick={() => setHealthModalOpen(true)}
                          >
                            + 검진 추가
                          </button>
                        </div>

                        <table className={styles.healthTable}>
                          <thead>
                            <tr>
                              <th>검진일</th>
                              <th>검진 종류</th>
                              <th>결과</th>
                              <th>주요 소견</th>
                              <th>처리</th>
                            </tr>
                          </thead>
                          <tbody>
                            {healthRecords.map((h) => (
                              <tr key={h.id}>
                                <td>{h.date}</td>
                                <td>{h.type}</td>
                                <td>
                                  <span
                                    className={`${styles.healthResult} ${
                                      h.result === "normal"
                                        ? styles.resultNormal
                                        : styles.resultCaution
                                    }`}
                                  >
                                    {h.resultLabel}
                                  </span>
                                </td>
                                <td>{h.note}</td>
                                <td>
                                  <button
                                    type="button"
                                    className={styles.viewBtn}
                                    onClick={() => setSelectedHealthId(h.id)}
                                  >
                                    👁
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </article>

                      <div className={styles.rightColumn}>
                        <article className={styles.card}>
                          <div className={styles.cardTitleRow}>
                            <div className={styles.cardTitle}>
                              <span className={`${styles.cardIcon} ${styles.iconCyan}`}>🔬</span>
                              <h3>최근 검진 결과 상세</h3>
                            </div>
                            <span className={styles.healthDateBadge}>
                              {selectedHealth?.date}
                            </span>
                          </div>

                          {selectedHealth && (
                            <>
                              <div className={styles.overallResult}>
                                <span className={styles.overallIcon}>🛡</span>
                                <strong>
                                  종합 판정: {selectedHealth.grade ?? selectedHealth.resultLabel}
                                </strong>
                              </div>

                              <table className={styles.resultTable}>
                                <thead>
                                  <tr>
                                    <th>검사 항목</th>
                                    <th>결과값</th>
                                    <th>정상 범위</th>
                                    <th>판정</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {selectedHealth.items.map((item, i) => (
                                    <tr key={i}>
                                      <td>{item.name}</td>
                                      <td>{item.value}</td>
                                      <td>{item.range}</td>
                                      <td>
                                        <span
                                          className={`${styles.healthResult} ${
                                            item.judgment === "정상"
                                              ? styles.resultNormal
                                              : styles.resultCaution
                                          }`}
                                        >
                                          {item.judgment}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                  {selectedHealth.items.length === 0 && (
                                    <tr>
                                      <td colSpan={4} style={{ color: "#8a97ad" }}>
                                        상세 항목 없음
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </>
                          )}
                        </article>

                        <article className={styles.card}>
                          <div className={styles.cardTitleRow}>
                            <div className={styles.cardTitle}>
                              <span className={`${styles.cardIcon} ${styles.iconOrange}`}>📆</span>
                              <h3>다음 검진 일정</h3>
                            </div>
                            <div className={styles.scheduleActions}>
                              <button
                                type="button"
                                className={styles.scheduleBtn}
                                onClick={() => setScheduleModal({ open: true, mode: "create" })}
                              >
                                일정 등록
                              </button>
                              <button
                                type="button"
                                className={styles.scheduleBtnOutline}
                                onClick={() => {
                                  if (!nextSchedule) {
                                    setScheduleModal({ open: true, mode: "create" });
                                    return;
                                  }
                                  setScheduleModal({ open: true, mode: "edit" });
                                }}
                              >
                                일정 수정
                              </button>
                            </div>
                          </div>

                          {nextSchedule ? (
                            <div className={styles.nextSchedule}>
                              <div className={styles.scheduleDate}>
                                <span className={styles.scheduleIcon}>📅</span>
                                <div>
                                  <strong>{nextSchedule.date}</strong>
                                  <p>
                                    {nextSchedule.type} · {nextSchedule.org}
                                  </p>
                                </div>
                              </div>
                              <p className={styles.scheduleNote}>
                                검진{" "}
                                {nextSchedule.alarm === "none"
                                  ? "알림 없음"
                                  : `${nextSchedule.alarm}일 전 자동 알림 발송 예정`}
                              </p>
                            </div>
                          ) : (
                            <p style={{ color: "#8a97ad", fontSize: 14 }}>
                              등록된 일정이 없습니다.
                            </p>
                          )}
                        </article>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </main>

      {/* ===== 모달 ===== */}
      <AddressSearchModal
        open={addressOpen}
        onClose={() => setAddressOpen(false)}
        onSelect={({ zipCode, address }) => {
          setForm((prev) => ({
            ...prev,
            zipCode,
            address,
          }));
        }}
      />

      <BankAccountVerifyModal
        open={bankVerifyOpen}
        bankName={form.bankName}
        accountNo={form.bankAccount}
        onClose={() => setBankVerifyOpen(false)}
        onVerified={() => {
          setBankVerified(true);
          setBankVerifyOpen(false);
        }}
        onChangeAccount={() => setBankVerified(false)}
      />

      <EmploymentHistoryModal
        open={historyModalOpen}
        employeeLabel={`${selected?.name ?? ""} · ${selected?.department ?? ""} ${selected?.position ?? ""} · ${selected?.employeeNo ?? ""}`}
        onClose={() => setHistoryModalOpen(false)}
        onSave={onSaveHistory}
      />

      <LicenseModal
        open={licenseModal.open}
        mode={licenseModal.mode}
        employeeLabel={`${selected?.name ?? ""} · ${selected?.department ?? ""} ${selected?.position ?? ""} · ${selected?.employeeNo ?? ""}`}
        initial={licenseModal.item}
        onClose={() => setLicenseModal((p) => ({ ...p, open: false }))}
        onSave={(data) => {
          if (data.id) {
            setLicenses((prev) =>
              prev.map((x) =>
                x.id === data.id
                  ? {
                      ...x,
                      ...data,
                      status: data.needRenewAlarm ? "renew" : "valid",
                    }
                  : x,
              ),
            );
          } else {
            setLicenses((prev) => [
              ...prev,
              {
                ...data,
                id: String(Date.now()),
                status: data.needRenewAlarm ? "renew" : "valid",
              },
            ]);
          }
        }}
        onDelete={
          licenseModal.item
            ? () => {
                setLicenses((prev) =>
                  prev.filter((x) => x.id !== licenseModal.item!.id),
                );
                setLicenseModal((p) => ({ ...p, open: false }));
              }
            : undefined
        }
      />

      <EducationModal
        open={eduModal.open}
        mode={eduModal.mode}
        employeeLabel={`${selected?.name ?? ""} · ${selected?.department ?? ""} ${selected?.position ?? ""} · ${selected?.employeeNo ?? ""}`}
        initial={eduModal.item}
        onClose={() => setEduModal((p) => ({ ...p, open: false }))}
        onSave={(data) => {
          if (data.id) {
            setEducations((prev) =>
              prev.map((x) => (x.id === data.id ? { ...x, ...data } : x)),
            );
          } else {
            setEducations((prev) => [
              ...prev,
              { ...data, id: String(Date.now()) },
            ]);
          }
        }}
        onDelete={
          eduModal.item
            ? () => {
                setEducations((prev) =>
                  prev.filter((x) => x.id !== eduModal.item!.id),
                );
                setEduModal((p) => ({ ...p, open: false }));
              }
            : undefined
        }
      />

            <HealthCheckModal
        open={healthModalOpen}
        employeeLabel={`${selected?.name ?? ""} · ${selected?.department ?? ""} ${selected?.position ?? ""} · ${selected?.employeeNo ?? ""}`}
        onClose={() => setHealthModalOpen(false)}
        onSave={(data) => {
          const id = String(Date.now());
          setHealthRecords((prev) => [{ ...data, id }, ...prev]);
          setSelectedHealthId(id);
        }}
      />

      <HealthScheduleModal
        open={scheduleModal.open}
        mode={scheduleModal.mode}
        employeeLabel={selected?.name ?? ""}
        employeeSub={`${selected?.department ?? ""} · ${selected?.position ?? ""} · 최근 검진: ${healthRecords[0]?.date ?? "-"}`}
        initial={scheduleModal.mode === "edit" ? nextSchedule : null}
        onClose={() => setScheduleModal((p) => ({ ...p, open: false }))}
        onSave={(data) => setNextSchedule(data)}
        onDelete={
          scheduleModal.mode === "edit"
            ? () => {
                setNextSchedule(null);
                setScheduleModal((p) => ({ ...p, open: false }));
              }
            : undefined
        }
      />
    </>

    
  );
}