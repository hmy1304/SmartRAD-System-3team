"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import {
  Calendar,
  Clock,
  AlertTriangle,
  FileText,
  PieChart,
  X,
  ChevronDown,
  Download,
  Plus,
  Check,
  Search,
  User,
  Paperclip,
  AlertCircle,
  File as FileIcon,
  Trash2,
  Eye,
  ShieldAlert,
} from "lucide-react";
import styles from "./LeavePage.module.scss";
import type {
  LeaveSummaryResponse,
  LeaveApplicationResponse,
} from "@/types/leave";
import {
  fetchLeaveSummary,
  fetchLeaveApplications,
  fetchEmployeeQuota,
  submitLeaveApplication,
  updateLeaveStatuses,
  deleteLeaveApplication,
  downloadLeaveReportServer,
} from "@/services/leaveService";
import { getEmployees } from "@/services/employeeService";

interface EmpOption {
  id: number;
  name: string;
  dept: string;
  pos: string;
  initial: string;
  tone: "blue" | "cyan" | "green" | "purple" | "red" | "orange" | "amber";
  isApprover?: boolean;
}

// 기본 사원 (DB 연결 전 폴백 및 테스트 뷰어 스위처 제공)
const MOCK_EMPLOYEES: EmpOption[] = [
  { id: 8, name: "김관리", dept: "인사총무팀", pos: "수석 (승인권자)", initial: "김", tone: "blue", isApprover: true },
  { id: 1, name: "박시준", dept: "영상의학과", pos: "부장 (승인권자)", initial: "박", tone: "cyan", isApprover: true },
  { id: 3, name: "김민서", dept: "진단검사의학과", pos: "사원 (본인)", initial: "김", tone: "green", isApprover: false },
  { id: 4, name: "신유나", dept: "영상의학과", pos: "대리 (본인)", initial: "신", tone: "purple", isApprover: false },
  { id: 5, name: "최지은", dept: "인사총무팀", pos: "과장 (승인권자)", initial: "최", tone: "red", isApprover: true },
  { id: 6, name: "정우진", dept: "응급의학과", pos: "인턴 (본인)", initial: "정", tone: "orange", isApprover: false },
  { id: 7, name: "배준혁", dept: "원무과", pos: "주임 (본인)", initial: "배", tone: "amber", isApprover: false },
];

const MOCK_SUMMARY_DEFAULT: LeaveSummaryResponse = {
  totalAllocatedDays: 132,
  totalUsedDays: 73.5,
  usedPercentage: 55.7,
  totalRemainingDays: 58.5,
  thisMonthApplications: 7,
  pendingApplications: 2,
  riskEmployeeCount: 3,
  typeStats: [
    { type: "연차", count: 4, percentage: 57.1 },
    { type: "반차", count: 2, percentage: 28.6 },
    { type: "병가", count: 1, percentage: 14.3 },
    { type: "기타", count: 0, percentage: 0.0 },
  ],
  riskEmployees: [
    { employeeId: 5, name: "최지은", initial: "최", department: "인사총무팀", remainingDays: 1, tone: "red", tagStyle: "riskOne" },
    { employeeId: 7, name: "배준혁", initial: "배", department: "원무과", remainingDays: 2, tone: "orange", tagStyle: "riskTwo" },
    { employeeId: 6, name: "정우진", initial: "정", department: "응급의학과", remainingDays: 2, tone: "orange", tagStyle: "riskTwo" },
  ],
};

const FILTERS = ["전체", "승인대기", "승인완료", "반려"] as const;

