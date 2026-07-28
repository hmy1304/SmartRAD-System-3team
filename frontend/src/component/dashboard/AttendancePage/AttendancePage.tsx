"use client";

import { useState, useMemo } from "react";
import styles from "./AttendancePage.module.scss";

type Status = "정상" | "지각" | "결근" | "조기퇴근";

interface AttendanceRow {
  id: string;
  name: string;
  initial: string;
  position: string;
  department: string;
  tone: "blue" | "green" | "red" | "purple" | "orange";
  checkIn: string | null;
  checkOut: string | null;
  workTime: string | null;
  status: Status;
  note: string;
  isCorrected?: boolean;
}

interface TimelineItemData {
  date: string;
  dayOfWeek: string;
  checkIn: string;
  checkOut: string;
  hours: string;
  status: Status;
  note: string;
  isCorrected?: boolean;
}

const INITIAL_MOCK: AttendanceRow[] = [
  {
    id: "1",
    name: "박서준",
    initial: "박",
    position: "부장",
    department: "영상의학과",
    tone: "blue",
    checkIn: "08:52",
    checkOut: "18:01",
    workTime: "9h 09m",
    status: "정상",
    note: "정상 퇴근",
  },
  {
    id: "2",
    name: "오하윤",
    initial: "오",
    position: "과장",
    department: "영상의학과",
    tone: "green",
    checkIn: "09:23",
    checkOut: "퇴근 전",
    workTime: "6h 42m",
    status: "지각",
    note: "23분 지각 · 사유 확인 필요",
  },
  {
    id: "3",
    name: "최지은",
    initial: "최",
    position: "과장",
    department: "인사총무팀",
    tone: "red",
    checkIn: null,
    checkOut: null,
    workTime: null,
    status: "결근",
    note: "무단 결근 · 사유서 대기",
  },
  {
    id: "4",
    name: "이다영",
    initial: "이",
    position: "주임간호사",
    department: "간호부",
    tone: "purple",
    checkIn: "07:01",
    checkOut: "15:12",
    workTime: "8h 11m",
    status: "정상",
    note: "D-Shift (Day 07~15) 정상 종료",
  },
  {
    id: "5",
    name: "정유진",
    initial: "정",
    position: "인턴",
    department: "응급의학과",
    tone: "orange",
    checkIn: "08:59",
    checkOut: "15:30",
    workTime: "6h 31m",
    status: "조기퇴근",
    note: "1.5h 조기 퇴근 · 응급실장 결재 승인",
  },
  {
    id: "6",
    name: "김수진",
    initial: "김",
    position: "수간호사",
    department: "중환자실",
    tone: "blue",
    checkIn: "06:45",
    checkOut: "15:20",
    workTime: "8h 35m",
    status: "정상",
    note: "D-Shift (Day) 완료",
  },
  {
    id: "7",
    name: "강재현",
    initial: "강",
    position: "전임의",
    department: "응급의학과",
    tone: "green",
    checkIn: "09:15",
    checkOut: "퇴근 전",
    workTime: "5h 15m",
    status: "지각",
    note: "15분 지각 (아침 응급콜 투입 소약)",
  },
];

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRow[]>(INITIAL_MOCK);
  
  // Filter & Selection States
  const [activeTab, setActiveTab] = useState<"all" | "anomalies" | "normal">("all");
  const [selectedDept, setSelectedDept] = useState<string>("전체 부서");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<AttendanceRow | null>(null);
  
  // Timeline Modal State (Item #3)
  const [selectedUserForTimeline, setSelectedUserForTimeline] = useState<AttendanceRow | null>(null);

  // Add Form State
  const [addForm, setAddForm] = useState({
    name: "",
    position: "간호사",
    department: "간호부",
    checkIn: "08:50",
    checkOut: "18:00",
    status: "정상" as Status,
    reason: "카드 단말기 불인식 누락 등록",
  });

  // Edit Form State
  const [editForm, setEditForm] = useState({
    checkIn: "",
    checkOut: "",
    status: "정상" as Status,
    reason: "",
  });

  // Filter Logic
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (activeTab === "anomalies" && r.status === "정상") return false;
      if (activeTab === "normal" && r.status !== "정상") return false;
      if (selectedDept !== "전체 부서" && r.department !== selectedDept) return false;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesDept = r.department.toLowerCase().includes(q);
        const matchesNote = r.note.toLowerCase().includes(q);
        if (!matchesName && !matchesDept && !matchesNote) return false;
      }
      return true;
    });
  }, [records, activeTab, selectedDept, searchQuery]);

  // Statistics
  const totalCount = records.length;
  const normalCount = records.filter((r) => r.status === "정상").length;
  const lateCount = records.filter((r) => r.status === "지각").length;
  const absentCount = records.filter((r) => r.status === "결근").length;
  const earlyCount = records.filter((r) => r.status === "조기퇴근").length;
  const normalRate = totalCount > 0 ? ((normalCount / totalCount) * 100).toFixed(1) : "0.0";

  // Selection Actions (Item #3)
  const isAllSelected = filteredRecords.length > 0 && filteredRecords.every((r) => selectedIds.includes(r.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecords.map((r) => r.id));
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBatchNormalize = () => {
    const reason = prompt("선택한 직원들을 일괄 '정상 출근'으로 감면 처리합니다.\n감사 대비를 위해 공통 정정 사유를 기입해주세요:", "정문 단말기 일시적 통신 오류로 인한 일괄 감면 처리");
    if (!reason) return;

    setRecords((prev) =>
      prev.map((r) => {
        if (selectedIds.includes(r.id)) {
          return {
            ...r,
            checkIn: r.checkIn || "08:50",
            status: "정상" as Status,
            note: `[일괄정정] ${reason}`,
            isCorrected: true,
          };
        }
        return r;
      })
    );
    alert(`총 ${selectedIds.length}명 직원의 근태가 정상 처리 및 정정 사유 저장되었습니다.`);
    setSelectedIds([]);
  };

  const handleBatchDelete = () => {
    if (confirm(`선택하신 ${selectedIds.length}개의 출퇴근 기록을 일괄 삭제하시겠습니까?\n오진입 태깅 및 불필요 로그에 한해 실행합니다.`)) {
      setRecords((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
      setSelectedIds([]);
    }
  };

  // Mock Timeline generator for clicked user (Item #3)
  const mockUserTimeline: TimelineItemData[] = useMemo(() => {
    if (!selectedUserForTimeline) return [];
    const base: TimelineItemData[] = [
      {
        date: "2026.07.11",
        dayOfWeek: "금",
        checkIn: selectedUserForTimeline.checkIn ?? "미출근",
        checkOut: selectedUserForTimeline.checkOut ?? "-",
        hours: selectedUserForTimeline.workTime ?? "-",
        status: selectedUserForTimeline.status,
        note: selectedUserForTimeline.note,
        isCorrected: selectedUserForTimeline.isCorrected,
      },
      {
        date: "2026.07.10",
        dayOfWeek: "목",
        checkIn: "08:48",
        checkOut: "18:02",
        hours: "9h 14m",
        status: "정상",
        note: "정상 출퇴근",
      },
      {
        date: "2026.07.09",
        dayOfWeek: "수",
        checkIn: "08:55",
        checkOut: "18:30",
        hours: "9h 35m",
        status: "정상",
        note: "초과 근로 30분",
      },
      {
        date: "2026.07.08",
        dayOfWeek: "화",
        checkIn: "09:12",
        checkOut: "18:00",
        hours: "8h 48m",
        status: "지각",
        note: "[관리자정정] 응급실 지원 파견으로 시간 소급 처리",
        isCorrected: true,
      },
      {
        date: "2026.07.07",
        dayOfWeek: "월",
        checkIn: "08:50",
        checkOut: "18:05",
        hours: "9h 15m",
        status: "정상",
        note: "정상 출퇴근",
      },
    ];
    return base;
  }, [selectedUserForTimeline]);

  // Modal Actions
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name) {
      alert("직원 이름을 입력해 주세요.");
      return;
    }
    const newId = Date.now().toString();
    const initial = addForm.name.slice(0, 1) || "신";
    const newRow: AttendanceRow = {
      id: newId,
      name: addForm.name,
      initial,
      position: addForm.position,
      department: addForm.department,
      tone: "blue",
      checkIn: addForm.checkIn || null,
      checkOut: addForm.checkOut || null,
      workTime: addForm.checkIn && addForm.checkOut ? "8h 00m (수동계산)" : null,
      status: addForm.status,
      note: `[수동등록] ${addForm.reason}`,
      isCorrected: true,
    };
    setRecords([newRow, ...records]);
    setIsAddModalOpen(false);
    alert(`${addForm.name} 직원의 출퇴근 기록이 성공적으로 수동 등록되었습니다.`);
  };

  const openEditModal = (row: AttendanceRow) => {
    setEditingRow(row);
    setEditForm({
      checkIn: row.checkIn || "",
      checkOut: row.checkOut === "퇴근 전" ? "" : row.checkOut || "",
      status: row.status,
      reason: "",
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;
    if (!editForm.reason.trim()) {
      alert("감사(Audit) 대비를 위해 정정 사유를 반드시 입력해야 합니다.");
      return;
    }

    const updated = records.map((r) => {
      if (r.id === editingRow.id) {
        const checkOutVal = editForm.checkOut || (editForm.checkIn ? "퇴근 전" : null);
        return {
          ...r,
          checkIn: editForm.checkIn || null,
          checkOut: checkOutVal,
          workTime: editForm.checkIn && editForm.checkOut ? "정정됨" : r.workTime,
          status: editForm.status,
          note: `[관리자정정] ${editForm.reason}`,
          isCorrected: true,
        };
      }
      return r;
    });

    setRecords(updated);
    setIsEditModalOpen(false);
    setEditingRow(null);
    alert(`[${editingRow.name}] 사원의 근태 시각 및 상태 정정이 완료되었습니다.`);
  };

  const handleDelete = (row: AttendanceRow) => {
    if (confirm(`[${row.name}] 직원의 출퇴근 기록을 삭제하시겠습니까?\n이 작업은 중복 태깅이나 잘못된 출입 인식에 한해 진행해야 합니다.`)) {
      setRecords(records.filter((r) => r.id !== row.id));
      setSelectedIds(selectedIds.filter((item) => item !== row.id));
    }
  };

  const handleExportCSV = () => {
    const headers = ["직원명,직급,부서,출근시각,퇴근시각,근무시간,상태,비고"];
    const rows = filteredRecords.map(r => 
      `"${r.name}","${r.position}","${r.department}","${r.checkIn ?? '미출근'}","${r.checkOut ?? '-'}","${r.workTime ?? '-'}","${r.status}","${r.note}"`
    );
    const csvContent = "\uFEFF" + [...headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `근태관리대장_20260711.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className={styles.main}>
      {/* 페이지 헤더 & 액션 */}
      <div className={styles.pageHeader}>
        <div>
          <h1>출퇴근 관제 및 정정 (관리자 전용)</h1>
          <p>전사 직원의 일일 출퇴근 로그를 실시간 관제하고, 통신 오류나 단말기 누락 시 일괄 및 수동 정정합니다.</p>
        </div>
        <div className={styles.pageActions}>
          <div className={styles.dateSelect}>
            <span>📅</span>
            <span>2026.07.11 (금)</span>
          </div>
          <button type="button" className={styles.primaryBtn} onClick={() => setIsAddModalOpen(true)}>
            <span>➕</span>
            <span>수동 근태 등록</span>
          </button>
          <button type="button" className={styles.exportBtn} onClick={handleExportCSV}>
            <span>📥</span>
            <span>엑셀(CSV) 추출</span>
          </button>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryTop}>
            <label>전체 출근 대상</label>
            <span className={styles.iconBlue}>👥</span>
          </div>
          <p className={styles.summaryValue}>
            {totalCount}<span>명</span>
          </p>
          <span className={styles.summarySub}>● 3교대 & 일반 행정 포함</span>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryTop}>
            <label>정상 근무</label>
            <span className={styles.iconGreen}>✓</span>
          </div>
          <p className={styles.summaryValue}>
            {normalCount}<span>명</span>
          </p>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${Math.min(100, parseFloat(normalRate))}%` }}
            />
          </div>
          <span className={styles.summarySub}>{normalRate}% 정상 출근율</span>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryTop}>
            <label>지각</label>
            <span className={styles.iconOrange}>⏱</span>
          </div>
          <p className={`${styles.summaryValue} ${styles.textOrange}`}>
            {lateCount}<span>명</span>
          </p>
          <span className={styles.summarySubWarn}>사유 및 정정 검토 필요</span>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryTop}>
            <label>미출근 / 결근</label>
            <span className={styles.iconRed}>○</span>
          </div>
          <p className={`${styles.summaryValue} ${styles.textRed}`}>
            {absentCount}<span>명</span>
          </p>
          <span className={styles.summarySubDanger}>무단 결근 / 사유서 체크</span>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryTop}>
            <label>조기 퇴근</label>
            <span className={styles.iconPurple}>↩</span>
          </div>
          <p className={`${styles.summaryValue} ${styles.textPurple}`}>
            {earlyCount}<span>명</span>
          </p>
          <span className={styles.summarySub}>결재 문서 대조 진행</span>
        </div>
      </div>

      {/* 탭 및 필터 컨트롤 바 */}
      <div className={styles.filterBar}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "all" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("all")}
          >
            📋 전체 기록 ({totalCount})
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "anomalies" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("anomalies")}
            style={{ color: activeTab === "anomalies" ? "#dc2626" : "#e14d55" }}
          >
            🚨 근태 이상자 모아보기 ({lateCount + absentCount + earlyCount})
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "normal" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("normal")}
          >
            ✅ 정상 출퇴근 ({normalCount})
          </button>
        </div>

        <div className={styles.filterControls}>
          <select
            className={styles.deptSelect}
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="전체 부서">전체 부서</option>
            <option value="영상의학과">영상의학과</option>
            <option value="간호부">간호부</option>
            <option value="중환자실">중환자실</option>
            <option value="응급의학과">응급의학과</option>
            <option value="인사총무팀">인사총무팀</option>
            <option value="관리팀">관리팀</option>
          </select>

          <div className={styles.searchInput}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="이름, 부서, 비고 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 일괄 선택 제어 바 (Item #3) */}
      {selectedIds.length > 0 && (
        <div className={styles.batchBar}>
          <div className={styles.batchInfo}>
            ☑️ 현재 <span>{selectedIds.length}명</span> 직원의 근태 기록을 선택했습니다.
          </div>
          <div className={styles.batchActions}>
            <button type="button" className={styles.batchNormalBtn} onClick={handleBatchNormalize}>
              ✨ 선택 일괄 정상 처리
            </button>
            <button type="button" className={styles.batchDeleteBtn} onClick={handleBatchDelete}>
              🗑️ 선택 일괄 삭제
            </button>
          </div>
        </div>
      )}

      {/* 테이블 */}
      <section className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.checkboxCell}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th>직원 (클릭 시 월간 뷰)</th>
              <th>부서</th>
              <th>출근 시각</th>
              <th>퇴근 시각</th>
              <th>근무 시간</th>
              <th>근태 상태</th>
              <th>비고 및 정정이력</th>
              <th style={{ width: "130px" }}>관리 액션</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "40px", color: "#8a97ad" }}>
                  조건에 일치하는 출퇴근 기록이 없습니다.
                </td>
              </tr>
            ) : (
              filteredRecords.map((row) => {
                const isSelected = selectedIds.includes(row.id);
                return (
                <tr key={row.id} style={{ backgroundColor: isSelected ? "#eff6ff" : undefined }}>
                  <td className={styles.checkboxCell}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectRow(row.id)}
                    />
                  </td>
                  <td>
                    <div className={`${styles.person} ${styles.clickablePerson}`} onClick={() => setSelectedUserForTimeline(row)}>
                      <span className={`${styles.avatar} ${styles[row.tone]}`}>
                        {row.initial}
                      </span>
                      <div>
                        <strong>{row.name} 🔍</strong>
                        <small>{row.position}</small>
                      </div>
                    </div>
                  </td>
                  <td>{row.department}</td>
                  <td>
                    {row.checkIn ? (
                      <span className={styles.timeIn}>→ {row.checkIn}</span>
                    ) : (
                      <span className={styles.timeNone}>× 미출근</span>
                    )}
                  </td>
                  <td>
                    {row.checkOut === "퇴근 전" ? (
                      <span className={styles.timePending}>⏳ 퇴근 전</span>
                    ) : row.checkOut ? (
                      <span className={styles.timeOut}>← {row.checkOut}</span>
                    ) : (
                      <span className={styles.timeDash}>—</span>
                    )}
                  </td>
                  <td>{row.workTime ?? "—"}</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        row.status === "정상"
                          ? styles.statusNormal
                          : row.status === "지각"
                            ? styles.statusLate
                            : row.status === "결근"
                              ? styles.statusAbsent
                              : styles.statusEarly
                      }`}
                    >
                      {row.status}
                    </span>
                    {row.isCorrected && <span className={styles.correctedTag}>정정됨</span>}
                  </td>
                  <td>
                    <span
                      className={
                        row.note.includes("확인") || row.note.includes("대기") || row.note.includes("결근")
                          ? styles.noteWarn
                          : styles.noteNormal
                      }
                    >
                      {row.note}
                    </span>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button type="button" className={styles.editBtn} onClick={() => openEditModal(row)}>
                        🛠️ 정정
                      </button>
                      <button type="button" className={styles.deleteBtn} onClick={() => handleDelete(row)}>
                        ❌ 삭제
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>

      {/* 모달 1: 수동 근태 기록 등록 모달 */}
      {isAddModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>➕ 수동 출퇴근 기록 등록 (누락 처리)</h2>
              <button type="button" className={styles.closeBtn} onClick={() => setIsAddModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>대상 사원 이름 <span>*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="예: 김민우"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  />
                </div>
                <div className={styles.timeRow}>
                  <div className={styles.formGroup}>
                    <label>소속 부서</label>
                    <select
                      value={addForm.department}
                      onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                    >
                      <option value="간호부">간호부</option>
                      <option value="영상의학과">영상의학과</option>
                      <option value="중환자실">중환자실</option>
                      <option value="응급의학과">응급의학과</option>
                      <option value="인사총무팀">인사총무팀</option>
                      <option value="관리팀">관리팀</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>직위/직급</label>
                    <input
                      type="text"
                      value={addForm.position}
                      onChange={(e) => setAddForm({ ...addForm, position: e.target.value })}
                    />
                  </div>
                </div>
                <div className={styles.timeRow}>
                  <div className={styles.formGroup}>
                    <label>출근 시각 (HH:mm)</label>
                    <input
                      type="text"
                      placeholder="08:50 (없을 시 빈칸)"
                      value={addForm.checkIn}
                      onChange={(e) => setAddForm({ ...addForm, checkIn: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>퇴근 시각 (HH:mm)</label>
                    <input
                      type="text"
                      placeholder="18:00 (없을 시 빈칸)"
                      value={addForm.checkOut}
                      onChange={(e) => setAddForm({ ...addForm, checkOut: e.target.value })}
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>근태 판정 상태</label>
                  <select
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value as Status })}
                  >
                    <option value="정상">정상</option>
                    <option value="지각">지각</option>
                    <option value="조기퇴근">조기퇴근</option>
                    <option value="결근">결근</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>수동 등록 사유 (감사 대비) <span>*</span></label>
                  <textarea
                    required
                    placeholder="예: 카드 단말기 통신 오류로 인한 08시 출입 기록 미연동 분 소급 기입"
                    value={addForm.reason}
                    onChange={(e) => setAddForm({ ...addForm, reason: e.target.value })}
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsAddModalOpen(false)}>
                  취소
                </button>
                <button type="submit" className={styles.saveBtn}>
                  출퇴근 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 모달 2: 근태 시각 및 상태 정정 모달 */}
      {isEditModalOpen && editingRow && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>🛠️ 근태 기록 정정 — {editingRow.name} ({editingRow.department})</h2>
              <button type="button" className={styles.closeBtn} onClick={() => setIsEditModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.timeRow}>
                  <div className={styles.formGroup}>
                    <label>출근 시각 수정 (원시각: {editingRow.checkIn ?? "미출근"})</label>
                    <input
                      type="text"
                      placeholder="예: 08:55 (미입력 시 Null)"
                      value={editForm.checkIn}
                      onChange={(e) => setEditForm({ ...editForm, checkIn: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>퇴근 시각 수정 (원시각: {editingRow.checkOut ?? "—"})</label>
                    <input
                      type="text"
                      placeholder="예: 18:00 ('퇴근 전'으로 두려면 비움)"
                      value={editForm.checkOut}
                      onChange={(e) => setEditForm({ ...editForm, checkOut: e.target.value })}
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>근태 상태 변경 (정상 / 지각 / 조기퇴근 감면)</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Status })}
                  >
                    <option value="정상">정상</option>
                    <option value="지각">지각</option>
                    <option value="조기퇴근">조기퇴근</option>
                    <option value="결근">결근</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>정정 사유 기입 (감사 및 노무 대조용 필수) <span>*</span></label>
                  <textarea
                    required
                    placeholder="예: 응급 환자 CPR 투입으로 23분 늦은 태깅 확인 ➔ 수간호사 확인 받아 정상 출근 및 시간 감면 처리"
                    value={editForm.reason}
                    onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsEditModalOpen(false)}>
                  취소
                </button>
                <button type="submit" className={styles.saveBtn}>
                  정정 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 모달 3: 사원별 월간 근태 타임라인 및 요약 뷰 (Item #3) */}
      {selectedUserForTimeline && (
        <div className={styles.modalOverlay}>
          <div className={styles.timelineModalContent}>
            <div className={styles.modalHeader}>
              <div>
                <h2>📅 {selectedUserForTimeline.name} {selectedUserForTimeline.position} — 7월 월간 근태 대장</h2>
                <span style={{ fontSize: "13px", color: "#64748b" }}>소속: {selectedUserForTimeline.department} | 노무 감사 및 급여 정산 대조 타임라인</span>
              </div>
              <button type="button" className={styles.closeBtn} onClick={() => setSelectedUserForTimeline(null)}>×</button>
            </div>

            <div className={styles.monthSummaryGrid}>
              <div className={styles.monthSummaryBox}>
                <label>월 누적 근로시간</label>
                <strong>178h 30m <span>(+18.5h 연장)</span></strong>
              </div>
              <div className={styles.monthSummaryBox}>
                <label>정상 출현 횟수</label>
                <strong style={{ color: "#0f9f6e" }}>20일 <span>(95.2%)</span></strong>
              </div>
              <div className={styles.monthSummaryBox}>
                <label>지각 및 조퇴</label>
                <strong style={{ color: selectedUserForTimeline.status === "지각" ? "#ea580c" : "#0f172a" }}>
                  {selectedUserForTimeline.status === "지각" || selectedUserForTimeline.status === "조기퇴근" ? "1회" : "0회"} <span>(검토요망)</span>
                </strong>
              </div>
              <div className={styles.monthSummaryBox}>
                <label>관리자 정정 이력</label>
                <strong style={{ color: "#2563eb" }}>{selectedUserForTimeline.isCorrected ? "1건" : "2건"} <span>(사유보관)</span></strong>
              </div>
            </div>

            <div className={styles.timelineBody}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 4px", color: "#334155" }}>📆 일별 출퇴근 타임라인 (최신순)</h3>
              {mockUserTimeline.map((t, idx) => (
                <div key={idx} className={styles.timelineItem}>
                  <div className={styles.timelineDate}>
                    <strong>{t.date}</strong>
                    <small>({t.dayOfWeek})</small>
                  </div>
                  <div className={styles.timelineTimes}>
                    <span>{t.checkIn}</span>
                    <span className={styles.arrow}>➔</span>
                    <span>{t.checkOut}</span>
                  </div>
                  <div className={styles.timelineDesc}>
                    <div className={styles.mainStatus}>
                      <span
                        className={`${styles.statusBadge} ${
                          t.status === "정상"
                            ? styles.statusNormal
                            : t.status === "지각"
                              ? styles.statusLate
                              : t.status === "결근"
                                ? styles.statusAbsent
                                : styles.statusEarly
                        }`}
                      >
                        {t.status}
                      </span>
                      {t.isCorrected && <span className={styles.correctedTag}>✨ 관리자정정됨</span>}
                    </div>
                    <span className={styles.noteText}>{t.note}</span>
                  </div>
                  <div className={styles.timelineHours}>
                    {t.hours}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.saveBtn}
                onClick={() => {
                  alert(`${selectedUserForTimeline.name} 사원의 월간 근태 리포트를 정산 팀에 전송했습니다.`);
                  setSelectedUserForTimeline(null);
                }}
              >
                📥 개인 월간 대장 출력
              </button>
              <button type="button" className={styles.cancelBtn} onClick={() => setSelectedUserForTimeline(null)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
