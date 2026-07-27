"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  AlertTriangle,
  FileText,
  PieChart,
  Info,
  X,
  ChevronDown,
  Download,
  Plus,
  Check,
  Search,
  User,
  Paperclip,
  AlertCircle,
} from "lucide-react";
import styles from "./LeavePage.module.scss";

type LeaveType = "연차" | "반차 (오전)" | "반차 (오후)" | "병가";
type LeaveStatus = "승인대기" | "승인완료" | "반려";

interface LeaveRow {
  id: string;
  name: string;
  initial: string;
  position: string;
  department: string;
  tone: "blue" | "cyan" | "green" | "purple" | "red" | "orange" | "amber";
  type: LeaveType;
  applyDate: string;
  period: string;
  days: string;
  remainText: string;
  remainType: "normal" | "doc" | "danger";
  proxy: string;
  approver: string;
  status: LeaveStatus;
  note: string;
}

const MOCK: LeaveRow[] = [
  {
    id: "1",
    name: "박시준",
    initial: "박",
    position: "영상의학과 · 부장",
    department: "영상의학과",
    tone: "blue",
    type: "연차",
    applyDate: "07.08",
    period: "07.14 ~ 07.15",
    days: "2일",
    remainText: "13일 → 11일",
    remainType: "normal",
    proxy: "오하늘 과장",
    approver: "김관리",
    status: "승인완료",
    note: "—",
  },
  {
    id: "2",
    name: "이다영",
    initial: "이",
    position: "간호부 · 수간호사",
    department: "간호부",
    tone: "cyan",
    type: "반차 (오후)",
    applyDate: "07.11",
    period: "07.15 (화) 오후",
    days: "0.5일",
    remainText: "6일 → 5.5일",
    remainType: "normal",
    proxy: "최지은 과장",
    approver: "김관리",
    status: "승인대기",
    note: "",
  },
  {
    id: "3",
    name: "김민서",
    initial: "김",
    position: "진단검사의학과 · 사원",
    department: "진단검사의학과",
    tone: "green",
    type: "연차",
    applyDate: "07.10",
    period: "07.21 ~ 07.25",
    days: "5일",
    remainText: "9일 → 4일",
    remainType: "normal",
    proxy: "박시준 부장",
    approver: "김관리",
    status: "승인대기",
    note: "",
  },
  {
    id: "4",
    name: "신유나",
    initial: "신",
    position: "영상의학과 · 대리",
    department: "영상의학과",
    tone: "purple",
    type: "병가",
    applyDate: "07.09",
    period: "07.16 ~ 07.18",
    days: "3일",
    remainText: "진단서 첨부",
    remainType: "doc",
    proxy: "오하늘 과장",
    approver: "김관리",
    status: "승인완료",
    note: "진단서 확인 완료",
  },
  {
    id: "5",
    name: "최지은",
    initial: "최",
    position: "인사총무팀 · 과장",
    department: "인사총무팀",
    tone: "red",
    type: "연차",
    applyDate: "07.11",
    period: "07.12 ~ 07.13",
    days: "2일",
    remainText: "1일 → -1일!",
    remainType: "danger",
    proxy: "박시준 부장",
    approver: "—",
    status: "반려",
    note: "연차 초과",
  },
  {
    id: "6",
    name: "정우진",
    initial: "정",
    position: "응급의학과 · 인턴",
    department: "응급의학과",
    tone: "orange",
    type: "반차 (오전)",
    applyDate: "07.11",
    period: "07.12 (토) 오전",
    days: "0.5일",
    remainText: "3일 → 2.5일",
    remainType: "normal",
    proxy: "—",
    approver: "김관리",
    status: "승인완료",
    note: "—",
  },
  {
    id: "7",
    name: "배준혁",
    initial: "배",
    position: "원무과 · 주임",
    department: "원무과",
    tone: "amber",
    type: "연차",
    applyDate: "07.11",
    period: "07.28 ~ 07.30",
    days: "3일",
    remainText: "8일 → 5일",
    remainType: "normal",
    proxy: "—",
    approver: "김관리",
    status: "승인대기",
    note: "",
  },
];

const FILTERS = ["전체", "승인대기", "승인완료", "반려"] as const;

