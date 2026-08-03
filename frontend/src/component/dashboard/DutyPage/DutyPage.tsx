"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import { getDepartments, type DepartmentResponse } from "@/services/departmentService";
import styles from "./DutyPage.module.scss";

type Shift = "D" | "E" | "N" | "OFF" | "AL" | "";

interface DutyScheduleEntryResponse {
  id: number;
  employeeId: number;
  employeeName: string;
  workDate: string | number[]; // YYYY-MM-DD or [YYYY, MM, DD]
  shiftTypeCode: string;
  shiftTypeName: string;
}

interface DutyScheduleResponse {
  id: number;
  departmentId: number;
  departmentName: string;
  scheduleYear: number;
  scheduleMonth: number;
  status: string; // DRAFT, CONFIRMED
  entries: DutyScheduleEntryResponse[];
  warnings: string[];
}

interface EmployeeDuty {
  id: number;
  name: string;
  initial: string;
  position: string;
  tone: "blue" | "green" | "purple" | "orange";
  shifts: Shift[]; // 1~31일 (인덱스 0 = 1일)
  summary: { d: number; e: number; n: number; off: number; al: number };
}

export default function DutyPage() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [departmentId, setDepartmentId] = useState<number | null>(null);

  const [schedule, setSchedule] = useState<DutyScheduleResponse | null>(null);
  const [employees, setEmployees] = useState<EmployeeDuty[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [draftShifts, setDraftShifts] = useState<Record<number, Shift[]>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [hasSavedOnce, setHasSavedOnce] = useState(false);

  const { userProfile } = useAuthStore();
  const canEdit = useMemo(() => {
    const perm = userProfile?.perms?.find(p => p.menuCode === 'DUTY_SCHEDULE');
    return perm ? perm.canWrite : false;
  }, [userProfile]);
  const [message, setMessage] = useState("");

  const daysInMonth = useMemo(() => new Date(currentYear, currentMonth, 0).getDate(), [currentYear, currentMonth]);
  const DAYS = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);
  
  const WEEKDAYS = useMemo(() => {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return DAYS.map(d => {
      const date = new Date(currentYear, currentMonth - 1, d);
      return days[date.getDay()];
    });
  }, [currentYear, currentMonth, DAYS]);

  // 부서 목록 로드
  useEffect(() => {
    getDepartments()
      .then(list => {
        setDepartments(list);
        setDepartmentId(prev => prev ?? list[0]?.id ?? null);
      })
      .catch(err => console.error("부서 목록 조회 실패:", err));
  }, []);

  // 데이터 로드
  const fetchSchedule = async (isAfterSave: boolean = false) => {
    if (departmentId == null) return;
    setIsLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("accessToken") || "";
      const url = `/api/v1/duty-schedules/department/${departmentId}?year=${currentYear}&month=${currentMonth}`;
      
      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) {
        // 존재하지 않음 (400 or 404)
        setSchedule(null);
        setEmployees([]);
        setDraftShifts({});
        setHasChanges(false);
        setHasSavedOnce(false);
        setIsLoading(false);
        return;
      }
      
      const data: DutyScheduleResponse = await res.json();
      setSchedule(data);
      
      // entries를 직원별로 그룹화
      const empMap = new Map<number, EmployeeDuty>();
      
      data.entries.forEach(entry => {
        if (!empMap.has(entry.employeeId)) {
          empMap.set(entry.employeeId, {
            id: entry.employeeId,
            name: entry.employeeName,
            initial: entry.employeeName.charAt(0),
            position: "직원", // API에서 직급 정보가 오지 않으면 기본값
            tone: ["blue", "green", "purple", "orange"][entry.employeeId % 4] as "blue" | "green" | "purple" | "orange",
            shifts: Array(daysInMonth).fill(""),
            summary: { d: 0, e: 0, n: 0, off: 0, al: 0 }
          });
        }
        
        let dayStr = "";
        if (Array.isArray(entry.workDate)) {
          dayStr = String(entry.workDate[2]);
        } else if (typeof entry.workDate === "string") {
          const dayMatch = entry.workDate.match(/-(\d{2})$/);
          if (dayMatch) {
            dayStr = dayMatch[1];
          }
        }
        
        if (dayStr) {
          const dayIdx = parseInt(dayStr, 10) - 1;
          const shift = entry.shiftTypeCode as Shift;
          empMap.get(entry.employeeId)!.shifts[dayIdx] = shift;
        }
      });
      
      const empList = Array.from(empMap.values());
      
      // 요약 재계산
      empList.forEach(emp => {
        emp.summary = { d: 0, e: 0, n: 0, off: 0, al: 0 };
        emp.shifts.forEach(s => {
          if (s === "D") emp.summary.d++;
          if (s === "E") emp.summary.e++;
          if (s === "N") emp.summary.n++;
          if (s === "OFF") emp.summary.off++;
          if (s === "AL") emp.summary.al++;
        });
      });
      
      setEmployees(empList);
      
      // 편집용 draft 상태 초기화
      const drafts: Record<number, Shift[]> = {};
      empList.forEach(emp => {
        drafts[emp.id] = [...emp.shifts];
      });
      setDraftShifts(drafts);
      setHasChanges(false);
      if (!isAfterSave) {
        setHasSavedOnce(false);
      }
      
    } catch (err) {
      console.error(err);
      setMessage("듀티표를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [currentYear, currentMonth, departmentId]);

  // 스케줄 생성
  const handleCreateSchedule = async () => {
    const token = localStorage.getItem("accessToken") || "";
    
    try {
      setIsLoading(true);
      const res = await fetch(`/api/v1/duty-schedules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          departmentId,
          scheduleYear: currentYear,
          scheduleMonth: currentMonth
        })
      });
      
      if (res.ok) {
        alert("듀티표가 생성되었습니다. 자동 편성을 진행해주세요.");
        setMessage("듀티표가 생성되었습니다. 자동 편성을 진행해주세요.");
        fetchSchedule();
      } else {
        const error = await res.text();
        setMessage(`생성 실패: ${error}`);
      }
    } catch (err) {
      setMessage("서버 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 자동 편성
  const handleAutoGenerate = async () => {
    if (!schedule) return;
    const token = localStorage.getItem("accessToken") || "";
    
    try {
      setIsLoading(true);
      const res = await fetch(`/api/v1/duty-schedules/${schedule.id}/auto-generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          requireSenior: true,
          maxNightPerMonth: 7
        })
      });
      
      if (res.ok) {
        alert("자동 편성이 완료되었습니다.");
        setMessage("자동 편성이 완료되었습니다.");
        fetchSchedule();
      } else {
        const error = await res.text();
        setMessage(`자동 편성 실패: ${error}`);
      }
    } catch (err) {
      setMessage("서버 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 임시 저장
  const handleSaveDraft = async () => {
    if (!schedule) return;
    const token = localStorage.getItem("accessToken") || "";
    
    const entriesToSave: any[] = [];
    Object.keys(draftShifts).forEach(empIdStr => {
      const empId = parseInt(empIdStr, 10);
      const shifts = draftShifts[empId];
      shifts.forEach((shift, idx) => {
        if (!shift) return;
        const dayStr = String(idx + 1).padStart(2, "0");
        const monthStr = String(currentMonth).padStart(2, "0");
        entriesToSave.push({
          employeeId: empId,
          workDate: `${currentYear}-${monthStr}-${dayStr}`,
          shiftTypeCode: shift
        });
      });
    });
    
    try {
      setIsLoading(true);
      const res = await fetch(`/api/v1/duty-schedules/${schedule.id}/entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(entriesToSave)
      });
      
      if (res.ok) {
        alert("임시 저장되었습니다.");
        setMessage("임시 저장되었습니다.");
        setHasChanges(false);
        setHasSavedOnce(true);
        await fetchSchedule(true);
      } else {
        const error = await res.text();
        setMessage(`저장 실패: ${error}`);
      }
    } catch (err) {
      setMessage("서버 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 확정 (발행)
  const handleConfirm = async () => {
    if (!schedule) return;
    if (hasChanges) {
      alert("먼저 임시 저장을 해주세요.");
      return;
    }
    const token = localStorage.getItem("accessToken") || "";
    
    try {
      setIsLoading(true);
      const res = await fetch(`/api/v1/duty-schedules/${schedule.id}/confirm`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        alert("듀티표가 성공적으로 발행(확정)되었습니다! 더 이상 수정할 수 없습니다.");
        setMessage("듀티표가 발행(확정)되었습니다.");
        fetchSchedule();
      } else {
        const error = await res.text();
        setMessage(`발행 실패: ${error}`);
      }
    } catch (err) {
      setMessage("서버 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(prev => prev + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(prev => prev - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleCellClick = (empId: number, dayIdx: number) => {
    if (schedule?.status === "CONFIRMED") return;
    
    setDraftShifts(prev => {
      const newShifts = { ...prev };
      const currentShift = newShifts[empId][dayIdx];
      
      const nextMap: Record<string, Shift> = {
        "": "D",
        "D": "E",
        "E": "N",
        "N": "OFF",
        "OFF": "AL",
        "AL": "D"
      };
      
      newShifts[empId][dayIdx] = nextMap[currentShift] || "D";
      setHasChanges(true);
      return newShifts;
    });
  };

  const isConfirmed = schedule?.status === "CONFIRMED";

  // 하단 일별 D 근무 현황 계산 (실시간 draft 기준)
  const dailyDCount = DAYS.map((_, i) => {
    let count = 0;
    Object.values(draftShifts).forEach(shifts => {
      if (shifts[i] === "D") count++;
    });
    return count;
  });

  return (
    <main className={styles.main}>
      <div className={styles.pageHeader}>
        <div>
          <h1>듀티표 편성</h1>
          <p>부서별 월간 근무 스케줄을 편성하고 관리합니다.</p>
          {message && <span style={{color: 'red', marginLeft: '10px'}}>{message}</span>}
        </div>
        <div className={styles.pageActions}>
          <div className={styles.monthNav}>
            <button type="button" onClick={handlePrevMonth}>‹</button>
            <span>{currentYear}년 {currentMonth}월</span>
            <button type="button" onClick={handleNextMonth}>›</button>
          </div>
          <select
            className={styles.deptSelect}
            value={departmentId ?? ""}
            onChange={(e) => setDepartmentId(parseInt(e.target.value, 10))}
          >
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          
          {!schedule && (
            <button 
              type="button" 
              className={styles.primaryBtn}
              onClick={handleCreateSchedule}
              disabled={isLoading || !canEdit || departmentId == null}
              title={!canEdit ? "수정 권한이 없습니다" : undefined}
            >
              + 신규 스케줄 생성
            </button>
          )}

          {schedule && !isConfirmed && (
            <>
              <button 
                type="button" 
                className={styles.outlineBtn} 
                onClick={handleAutoGenerate} 
                disabled={isLoading || !canEdit}
                title={!canEdit ? "수정 권한이 없습니다" : undefined}
              >
                자동 배정
              </button>
              <button 
                type="button" 
                className={styles.outlineBtn} 
                onClick={handleSaveDraft} 
                disabled={isLoading || !canEdit}
                title={!canEdit ? "수정 권한이 없습니다" : undefined}
              >
                임시저장
              </button>
              <button 
                type="button" 
                className={styles.primaryBtn} 
                onClick={handleConfirm} 
                disabled={isLoading || hasChanges || !hasSavedOnce || !canEdit}
                title={!canEdit ? "수정 권한이 없습니다" : undefined}
              >
                최종 확정
              </button>
            </>
          )}

          {isConfirmed && (
            <span style={{ 
              backgroundColor: '#4CAF50', 
              color: 'white', 
              padding: '8px 16px', 
              borderRadius: '4px', 
              fontWeight: 'bold', 
              display: 'inline-block',
              marginLeft: '10px'
            }}>
              ✅ 발행이 완료된 스케줄입니다
            </span>
          )}
        </div>
      </div>

      <div className={styles.legendBar}>
        <div className={styles.legend}>
          <span><i className={styles.legD} /> D 주간</span>
          <span><i className={styles.legE} /> E 오후</span>
          <span><i className={styles.legN} /> N 야간</span>
          <span><i className={styles.legOff} /> OFF 휴무</span>
          <span><i className={styles.legAl} /> AL 연차</span>
        </div>
        <div className={styles.headcount}>
          <span>총 인원 {employees.length}명</span>
          <span className={styles.remain}>{isConfirmed ? '수정 불가(확정)' : '클릭하여 상태 변경 (D→E→N→OFF→AL)'}</span>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.dutyTable}>
          <thead>
            <tr>
              <th className={styles.stickyCol}>직원</th>
              {DAYS.map((d, i) => (
                <th key={d} className={WEEKDAYS[i] === "토" || WEEKDAYS[i] === "일" ? styles.weekend : ""}>
                  <span className={styles.dayNum}>{d}</span>
                  <span className={styles.dayWeek}>{WEEKDAYS[i]}</span>
                </th>
              ))}
              <th className={styles.summaryCol}>D/E/N/OFF</th>
            </tr>
          </thead>
          <tbody>
            {!schedule ? (
              <tr>
                <td colSpan={daysInMonth + 2} style={{textAlign: 'center', padding: '50px', color: '#666'}}>
                  해당 월의 듀티표가 아직 생성되지 않았습니다. [스케줄 생성] 버튼을 눌러 시작해주세요.
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={daysInMonth + 2} style={{textAlign: 'center', padding: '50px', color: '#666'}}>
                  듀티표가 생성되었지만 교대 근무자가 배정되지 않았습니다. [자동 편성]을 진행해주세요.
                </td>
              </tr>
            ) : (
              employees.map((emp) => {
                const currentShifts = draftShifts[emp.id] || Array(daysInMonth).fill("");
                // 실시간 요약 계산
                const sum = { d: 0, e: 0, n: 0, off: 0, al: 0 };
                currentShifts.forEach(s => {
                  if (s === "D") sum.d++;
                  if (s === "E") sum.e++;
                  if (s === "N") sum.n++;
                  if (s === "OFF") sum.off++;
                  if (s === "AL") sum.al++;
                });

                return (
                  <tr key={emp.id}>
                    <td className={styles.stickyCol}>
                      <div className={styles.empCell}>
                        <span className={`${styles.avatar} ${styles[emp.tone]}`}>{emp.initial}</span>
                        <div>
                          <strong>{emp.name}</strong>
                          <small>{emp.position}</small>
                        </div>
                      </div>
                    </td>
                    {currentShifts.map((shift, i) => (
                      <td key={i} onClick={() => handleCellClick(emp.id, i)} style={{ cursor: isConfirmed ? 'default' : 'pointer', border: '1px solid #eee' }}>
                        {shift ? (
                          <span className={`${styles.shift} ${styles[`shift${shift}`]}`}>
                            {shift}
                          </span>
                        ) : (
                          <span className={styles.shiftEmpty}>+</span>
                        )}
                      </td>
                    ))}
                    <td className={styles.summaryCol}>
                      <span className={styles.summaryText}>
                        {sum.d}/{sum.e}/{sum.n}/{sum.off + sum.al}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}

            {/* 하단 일별 D 현황 */}
            <tr className={styles.dailyRow}>
              <td className={styles.stickyCol}>
                <strong>일별 D 현황</strong>
              </td>
              {dailyDCount.map((count, i) => (
                <td key={i}>
                  <span className={count === 0 ? styles.dailyZero : styles.dailyCount}>
                    {count}
                  </span>
                </td>
              ))}
              <td className={styles.summaryCol} />
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