export default function LeavePage() {
  const [applications, setApplications] = useState<LeaveApplicationResponse[]>([]);
  const [summary, setSummary] = useState<LeaveSummaryResponse>(MOCK_SUMMARY_DEFAULT);
  const [empList, setEmpList] = useState<EmpOption[]>(MOCK_EMPLOYEES);

  // 👤 뷰어 시뮬레이터: 현재 접속한 사용자가 누구인가? (승인권자 vs 일반 사원 본인)
  const [currentViewer, setCurrentViewer] = useState<EmpOption>(MOCK_EMPLOYEES[0]);

  // 상단 연도 및 월 실시간 조회 필터
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(7);

  // 테이블 제어 필터 상태
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("전체");
  const [typeFilter, setTypeFilter] = useState("≡ 유형 전체");
  const [deptFilter, setDeptFilter] = useState("전체 부서");
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<(string | number)[]>([]);

  // 모달 제어 및 입력 폼 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<EmpOption>(MOCK_EMPLOYEES[0]);
  const [modalLeaveType, setModalLeaveType] = useState<"연차" | "반차(오전)" | "반차(오후)" | "병가" | "기타">("연차");
  const [startDate, setStartDate] = useState("2026-07-14");
  const [endDate, setEndDate] = useState("2026-07-15");
  const [proxyName, setProxyName] = useState("오하늘 과장");
  const [approverName, setApproverName] = useState("김관리 (인사총무팀 · 수석)");
  const [note, setNote] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [quotaInfo, setQuotaInfo] = useState({ totalDays: 15.0, usedDays: 2.0, remainingDays: 13.0 });

  // 첨부파일 바로보기 모달 상태
  const [viewingFile, setViewingFile] = useState<{ url: string; name: string } | null>(null);

  // 팝오버 드롭다운 상태
  const [isEmpSelectOpen, setIsEmpSelectOpen] = useState(false);
  const [isProxySelectOpen, setIsProxySelectOpen] = useState(false);
  const [isApproverSelectOpen, setIsApproverSelectOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // DB 실데이터 기반 부서 및 승인권자 리스트 동적 생성
  const availableDepts = useMemo(() => {
    const depts = new Set<string>(["전체 부서"]);
    empList.forEach((e) => { if (e.dept && e.dept !== "부서없음") depts.add(e.dept); });
    applications.forEach((a) => { if (a.department && a.department !== "부서없음") depts.add(a.department); });
    return Array.from(depts);
  }, [empList, applications]);

  const availableApprovers = useMemo(() => {
    return empList.filter((e) => 
      e.pos.includes("부장") || e.pos.includes("수석") || e.pos.includes("과장") || e.pos.includes("수간호사") || e.pos.includes("승인권자")
    );
  }, [empList]);

  // API 실시간 로드
  const loadData = useCallback(async () => {
    try {
      const summaryData = await fetchLeaveSummary(selectedYear, selectedMonth);
      if (summaryData) {
        setSummary(summaryData);
      }

      const apps = await fetchLeaveApplications(
        filter === "전체" ? undefined : filter,
        typeFilter === "≡ 유형 전체" ? undefined : typeFilter,
        keyword || undefined,
        selectedYear,
        selectedMonth
      );
      if (apps) {
        setApplications(apps);
      }
    } catch (err) {
      // 오프라인 방어 폴백 유지
    }
  }, [selectedYear, selectedMonth, filter, typeFilter, keyword]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 사원 정보 실 DB 연동
  useEffect(() => {
    getEmployees(50)
      .then((res) => {
        if (res && res.content && res.content.length > 0) {
          const tones: ("blue" | "cyan" | "green" | "purple" | "red" | "orange" | "amber")[] = [
            "blue", "cyan", "green", "purple", "red", "orange", "amber"
          ];
          const mapped: EmpOption[] = res.content.map((e, idx) => {
            const pos = e.positionName || e.roleGroupName || "사원";
            const isMgr = pos.includes("부장") || pos.includes("수석") || pos.includes("과장") || pos.includes("1급") || e.name === "김관리";
            return {
              id: Number(e.id) || idx + 10,
              name: e.name || "사원",
              dept: e.departmentName || "의료중재팀",
              pos: `${pos} ${isMgr ? "(승인권자)" : "(사원)"}`,
              initial: (e.name || "사").substring(0, 1),
              tone: tones[idx % tones.length],
              isApprover: isMgr,
            };
          });
          setEmpList(mapped);
          if (mapped.length > 0 && !selectedEmp.id) {
            setSelectedEmp(mapped[0]);
          }
        }
      })
      .catch(() => {});
  }, []);

  // 선택 사원의 해당 연도 연차 대장 실시간 호출
  useEffect(() => {
    if (!selectedEmp) return;
    fetchEmployeeQuota(selectedEmp.id, selectedYear)
      .then((q) => {
        if (q) {
          setQuotaInfo({
            totalDays: q.totalDays ?? 15.0,
            usedDays: q.usedDays ?? 0.0,
            remainingDays: q.remainingDays ?? 15.0,
          });
        }
      })
      .catch(() => {
        setQuotaInfo({ totalDays: 15.0, usedDays: 3.0, remainingDays: 12.0 });
      });
  }, [selectedEmp, selectedYear]);

  // 영업일 계산 로직
  const calculatedDays = useMemo(() => {
    if (modalLeaveType.includes("반차")) return 0.5;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return 0;

    let workDays = 0;
    const cur = new Date(s);
    while (cur <= e) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) workDays++;
      cur.setDate(cur.getDate() + 1);
    }
    return workDays;
  }, [startDate, endDate, modalLeaveType]);

  const afterRemainDays = useMemo(() => {
    return Math.round((quotaInfo.remainingDays - calculatedDays) * 100.0) / 100.0;
  }, [quotaInfo.remainingDays, calculatedDays]);

  // 부서 등 프론트 필터링 반영
  const filtered = useMemo(() => {
    return applications.filter((row) => {
      const matchDept = deptFilter === "전체 부서" || row.department === deptFilter;
      return matchDept;
    });
  }, [applications, deptFilter]);

  // 📌 특별승인이 필요한 건(마이너스 잔류 혹은 danger 태그)은 체크박스 및 일괄 선택 제외
  const isSpecialReqRow = (row: LeaveApplicationResponse) => {
    return row.remainType === "danger" || row.remainText?.includes("-") || row.note?.includes("특별") || row.note?.includes("초과");
  };

  const selectableRows = useMemo(() => {
    return filtered.filter((row) => !isSpecialReqRow(row) && row.status === "승인대기");
  }, [filtered]);

  const toggleSelect = (id: string | number, disabled: boolean) => {
    if (disabled) {
      alert("⚠️ 연차 초과 등 특별승인 필요 건은 체크박스 일괄 승인이 불가능합니다. 우측 [🚨 특별승인] 버튼으로 개별 사유 기재 후 결재해 주십시오.");
      return;
    }
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (selected.length === selectableRows.length && selectableRows.length > 0) {
      setSelected([]);
    } else {
      setSelected(selectableRows.map((r) => r.id));
    }
  };

  // 1. 선택 승인 핸들러 (승인권자 전용)
  const handleBulkApprove = async () => {
    if (!currentViewer.isApprover) {
      alert("휴가 결재는 '승인권자' 권한을 가진 관리자만 수행할 수 있습니다.");
      return;
    }
    if (selected.length === 0) {
      alert("승인할 휴가 신청 건(승인대기 상태)을 체크박스로 고르세요.\n(특별승인 대상은 일괄 선택에서 자동 차단됩니다.)");
      return;
    }
    try {
      await updateLeaveStatuses(selected, "승인완료");
      alert(`${selected.length}건의 휴가 신청이 승인 완료되었으며 해당 직원의 연차가 자동 차감되었습니다.`);
      setSelected([]);
      loadData();
    } catch (err) {
      alert("오프라인 또는 서버 응답 불가 상태입니다.");
    }
  };

  // 1-1. 선택 반려 핸들러 (승인권자 전용)
  const handleBulkReject = async () => {
    if (!currentViewer.isApprover) {
      alert("휴가 결재는 '승인권자' 권한을 가진 관리자만 수행할 수 있습니다.");
      return;
    }
    if (selected.length === 0) {
      alert("반려할 휴가 신청 건을 체크박스로 고르세요.");
      return;
    }
    const note = window.prompt("반려 사유를 입력하세요 (선택 가능):", "일정 조정 및 업무 편제 사유로 반려");
    if (note === null) return;

    try {
      await updateLeaveStatuses(selected, "반려", note);
      alert(`${selected.length}건의 휴가 신청이 반려 처리되었습니다. (차감된 연차 자동 복원 완료)`);
      setSelected([]);
      loadData();
    } catch (err) {
      alert("오프라인 또는 서버 응답 불가 상태입니다.");
    }
  };

  // 2. 🚨 단건 특별승인 핸들러 (승인권자 전용 & 사유 작성 필수)
  const handleSpecialApprove = async (id: number | string, empName: string) => {
    if (!currentViewer.isApprover) {
      alert("특별승인은 승인권자 및 인사 총책임자만 집계할 수 있습니다.");
      return;
    }
    const reason = window.prompt(
      `⚠️ [${empName}] 사원의 해당 휴가는 잔여 연차 소진을 초과하는 특별승인 심사 대상입니다.\n\n특별 승인을 득하는 명확한 사유를 필수 작성해 주십시오:`,
      "프로젝트 기여도 인정 및 차기년도 연차 당겨쓰기 특별 승인"
    );
    if (reason === null) return; // 취소
    if (!reason.trim()) {
      alert("❌ 특별승인의 경우 결재 사유 작성이 법적 허가 상 필수입니다. 처리가 중단됩니다.");
      return;
    }
    try {
      await updateLeaveStatuses([id], "승인완료", `[특별승인 허가: ${reason}]`);
      alert(`[${empName}] 사원의 특별승인 처리가 무사히 완료되었습니다. 기입한 사유가 감사 로그에 기록됩니다.`);
      loadData();
    } catch (err) {
      alert("서버 연결 실패. 다시 시도하세요.");
    }
  };

  // 3. 🗑️ 휴가 신청 취소 핸들러 (본인 전용)
  const handleCancelMyApplication = async (id: number | string, appOwnerName: string) => {
    if (currentViewer.name !== appOwnerName && !currentViewer.name.includes("관리")) {
      alert("❌ 휴가 신청 취소는 신청자 '본인'만 수행할 수 있습니다.\n우상단의 접속 권한 뷰어에서 본인 아이디로 변경 후 시도하세요.");
      return;
    }
    const confirmCancel = window.confirm(`정말로 휴가 신청 건을 취소(삭제)하시겠습니까?\n이미 승인되었던 건이라면 연차가 복원되고 물리 첨부파일이 파쇄됩니다.`);
    if (!confirmCancel) return;

    try {
      await deleteLeaveApplication(id);
      alert("휴가 신청 내역이 본인 요청에 의해 안전하게 철회 및 삭에 완료되었습니다.");
      loadData();
    } catch (err) {
      alert("취소 처리 중 오류가 발생했습니다.");
    }
  };

  // 4. 📎 첨부파일 모달 바로보기 실행 핸들러
  const openFileViewer = (fileName?: string) => {
    const name = fileName || "기본진단서_사본.pdf";
    const url = `/api/v1/leave/attachments/${encodeURIComponent(name)}`;
    setViewingFile({ url, name });
  };

  // 5. 서버 사이드 고급 엑셀 보고서 다운로드 핸들러
  const handleExportCsv = async () => {
    try {
      await downloadLeaveReportServer(
        selectedYear,
        selectedMonth,
        filter === "전체" ? undefined : filter,
        typeFilter === "≡ 유형 전체" ? undefined : typeFilter,
        keyword || undefined
      );
    } catch (err) {
      if (filtered.length === 0) {
        alert("출력할 데이터가 없습니다.");
        return;
      }
      const headers = ["직원명,부서,직급,휴가유형,신청일,휴가기간,일수,잔여연차,대리인,승인자,상태"];
      const rows = filtered.map(
        (r) =>
          `"${r.name}","${r.department}","${r.position.split("· ")[1] || "사원"}","${r.type}","${r.applyDate}","${r.period}","${r.days}","${r.remainText}","${r.proxy}","${r.approver}","${r.status}"`,
      );
      const csvContent = "\uFEFF" + [headers, ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `휴가감사보고서_${selectedYear}년_${selectedMonth || "전체"}월.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setAttachedFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleModalSubmit = async () => {
    if (modalLeaveType === "병가" && !attachedFile) {
      const confirmNoDoc = window.confirm("병가 신청이나 진단서 첨부파일이 없습니다. 그대로 진행하시겠습니까?");
      if (!confirmNoDoc) return;
    }

    const formData = new FormData();
    formData.append("employeeId", selectedEmp.id.toString());
    formData.append("leaveType", modalLeaveType);
    formData.append("startDate", startDate.replaceAll(".", "-"));
    formData.append("endDate", endDate.replaceAll(".", "-"));
    formData.append("days", calculatedDays.toString());
    formData.append("proxyEmployeeName", proxyName);
    formData.append("approverName", approverName.split(" (")[0]);
    if (note) formData.append("note", note);
    if (attachedFile) formData.append("file", attachedFile);

    try {
      await submitLeaveApplication(formData);
      alert("휴가 신청이 안전하게 등록되었습니다. (서버 물리 파일 업로드 및 대장 연계 완료)");
      setIsModalOpen(false);
      setAttachedFile(null);
      loadData();
    } catch (err) {
      alert("휴가 등록에 실패했습니다. 서버 상태를 확인하세요.");
    }
  };

  return (
    <main className={styles.main}>
      {/* 페이지 헤더 */}
      <div className={styles.pageHeader}>
        <div>
          <h1>휴가 관리</h1>
          <p>직원의 연차·반차·병가 등 휴가 신청 현황을 조회하고 승인 처리합니다.</p>
        </div>
        <div className={styles.pageActions}>
          {/* 👤 현재 접속 계정 (승인권자 vs 일반 본인 시뮬레이터) */}
          <div className={styles.viewerSelector} title="권한별 버튼 표출 테스트를 위해 현재 로그인된 사용자를 자유롭게 바꿀 수 있습니다.">
            <span>👤 현재 사용자:</span>
            <select
              className={styles.viewerSelect}
              value={currentViewer.id}
              onChange={(e) => {
                const found = empList.find((x) => x.id === Number(e.target.value));
                if (found) setCurrentViewer(found);
              }}
            >
              {empList.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.isApprover ? "승인권자" : "본인·사원"})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.selectWrapper}>
            <Calendar size={15} color="#475569" className={styles.selectIcon} />
            <select
              className={styles.selectWithIcon}
              value={`${selectedYear}년`}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              <option value="2026년">2026년</option>
              <option value="2025년">2025년</option>
            </select>
            <ChevronDown size={14} className={styles.arrowIcon} />
          </div>

          <div className={styles.selectWrapper}>
            <select
              className={styles.select}
              value={selectedMonth ? `${selectedMonth}월` : "전체 월"}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedMonth(val === "전체 월" ? undefined : parseInt(val));
              }}
            >
              <option value="7월">7월</option>
              <option value="6월">6월</option>
              <option value="5월">5월</option>
              <option value="전체 월">전체 월</option>
            </select>
            <ChevronDown size={14} className={styles.arrowIcon} />
          </div>

          <button type="button" className={styles.outlineBtn} onClick={handleExportCsv}>
            <Download size={15} />
            감사 보고서 내보내기
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => {
              setSelectedEmp(currentViewer);
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            휴가 등록
          </button>
        </div>
      </div>

      {/* 요약 KPI 카드 (5개 - 실데이터) */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryTop}>
            <label>전체 부여 연차</label>
            <span className={styles.iconBadgeGreen}>
              <FileText size={18} />
            </span>
          </div>
          <p className={styles.kpiValue}>
            {(summary.totalAllocatedDays ?? 0).toLocaleString()}<span>일</span>
          </p>
          <small className={styles.tagGreen}>● 1인 평균 15~20일</small>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryTop}>
            <label>사용 연차</label>
            <span className={styles.iconBadgeBlue}>
              <Calendar size={18} />
            </span>
          </div>
          <p className={styles.kpiValue}>
            {(summary.totalUsedDays ?? 0).toLocaleString()}<span>일</span>
          </p>
          <div className={styles.progressRow}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${Math.min(100, summary.usedPercentage ?? 0)}%` }}
              />
            </div>
            <span className={styles.progressText}>{summary.usedPercentage ?? 0}%</span>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryTop}>
            <label>잔여 연차</label>
            <span className={styles.iconBadgeTeal}>
              <Calendar size={18} />
            </span>
          </div>
          <p className={styles.kpiValue}>
            {(summary.totalRemainingDays ?? 0).toLocaleString()}<span>일</span>
          </p>
          <small className={styles.tagGreen}>● 실시간 DB 합산 잔여</small>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryTop}>
            <label>조회 기간 신청</label>
            <span className={styles.iconBadgeOrange}>
              <Clock size={18} />
            </span>
          </div>
          <p className={styles.kpiValue}>
            {(summary.thisMonthApplications ?? 0).toLocaleString()}<span>건</span>
          </p>
          <small className={styles.tagOrange}>
            ● 승인대기 {summary.pendingApplications ?? 0}건
          </small>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryTop}>
            <label>연차 소진 경고</label>
            <span className={styles.iconBadgeRed}>
              <AlertTriangle size={18} />
            </span>
          </div>
          <p className={`${styles.kpiValue} ${styles.textRed}`}>
            {summary.riskEmployeeCount ?? 0}<span>명</span>
          </p>
          <small className={styles.tagRed}>● 잔여 5일 이하 주의군</small>
        </div>
      </div>

      {/* 본문 (테이블 + 우측 위젯) */}
      <div className={styles.contentGrid}>
        <section className={styles.tableSection}>
          <div className={styles.tableControlBar}>
            <div className={styles.tabs}>
              {FILTERS.map((f) => {
                const isActive = filter === f;
                return (
                  <button
                    key={f}
                    type="button"
                    className={`${styles.tabBtn} ${isActive ? styles.tabActive : ""}`}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                    {f === "승인대기" && (
                      <span className={styles.countBadge}>{summary.pendingApplications ?? 0}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className={styles.controlsRight}>
              <div className={styles.searchBox}>
                <Search size={15} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="직원명 검색"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              <div className={styles.selectWrapper}>
                <select
                  className={styles.filterSelect}
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="≡ 유형 전체">≡ 유형 전체</option>
                  <option value="연차">연차</option>
                  <option value="반차">반차</option>
                  <option value="병가">병가</option>
                  <option value="기타">기타</option>
                </select>
                <ChevronDown size={14} className={styles.arrowIcon} />
              </div>

              {/* 📌 승인권자에게만 표출되는 선택 승인 / 선택 반려 버튼 */}
              {currentViewer.isApprover && (
                <>
                  <button
                    type="button"
                    className={styles.bulkApproveBtn}
                    onClick={handleBulkApprove}
                  >
                    <Check size={16} />
                    선택 승인
                  </button>
                  <button
                    type="button"
                    className={styles.bulkRejectBtn}
                    onClick={handleBulkReject}
                  >
                    <X size={16} strokeWidth={2.5} />
                    선택 반려
                  </button>
                </>
              )}
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.thCheck}>
                    <input
                      type="checkbox"
                      checked={selected.length === selectableRows.length && selectableRows.length > 0}
                      onChange={toggleAll}
                      disabled={!currentViewer.isApprover || selectableRows.length === 0}
                    />
                  </th>
                  <th>직원</th>
                  <th>부서</th>
                  <th>휴가 유형</th>
                  <th>신청일</th>
                  <th>휴가 기간</th>
                  <th>일수</th>
                  <th>잔여 연차</th>
                  <th>대리인</th>
                  <th>승인자</th>
                  <th>관리 조치 (권한분리)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const isChecked = selected.includes(row.id);
                  const isSpecial = isSpecialReqRow(row);
                  const isCheckboxDisabled = !currentViewer.isApprover || isSpecial || row.status !== "승인대기";

                  let typeBadgeClass = styles.typeAnnual;
                  if (row.type.includes("반차")) typeBadgeClass = styles.typeHalf;
                  else if (row.type.includes("병가")) typeBadgeClass = styles.typeSick;
                  else if (row.type.includes("기타")) typeBadgeClass = styles.typeOther;

                  const isMyApplication = currentViewer.name === row.name || currentViewer.name === "김관리";

                  return (
                    <tr key={row.id} className={isChecked ? styles.rowChecked : ""}>
                      <td className={styles.tdCheck}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isCheckboxDisabled}
                          className={isCheckboxDisabled ? styles.checkboxDisabled : ""}
                          onChange={() => toggleSelect(row.id, isCheckboxDisabled)}
                          title={isSpecial ? "특별승인 대상은 일괄 체크가 불가능합니다. 우측 [특별승인]으로 사유 기입 바랍니다." : ""}
                        />
                      </td>
                      <td>
                        <div className={styles.empCell}>
                          <span className={`${styles.avatarBadge} ${styles[row.tone || "blue"]}`}>
                            {row.initial}
                          </span>
                          <span className={styles.empName}>{row.name}</span>
                          <span className={styles.empPos}>
                            · {row.position.split("· ")[1] || row.position}
                          </span>
                        </div>
                      </td>
                      <td className={styles.deptCell}>{row.department}</td>
                      <td>
                        <span className={`${styles.typeBadge} ${typeBadgeClass}`}>
                          <span className={styles.dot} />
                          {row.type}
                        </span>
                        {/* 📎 첨부파일 (클릭 시 모달 창에서 내용 바로보기) */}
                        {(row.hasAttachment || row.type === "병가" || row.attachmentName) && (
                          <span
                            className={styles.clipBadge}
                            title="클릭하여 모달창에서 진단서 및 첨부 내역 보기"
                            onClick={() => openFileViewer(row.attachmentName)}
                          >
                            <Paperclip size={11} />
                            보기
                          </span>
                        )}
                      </td>
                      <td className={styles.dateCell}>{row.applyDate}</td>
                      <td className={styles.periodCell}>{row.period}</td>
                      <td className={styles.daysCell}>{row.days}</td>
                      <td>
                        <span className={`${styles.remainPill} ${styles[row.remainType || "normal"]}`}>
                          {row.remainText}
                          {isSpecial && " ⚠️"}
                        </span>
                      </td>
                      <td className={styles.proxyCell}>{row.proxy}</td>
                      <td>
                        {row.approver !== "—" ? (
                          <div className={styles.approverCell}>
                            <span className={`${styles.avatarSmall} ${styles.blue}`}>
                              {row.approver.substring(0, 1)}
                            </span>
                            <span>{row.approver}</span>
                          </div>
                        ) : (
                          <span className={styles.dash}>—</span>
                        )}
                      </td>
                      {/* 📌 권한 기반 액션 열 (본인 취소 vs 승인권자 특별승인) */}
                      <td>
                        <div className={styles.actionGroup}>
                          {/* 1. 특별승인 대상 건 & 승인권자 viewing 시 개별 처리 버튼 표출 */}
                          {isSpecial && row.status === "승인대기" && currentViewer.isApprover && (
                            <button
                              type="button"
                              className={styles.specialApproveBtn}
                              onClick={() => handleSpecialApprove(row.id, row.name)}
                            >
                              <ShieldAlert size={13} />
                              🚨 특별승인
                            </button>
                          )}

                          {/* 2. 본인의 신청 건일 경우 '휴가 취소(철회)' 버튼 표출 */}
                          {isMyApplication && (
                            <button
                              type="button"
                              className={styles.cancelBtn}
                              onClick={() => handleCancelMyApplication(row.id, row.name)}
                              title="본인이 신청한 휴가를 취소(철회)하고 첨부파일을 삭제합니다."
                            >
                              <Trash2 size={13} />
                              본인취소
                            </button>
                          )}

                          {!isSpecial && !isMyApplication && (
                            <span className={styles.dash}>—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 우측 사이드 패널 */}
        <aside className={styles.sidePanels}>
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <span className={styles.panelIconGreen}>
                <PieChart size={17} />
              </span>
              <h3>유형별 신청 현황</h3>
            </div>
            <div className={styles.typeStatList}>
              {(summary.typeStats || []).map((stat) => {
                let dotStyle = styles.dotAnnual;
                let fillStyle = styles.statFillAnnual;
                let textStyle = styles.statPercentGreen;
                if (stat.type.includes("반차")) {
                  dotStyle = styles.dotHalf;
                  fillStyle = styles.statFillHalf;
                  textStyle = styles.statPercentBlue;
                } else if (stat.type.includes("병가")) {
                  dotStyle = styles.dotSick;
                  fillStyle = styles.statFillSick;
                  textStyle = styles.statPercentPurple;
                } else if (stat.type.includes("기타")) {
                  dotStyle = styles.dotOther;
                  fillStyle = styles.statFillOther;
                  textStyle = styles.statPercentOrange;
                }
                return (
                  <div key={stat.type} className={styles.statItem}>
                    <div className={styles.statInfo}>
                      <span className={`${styles.statDot} ${dotStyle}`} />
                      <span className={styles.statLabel}>{stat.type}</span>
                      <strong className={styles.statCount}>{stat.count ?? 0}건</strong>
                    </div>
                    <div className={styles.statBarWrapper}>
                      <div className={styles.statBar}>
                        <div className={fillStyle} style={{ width: `${stat.percentage ?? 0}%` }} />
                      </div>
                      <span className={textStyle}>{(stat.percentage ?? 0).toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.panelCard}>
            <div className={styles.panelHeaderRisk}>
              <div className={styles.headerTitleLeft}>
                <span className={styles.panelIconRed}>
                  <AlertTriangle size={17} color="#dc2626" />
                </span>
                <h3>연차 소진 위험</h3>
              </div>
              <span className={styles.riskCountBadge}>{summary.riskEmployeeCount ?? 0}명</span>
            </div>

            <div className={styles.alertBanner}>
              <AlertCircle size={15} color="#dc2626" className={styles.alertIcon} />
              <span>잔여 연차 5일 이하 주의 사원입니다.</span>
            </div>

            <div className={styles.riskList}>
              {(summary.riskEmployees || []).map((emp) => (
                <div key={emp.employeeId} className={styles.riskItem}>
                  <div className={styles.riskUser}>
                    <span className={`${styles.avatarBadge} ${styles[emp.tone || "orange"]}`}>
                      {emp.initial}
                    </span>
                    <div className={styles.riskText}>
                      <strong>{emp.name}</strong>
                      <small>{emp.department}</small>
                    </div>
                  </div>
                  <span className={`${styles.riskDaysTag} ${styles[emp.tagStyle || "riskTwo"]}`}>
                    잔여 {emp.remainingDays ?? 0}일
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* 📎 첨부파일 모달 창에서 내용 보기 (Point 1 구현) */}
      {viewingFile && (
        <div className={styles.modalOverlay} onClick={() => setViewingFile(null)}>
          <div className={styles.fileModalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.headerLeft}>
                <div className={styles.modalIconBox}>
                  <Eye size={22} color="#ffffff" />
                </div>
                <div>
                  <h2>첨부파일 바로보기</h2>
                  <p>모달 내부에서 진단서 및 허가증을 직접 검증합니다: <strong>{viewingFile.name}</strong></p>
                </div>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setViewingFile(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.fileModalBody}>
              {/* PDF나 이미지 형식 모달 창 내부 네이티브 렌더링 */}
              {viewingFile.name.endsWith(".pdf") || viewingFile.url.includes(".pdf") ? (
                <iframe src={viewingFile.url} title="PDF Viewer" />
              ) : viewingFile.name.endsWith(".png") || viewingFile.name.endsWith(".jpg") || viewingFile.name.endsWith(".jpeg") ? (
                <img src={viewingFile.url} alt="Attached Document" />
              ) : (
                <div className={styles.fileFallback}>
                  <FileText size={48} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
                  <p>해당 문서 포맷은 브라우저 바로보기가 지원되지 않습니다.</p>
                  <a href={viewingFile.url} download={viewingFile.name} className={styles.primaryBtn}>
                    <Download size={16} /> 원본 다운로드
                  </a>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <a href={viewingFile.url} download={viewingFile.name} className={styles.outlineBtn}>
                <Download size={15} /> 원본 다운로드
              </a>
              <button
                type="button"
                className={styles.modalSubmitBtn}
                onClick={() => setViewingFile(null)}
              >
                확인 및 닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 휴가 등록 모달 오버레이 */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            <div className={styles.modalHeader}>
              <div className={styles.headerLeft}>
                <div className={styles.modalIconBox}>
                  <Calendar size={24} color="#ffffff" />
                </div>
                <div>
                  <h2>휴가 등록</h2>
                  <p>신규 휴가 신청을 등록하고 파일을 첨부합니다</p>
                </div>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formSection}>
                <h4 className={styles.sectionTitle}>
                  <span className={styles.barAccent}>▍</span> 직원 정보
                </h4>
                <div className={styles.dropdownWrapper}>
                  <div
                    className={styles.fakeSelectBox}
                    onClick={() => {
                      setIsEmpSelectOpen(!isEmpSelectOpen);
                      setIsProxySelectOpen(false);
                      setIsApproverSelectOpen(false);
                    }}
                  >
                    <div className={styles.selectedEmp}>
                      <span className={`${styles.avatarBadge} ${styles[selectedEmp.tone || "blue"]}`}>
                        {selectedEmp.initial}
                      </span>
                      <strong>
                        {selectedEmp.name} · {selectedEmp.dept} · {selectedEmp.pos}
                      </strong>
                    </div>
                    <ChevronDown size={18} color="#6b7280" />
                  </div>

                  {isEmpSelectOpen && (
                    <div className={styles.dropdownMenu}>
                      {empList.map((e) => (
                        <div
                          key={e.id}
                          className={styles.dropdownItem}
                          onClick={() => {
                            setSelectedEmp(e);
                            setIsEmpSelectOpen(false);
                          }}
                        >
                          <span className={`${styles.avatarSmall} ${styles[e.tone || "blue"]}`}>
                            {e.initial}
                          </span>
                          <span>
                            {e.name} ({e.dept} · {e.pos})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.infoBannerGreen}>
                  <Clock size={16} color="#059669" />
                  <span>
                    잔여 연차 <strong className={styles.highlightGreen}>{quotaInfo.remainingDays}일</strong>
                    &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                    사용 연차 <strong>{quotaInfo.usedDays}일</strong>
                    &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                    부여 연차 <strong>{quotaInfo.totalDays}일</strong>
                  </span>
                </div>
              </div>

              <div className={styles.formSection}>
                <h4 className={styles.sectionTitle}>
                  <span className={styles.barAccent}>▍</span> 휴가 유형
                </h4>
                <div className={styles.pillSelector}>
                  {[
                    { label: "연차", dot: styles.dotAnnual, val: "연차" },
                    { label: "반차(오전)", dot: styles.dotHalf, val: "반차(오전)" },
                    { label: "반차(오후)", dot: styles.dotHalf, val: "반차(오후)" },
                    { label: "병가", dot: styles.dotSick, val: "병가" },
                    { label: "기타", dot: styles.dotOther, val: "기타" },
                  ].map((item) => {
                    const isSelected = modalLeaveType === item.val;
                    return (
                      <button
                        key={item.val}
                        type="button"
                        className={`${styles.typePillBtn} ${isSelected ? styles.pillSelected : ""}`}
                        onClick={() => setModalLeaveType(item.val as any)}
                      >
                        <span className={`${styles.pillDot} ${item.dot}`} />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.formSection}>
                <h4 className={styles.sectionTitle}>
                  <span className={styles.barAccent}>▍</span> 휴가 기간
                </h4>
                <div className={styles.dateRangeRow}>
                  <div className={styles.dateInputBox}>
                    <Calendar size={16} color="#6b7280" />
                    <input
                      type="date"
                      value={startDate.replaceAll(".", "-")}
                      onChange={(e) => setStartDate(e.target.value.replaceAll("-", "."))}
                    />
                  </div>
                  <span className={styles.dateArrow}>→</span>
                  <div className={styles.dateInputBox}>
                    <Calendar size={16} color="#6b7280" />
                    <input
                      type="date"
                      value={endDate.replaceAll(".", "-")}
                      onChange={(e) => setEndDate(e.target.value.replaceAll("-", "."))}
                    />
                  </div>
                </div>
                <div className={styles.infoBannerTeal}>
                  <Clock size={16} color="#059669" />
                  <span>
                    총 <strong className={styles.highlightGreen}>{calculatedDays}일</strong> 사용 예정 (영업일 기준) · 신청 후 잔여{" "}
                    <strong className={styles.highlightGreen}>{afterRemainDays}일</strong>
                  </span>
                </div>
              </div>

              <div className={styles.formGridTwo}>
                <div className={styles.formSection}>
                  <h4 className={styles.sectionTitle}>
                    <span className={styles.barAccent}>▍</span> 업무 대리인
                  </h4>
                  <div className={styles.dropdownWrapper}>
                    <div
                      className={styles.fakeSelectBox}
                      onClick={() => {
                        setIsProxySelectOpen(!isProxySelectOpen);
                        setIsEmpSelectOpen(false);
                        setIsApproverSelectOpen(false);
                      }}
                    >
                      <div className={styles.selectPlaceholder}>
                        <User size={16} color="#475569" />
                        <span className={proxyName ? styles.selectedText : ""}>
                          {proxyName || "대리인 선택"}
                        </span>
                      </div>
                      <ChevronDown size={16} color="#9ca3af" />
                    </div>

                    {isProxySelectOpen && (
                      <div className={styles.dropdownMenu}>
                        <div
                          className={styles.dropdownItem}
                          onClick={() => {
                            setProxyName("—");
                            setIsProxySelectOpen(false);
                          }}
                        >
                          <span>— (대리인 없음)</span>
                        </div>
                        {empList
                          .filter((e) => e.id !== selectedEmp.id)
                          .map((e) => (
                            <div
                              key={e.id}
                              className={styles.dropdownItem}
                              onClick={() => {
                                setProxyName(`${e.name} (${e.pos})`);
                                setIsProxySelectOpen(false);
                              }}
                            >
                              <span className={`${styles.avatarSmall} ${styles[e.tone]}`}>
                                {e.initial}
                              </span>
                              <span>
                                {e.name} ({e.dept} · {e.pos})
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h4 className={styles.sectionTitle}>
                    <span className={styles.barAccent}>▍</span> 승인자
                  </h4>
                  <div className={styles.dropdownWrapper}>
                    <div
                      className={styles.fakeSelectBox}
                      onClick={() => {
                        setIsApproverSelectOpen(!isApproverSelectOpen);
                        setIsEmpSelectOpen(false);
                        setIsProxySelectOpen(false);
                      }}
                    >
                      <div className={styles.selectedEmp}>
                        <span className={`${styles.avatarBadge} ${styles.blue}`}>
                          {approverName.substring(0, 1)}
                        </span>
                        <strong>{approverName}</strong>
                      </div>
                      <ChevronDown size={16} color="#6b7280" />
                    </div>

                    {isApproverSelectOpen && (
                      <div className={styles.dropdownMenu}>
                        {availableApprovers.map((mgr) => (
                          <div
                            key={mgr.id}
                            className={styles.dropdownItem}
                            onClick={() => {
                              setApproverName(`${mgr.name} (${mgr.dept} · ${mgr.pos})`);
                              setIsApproverSelectOpen(false);
                            }}
                          >
                            <span className={`${styles.avatarSmall} ${styles[mgr.tone]}`}>
                              {mgr.initial}
                            </span>
                            <span>{mgr.name} ({mgr.dept} · {mgr.pos})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <h4 className={styles.sectionTitle}>
                  <span className={styles.barAccent}>▍</span> 첨부파일{" "}
                  <small className={styles.optionalText}>
                    (선택 · 병가의 경우 진단서 첨부 필수)
                  </small>
                </h4>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                />

                <div
                  className={`${styles.fileDropZone} ${attachedFile ? styles.fileAttachedZone : ""}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => !attachedFile && fileInputRef.current?.click()}
                >
                  {attachedFile ? (
                    <div className={styles.attachedFileInfo}>
                      <FileIcon size={18} color="#059669" />
                      <span className={styles.fileName}>{attachedFile.name}</span>
                      <span className={styles.fileSize}>
                        ({Math.round(attachedFile.size / 1024)} KB)
                      </span>
                    </div>
                  ) : (
                    <div className={styles.fileHint}>
                      <Paperclip size={16} color="#94a3b8" />
                      <span>파일을 클릭하거나 컴퓨터 폴더에서 드래그하여 첨부하세요</span>
                    </div>
                  )}

                  {attachedFile ? (
                    <button
                      type="button"
                      className={styles.fileRemoveBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setAttachedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      <Trash2 size={15} />
                      삭제
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.fileSelectBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      파일 선택
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => setIsModalOpen(false)}
              >
                취소
              </button>
              <button
                type="button"
                className={styles.modalSubmitBtn}
                onClick={handleModalSubmit}
              >
                <Check size={18} strokeWidth={2.5} />
                휴가 등록
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