export default function LeavePage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("전체");
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLeaveType, setModalLeaveType] = useState<"연차" | "반차(오전)" | "반차(오후)" | "병가" | "기타">("연차");
  const [startDate, setStartDate] = useState("2026.07.14");
  const [endDate, setEndDate] = useState("2026.07.15");

  const filtered = useMemo(() => {
    return MOCK.filter((row) => {
      const matchFilter =
        filter === "전체" ||
        (filter === "승인대기" && row.status === "승인대기") ||
        (filter === "승인완료" && row.status === "승인완료") ||
        (filter === "반려" && row.status === "반려");
      const matchKeyword =
        !keyword ||
        row.name.includes(keyword) ||
        row.department.includes(keyword);
      return matchFilter && matchKeyword;
    });
  }, [filter, keyword]);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map((r) => r.id));
  };

  const handleModalSubmit = () => {
    alert("신규 휴가 신청이 성공적으로 등록되었습니다.");
    setIsModalOpen(false);
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
          <div className={styles.selectWrapper}>
            <Calendar size={15} color="#475569" className={styles.selectIcon} />
            <select className={styles.selectWithIcon} defaultValue="2026년">
              <option>2026년</option>
              <option>2025년</option>
            </select>
            <ChevronDown size={14} className={styles.arrowIcon} />
          </div>
          <div className={styles.selectWrapper}>
            <select className={styles.select} defaultValue="7월">
              <option>7월</option>
              <option>6월</option>
            </select>
            <ChevronDown size={14} className={styles.arrowIcon} />
          </div>
          <div className={styles.selectWrapper}>
            <select className={styles.select} defaultValue="전체 부서">
              <option>전체 부서</option>
              <option>영상의학과</option>
              <option>간호부</option>
              <option>진단검사의학과</option>
              <option>인사총무팀</option>
              <option>응급의학과</option>
              <option>원무과</option>
            </select>
            <ChevronDown size={14} className={styles.arrowIcon} />
          </div>
          <button type="button" className={styles.outlineBtn}>
            <Download size={15} />
            내보내기
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} strokeWidth={2.5} />
            휴가 등록
          </button>
        </div>
      </div>

      {/* 요약 KPI 카드 (5개) */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryTop}>
            <label>전체 부여 연차</label>
            <span className={styles.iconBadgeGreen}>
              <FileText size={18} />
            </span>
          </div>
          <p className={styles.kpiValue}>
            26,208<span>일</span>
          </p>
          <small className={styles.tagGreen}>● 1인 평균 15일</small>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryTop}>
            <label>사용 연차</label>
            <span className={styles.iconBadgeBlue}>
              <Calendar size={18} />
            </span>
          </div>
          <p className={styles.kpiValue}>
            8,736<span>일</span>
          </p>
          <div className={styles.progressRow}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: "33.3%" }} />
            </div>
            <span className={styles.progressText}>33.3%</span>
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
            17,472<span>일</span>
          </p>
          <small className={styles.tagGreen}>● 1인 평균 8일 잔여</small>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryTop}>
            <label>이번달 신청</label>
            <span className={styles.iconBadgeOrange}>
              <Clock size={18} />
            </span>
          </div>
          <p className={styles.kpiValue}>
            247<span>건</span>
          </p>
          <small className={styles.tagOrange}>● 승인대기 12건</small>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryTop}>
            <label>연차 소진 경고</label>
            <span className={styles.iconBadgeRed}>
              <AlertTriangle size={18} />
            </span>
          </div>
          <p className={`${styles.kpiValue} ${styles.textRed}`}>
            38<span>명</span>
          </p>
          <small className={styles.tagRed}>● 잔여 2일 이하</small>
        </div>
      </div>

      {/* 본문 (테이블 + 우측 위젯) */}
      <div className={styles.contentGrid}>
        {/* 좌측 테이블 섹션 */}
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
                    {f === "승인대기" && <span className={styles.countBadge}>12</span>}
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
                <select className={styles.filterSelect}>
                  <option>≡ 유형 전체</option>
                  <option>연차</option>
                  <option>반차</option>
                  <option>병가</option>
                </select>
                <ChevronDown size={14} className={styles.arrowIcon} />
              </div>
              <button
                type="button"
                className={styles.bulkApproveBtn}
                onClick={() => alert("선택된 항목을 일괄 승인했습니다.")}
              >
                <Check size={16} />
                선택 일괄 승인
              </button>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.thCheck}>
                    <input
                      type="checkbox"
                      checked={selected.length === filtered.length && filtered.length > 0}
                      onChange={toggleAll}
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
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const isChecked = selected.includes(row.id);
                  let typeBadgeClass = styles.typeAnnual;
                  if (row.type.includes("반차")) typeBadgeClass = styles.typeHalf;
                  else if (row.type.includes("병가")) typeBadgeClass = styles.typeSick;
                  else if (row.type.includes("기타")) typeBadgeClass = styles.typeOther;

                  return (
                    <tr key={row.id} className={isChecked ? styles.rowChecked : ""}>
                      <td className={styles.tdCheck}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(row.id)}
                        />
                      </td>
                      <td>
                        <div className={styles.empCell}>
                          <span className={`${styles.avatarBadge} ${styles[row.tone]}`}>
                            {row.initial}
                          </span>
                          <span className={styles.empName}>{row.name}</span>
                          <span className={styles.empPos}>· {row.position.split("· ")[1] || row.position}</span>
                        </div>
                      </td>
                      <td className={styles.deptCell}>{row.department}</td>
                      <td>
                        <span className={`${styles.typeBadge} ${typeBadgeClass}`}>
                          <span className={styles.dot} />
                          {row.type}
                        </span>
                      </td>
                      <td className={styles.dateCell}>{row.applyDate}</td>
                      <td className={styles.periodCell}>{row.period}</td>
                      <td className={styles.daysCell}>{row.days}</td>
                      <td>
                        <span className={`${styles.remainPill} ${styles[row.remainType]}`}>
                          {row.remainText}
                        </span>
                      </td>
                      <td className={styles.proxyCell}>{row.proxy}</td>
                      <td>
                        {row.approver !== "—" ? (
                          <div className={styles.approverCell}>
                            <span className={`${styles.avatarSmall} ${styles.blue}`}>김</span>
                            <span>{row.approver}</span>
                          </div>
                        ) : (
                          <span className={styles.dash}>—</span>
                        )}
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
          {/* 위젯 1: 유형별 신청 현황 */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <span className={styles.panelIconGreen}>
                <PieChart size={17} />
              </span>
              <h3>유형별 신청 현황</h3>
            </div>
            <div className={styles.typeStatList}>
              <div className={styles.statItem}>
                <div className={styles.statInfo}>
                  <span className={`${styles.statDot} ${styles.dotAnnual}`} />
                  <span className={styles.statLabel}>연차</span>
                  <strong className={styles.statCount}>189건</strong>
                </div>
                <div className={styles.statBarWrapper}>
                  <div className={styles.statBar}>
                    <div className={styles.statFillAnnual} style={{ width: "76.5%" }} />
                  </div>
                  <span className={styles.statPercentGreen}>76.5%</span>
                </div>
              </div>

              <div className={styles.statItem}>
                <div className={styles.statInfo}>
                  <span className={`${styles.statDot} ${styles.dotHalf}`} />
                  <span className={styles.statLabel}>반차</span>
                  <strong className={styles.statCount}>32건</strong>
                </div>
                <div className={styles.statBarWrapper}>
                  <div className={styles.statBar}>
                    <div className={styles.statFillHalf} style={{ width: "13%" }} />
                  </div>
                  <span className={styles.statPercentBlue}>13.0%</span>
                </div>
              </div>

              <div className={styles.statItem}>
                <div className={styles.statInfo}>
                  <span className={`${styles.statDot} ${styles.dotSick}`} />
                  <span className={styles.statLabel}>병가</span>
                  <strong className={styles.statCount}>18건</strong>
                </div>
                <div className={styles.statBarWrapper}>
                  <div className={styles.statBar}>
                    <div className={styles.statFillSick} style={{ width: "7.3%" }} />
                  </div>
                  <span className={styles.statPercentPurple}>7.3%</span>
                </div>
              </div>

              <div className={styles.statItem}>
                <div className={styles.statInfo}>
                  <span className={`${styles.statDot} ${styles.dotOther}`} />
                  <span className={styles.statLabel}>기타</span>
                  <strong className={styles.statCount}>8건</strong>
                </div>
                <div className={styles.statBarWrapper}>
                  <div className={styles.statBar}>
                    <div className={styles.statFillOther} style={{ width: "3.2%" }} />
                  </div>
                  <span className={styles.statPercentOrange}>3.2%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 위젯 2: 연차 소진 위험 */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeaderRisk}>
              <div className={styles.headerTitleLeft}>
                <span className={styles.panelIconRed}>
                  <AlertTriangle size={17} color="#dc2626" />
                </span>
                <h3>연차 소진 위험</h3>
              </div>
              <span className={styles.riskCountBadge}>38명</span>
            </div>

            <div className={styles.alertBanner}>
              <AlertCircle size={15} color="#dc2626" className={styles.alertIcon} />
              <span>잔여 연차 2일 이하인 직원입니다.</span>
            </div>

            <div className={styles.riskList}>
              <div className={styles.riskItem}>
                <div className={styles.riskUser}>
                  <span className={`${styles.avatarBadge} ${styles.red}`}>최</span>
                  <div className={styles.riskText}>
                    <strong>최지은</strong>
                    <small>인사총무팀</small>
                  </div>
                </div>
                <span className={`${styles.riskDaysTag} ${styles.riskOne}`}>
                  잔여 1일
                </span>
              </div>

              <div className={styles.riskItem}>
                <div className={styles.riskUser}>
                  <span className={`${styles.avatarBadge} ${styles.orange}`}>배</span>
                  <div className={styles.riskText}>
                    <strong>배준혁</strong>
                    <small>원무과</small>
                  </div>
                </div>
                <span className={`${styles.riskDaysTag} ${styles.riskTwo}`}>
                  잔여 2일
                </span>
              </div>

              <div className={styles.riskItem}>
                <div className={styles.riskUser}>
                  <span className={`${styles.avatarBadge} ${styles.orange}`}>정</span>
                  <div className={styles.riskText}>
                    <strong>정우진</strong>
                    <small>응급의학과</small>
                  </div>
                </div>
                <span className={`${styles.riskDaysTag} ${styles.riskTwo}`}>
                  잔여 2일
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* 휴가 등록 모달 오버레이 (이미지 1 완벽 재현) */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            {/* 모달 헤더 */}
            <div className={styles.modalHeader}>
              <div className={styles.headerLeft}>
                <div className={styles.modalIconBox}>
                  <Calendar size={24} color="#ffffff" />
                </div>
                <div>
                  <h2>휴가 등록</h2>
                  <p>신규 휴가 신청을 등록합니다</p>
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

            {/* 모달 본문 폼 */}
            <div className={styles.modalBody}>
              {/* 섹션 1: 직원 정보 */}
              <div className={styles.formSection}>
                <h4 className={styles.sectionTitle}>
                  <span className={styles.barAccent}>▍</span> 직원 정보
                </h4>
                <div className={styles.fakeSelectBox}>
                  <div className={styles.selectedEmp}>
                    <span className={`${styles.avatarBadge} ${styles.blue}`}>박</span>
                    <strong>박시준 · 영상의학과 · 부장</strong>
                  </div>
                  <ChevronDown size={18} color="#6b7280" />
                </div>
                <div className={styles.infoBannerGreen}>
                  <Clock size={16} color="#059669" />
                  <span>
                    잔여 연차 <strong className={styles.highlightGreen}>13일</strong>
                    &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                    사용 연차 <strong>2일</strong>
                    &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                    부여 연차 <strong>15일</strong>
                  </span>
                </div>
              </div>

              {/* 섹션 2: 휴가 유형 */}
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

              {/* 섹션 3: 휴가 기간 */}
              <div className={styles.formSection}>
                <h4 className={styles.sectionTitle}>
                  <span className={styles.barAccent}>▍</span> 휴가 기간
                </h4>
                <div className={styles.dateRangeRow}>
                  <div className={styles.dateInputBox}>
                    <Calendar size={16} color="#6b7280" />
                    <input
                      type="text"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <span className={styles.dateArrow}>→</span>
                  <div className={styles.dateInputBox}>
                    <Calendar size={16} color="#6b7280" />
                    <input
                      type="text"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.infoBannerTeal}>
                  <Clock size={16} color="#059669" />
                  <span>
                    총 <strong className={styles.highlightGreen}>2일</strong> 사용 예정 · 신청 후 잔여 <strong className={styles.highlightGreen}>11일</strong>
                  </span>
                </div>
              </div>

              {/* 섹션 4: 업무 대리인 & 승인자 (2열) */}
              <div className={styles.formGridTwo}>
                <div className={styles.formSection}>
                  <h4 className={styles.sectionTitle}>
                    <span className={styles.barAccent}>▍</span> 업무 대리인
                  </h4>
                  <div className={styles.fakeSelectBox}>
                    <div className={styles.selectPlaceholder}>
                      <User size={16} color="#9ca3af" />
                      <span>대리인 선택</span>
                    </div>
                    <ChevronDown size={16} color="#9ca3af" />
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h4 className={styles.sectionTitle}>
                    <span className={styles.barAccent}>▍</span> 승인자
                  </h4>
                  <div className={styles.fakeSelectBox}>
                    <div className={styles.selectedEmp}>
                      <span className={`${styles.avatarBadge} ${styles.blue}`}>김</span>
                      <strong>김관리 (인사팀)</strong>
                    </div>
                    <ChevronDown size={16} color="#6b7280" />
                  </div>
                </div>
              </div>

              {/* 섹션 5: 첨부파일 */}
              <div className={styles.formSection}>
                <h4 className={styles.sectionTitle}>
                  <span className={styles.barAccent}>▍</span> 첨부파일 <small className={styles.optionalText}>(선택 · 병가의 경우 진단서 첨부)</small>
                </h4>
                <div className={styles.fileDropZone}>
                  <div className={styles.fileHint}>
                    <Paperclip size={16} color="#94a3b8" />
                    <span>파일을 클릭하거나 드래그하여 첨부하세요</span>
                  </div>
                  <button type="button" className={styles.fileSelectBtn}>
                    파일 선택
                  </button>
                </div>
              </div>
            </div>

            {/* 모달 푸터 액션 버튼 */}
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
