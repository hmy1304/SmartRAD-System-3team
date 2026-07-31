"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import styles from "./PayrollProcessingPage.module.scss";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Mock Icons
const IconDoc = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const IconCheck = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="9 12 11 14 15 10"></polyline></svg>;
const IconAlert = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const IconRefresh = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>;

export default function PayrollProcessingPage() {
  const [targetYear, setTargetYear] = useState(2026);
  const [targetMonth, setTargetMonth] = useState(7);
  const { userProfile } = useAuthStore();
  const canWrite = useMemo(() => {
    const perm = userProfile?.perms?.find(p => p.menuCode === 'PAYROLL_PROC');
    return perm ? perm.canWrite : false;
  }, [userProfile]);
  
  const [summary, setSummary] = useState({ targetCount: 0, totalAmount: 0, pendingCount: 0, transferFailedCount: 0 });
  const [payrollList, setPayrollList] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  // Pagination states
  const [calcPage, setCalcPage] = useState(1);
  const [transferPage, setTransferPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  // Checkbox states
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Department filter
  const [selectedDept, setSelectedDept] = useState("부서 전체");

  // Detail modal states
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailRecord, setDetailRecord] = useState<any | null>(null);
  const [detailItems, setDetailItems] = useState<any[]>([]);

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/v1/payroll/${targetYear}/${targetMonth}/summary`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });
      if (res.ok) setSummary(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchPayrollList = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/v1/payroll/${targetYear}/${targetMonth}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        setPayrollList(await res.json());
        setSelectedIds([]); // reset selection when data changes
        setCalcPage(1);
        setTransferPage(1);
      }
    } catch (e) { console.error(e); }
  };

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/v1/payroll/history?year=${targetYear}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        // Transform data for chart
        const chartData = data.map((d: any) => ({
          name: `${d.month}월`,
          "총지급액": d.totalGrossAmount,
          "실지급액": d.totalNetAmount,
          "공제액": d.totalDeductionAmount
        }));
        setHistory(chartData);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchSummary();
    fetchPayrollList();
    fetchHistory();
  }, [targetYear, targetMonth]);

  const handleCalculate = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/v1/payroll/${targetYear}/${targetMonth}/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        alert("급여 계산이 완료되었습니다.");
        fetchSummary();
        fetchPayrollList();
        fetchHistory();
      }
    } catch (e) { console.error(e); }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount || 0);
  };

  // Department filter options (derived from loaded payroll data)
  const departments = useMemo(() => {
    const depts = new Set(payrollList.map(p => p.departmentName || "부서없음"));
    return ["부서 전체", ...Array.from(depts)];
  }, [payrollList]);

  const filteredPayrollList = useMemo(() => {
    if (selectedDept === "부서 전체") return payrollList;
    return payrollList.filter(p => (p.departmentName || "부서없음") === selectedDept);
  }, [payrollList, selectedDept]);

  useEffect(() => {
    setCalcPage(1);
    setTransferPage(1);
  }, [selectedDept]);

  // Pagination Logic
  const calcTotalPages = Math.ceil(filteredPayrollList.length / ITEMS_PER_PAGE) || 1;
  const transferTotalPages = Math.ceil(filteredPayrollList.length / ITEMS_PER_PAGE) || 1;
  const paginatedCalcList = filteredPayrollList.slice((calcPage - 1) * ITEMS_PER_PAGE, calcPage * ITEMS_PER_PAGE);
  const paginatedTransferList = filteredPayrollList.slice((transferPage - 1) * ITEMS_PER_PAGE, transferPage * ITEMS_PER_PAGE);

  // Checkbox Logic
  const isAllSelected = paginatedCalcList.length > 0 && paginatedCalcList.every(p => selectedIds.includes(p.id));

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const newIds = new Set(selectedIds);
      paginatedCalcList.forEach(p => newIds.add(p.id));
      setSelectedIds(Array.from(newIds));
    } else {
      const currentIds = paginatedCalcList.map(p => p.id);
      setSelectedIds(selectedIds.filter(id => !currentIds.includes(id)));
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const openDetail = async (employeeId: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError(null);
    setDetailRecord(null);
    setDetailItems([]);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/v1/payroll/${employeeId}/${targetYear}/${targetMonth}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const body = await res.json();
        setDetailRecord(body.record);
        setDetailItems(body.details || []);
      } else {
        setDetailError("급여 계산이 아직 실행되지 않은 직원입니다. 먼저 급여 계산을 실행해주세요.");
      }
    } catch (e) {
      setDetailError("상세 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailRecord(null);
    setDetailItems([]);
    setDetailError(null);
  };

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div className={styles.titleWrap}>
          <h1>급여 처리</h1>
          <p>급여 계산부터 지급 실행, 이력 조회까지 급여 처리 전 과정을 관리합니다.</p>
        </div>
        <div className={styles.actionBtns}>
          <button className={styles.exportBtn}>전체 내보내기</button>
          <button 
            className={styles.calcBtn} 
            onClick={handleCalculate}
            disabled={!canWrite}
            style={{ opacity: canWrite ? 1 : 0.5, cursor: canWrite ? 'pointer' : 'not-allowed' }}
          >
            일괄 급여 계산 실행
          </button>
        </div>
      </header>

      {/* 4 Summary Cards */}
      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <div className={`${styles.iconBox} ${styles.blue}`}><IconDoc /></div>
          <div className={styles.cardContent}>
            <h3>급여 지급 대상</h3>
            <p className={styles.value}>{summary.targetCount} <span>명</span></p>
          </div>
        </div>
        <div className={styles.card}>
          <div className={`${styles.iconBox} ${styles.green}`}>￦</div>
          <div className={styles.cardContent}>
            <h3>{targetMonth}월 총 지급액</h3>
            <p className={styles.value}>{formatMoney(summary.totalAmount)} <span>원</span></p>
          </div>
        </div>
        <div className={styles.card}>
          <div className={`${styles.iconBox} ${styles.yellow}`}>⚠</div>
          <div className={styles.cardContent}>
            <h3>확정 대기 인원</h3>
            <p className={styles.value}>{summary.pendingCount} <span>명</span></p>
            {summary.pendingCount > 0 && <span className={`${styles.subtext} ${styles.yellow}`}>확정 필요</span>}
          </div>
        </div>
        <div className={styles.card}>
          <div className={`${styles.iconBox} ${styles.red}`}>✕</div>
          <div className={styles.cardContent}>
            <h3>이체 실패</h3>
            <p className={styles.value}>{summary.transferFailedCount} <span>명</span></p>
            {summary.transferFailedCount > 0 && <span className={`${styles.subtext} ${styles.red}`}>즉시처리 필요</span>}
          </div>
        </div>
      </div>

      {/* Section 1: Payroll Calculation */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <div className={`${styles.iconBox} ${styles.blue}`}><IconDoc /></div>
            <div>
              <h2>급여 계산</h2>
              <p>{targetYear}년 {targetMonth}월 귀속분 · 직원별 급여 계산 현황</p>
            </div>
          </div>
          <div className={styles.sectionFilters}>
            <select value={targetMonth} onChange={(e) => setTargetMonth(Number(e.target.value))}>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                <option key={m} value={m}>{targetYear}년 {m}월</option>
              ))}
            </select>
            <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <button className={styles.calcBtn} onClick={handleCalculate} disabled={!canWrite || selectedIds.length === 0} style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: canWrite ? 'pointer' : 'not-allowed', opacity: canWrite ? 1 : 0.5 }}>선택 계산 실행</button>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th><input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} /></th>
                <th>직원명</th>
                <th>부서</th>
                <th>기본급(원)</th>
                <th>수당 합계 (원)</th>
                <th>공제 합계 (원)</th>
                <th>실지급액 (원)</th>
                <th>계산 상태</th>
                <th>상세</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCalcList.map((p, i) => (
                <tr key={i}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(p.id)}
                      onChange={() => handleSelectOne(p.id)}
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '28px', height: '28px', backgroundColor: '#e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                        {p.employeeName?.charAt(0) || '-'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{p.employeeName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{p.empNo}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.departmentName || '부서없음'}</td>
                  <td>{formatMoney(p.baseSalary)}</td>
                  <td style={{ color: '#059669' }}>+ {formatMoney(p.totalAllowance)}</td>
                  <td style={{ color: '#dc2626' }}>- {formatMoney(p.totalDeduction)}</td>
                  <td style={{ fontWeight: 600 }}>{formatMoney(p.netPay)}</td>
                  <td>
                    {p.status === 'CONFIRMED' ? (
                      <span className={`${styles.badge} ${styles.success}`}><IconCheck /> 확정 완료</span>
                    ) : p.status === 'MANUAL' ? (
                      <span className={`${styles.badge} ${styles.success}`}><IconCheck /> 수동 입력</span>
                    ) : p.status === 'PENDING' ? (
                      <span className={`${styles.badge} ${styles.success}`}><IconCheck /> 계산 완료</span>
                    ) : (
                      <span className={`${styles.badge} ${styles.default}`}>계산 전</span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.actionIcon}
                      onClick={() => openDetail(p.employeeId)}
                    >
                      ⋯
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedCalcList.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    데이터가 없습니다. 급여 계산을 실행해주세요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Pagination for Calc */}
          {calcTotalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1rem' }}>
              <button 
                onClick={() => setCalcPage(p => Math.max(1, p - 1))} 
                disabled={calcPage === 1}
                style={{ padding: '0.25rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', backgroundColor: '#fff', cursor: calcPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                이전
              </button>
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>{calcPage} / {calcTotalPages}</span>
              <button 
                onClick={() => setCalcPage(p => Math.min(calcTotalPages, p + 1))} 
                disabled={calcPage === calcTotalPages}
                style={{ padding: '0.25rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', backgroundColor: '#fff', cursor: calcPage === calcTotalPages ? 'not-allowed' : 'pointer' }}
              >
                다음
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Section 2: Payroll Transfer */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <div className={`${styles.iconBox} ${styles.green}`}>￦</div>
            <div>
              <h2>급여 지급</h2>
              <p>{targetYear}년 {targetMonth}월 급여 · 계좌이체 실행 및 지급 현황 관리</p>
            </div>
          </div>
          <div className={styles.sectionFilters}>
            <button className={styles.calcBtn} style={{ padding: '0.5rem 1rem', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: canWrite ? 'pointer' : 'not-allowed', opacity: canWrite ? 1 : 0.5 }} onClick={() => alert('이체 실행 준비중입니다.')} disabled={!canWrite}>일괄 이체 실행</button>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>직원명</th>
                <th>부서</th>
                <th>계좌번호</th>
                <th>은행</th>
                <th>지급액 (원)</th>
                <th>이체 일시</th>
                <th>지급 상태</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransferList.map((p, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '28px', height: '28px', backgroundColor: '#e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                        {p.employeeName?.charAt(0) || '-'}
                      </div>
                      <div style={{ fontWeight: 500 }}>{p.employeeName}</div>
                    </div>
                  </td>
                  <td>{p.departmentName || '부서없음'}</td>
                  <td>{p.bankAccount || '미등록'}</td>
                  <td>{p.bankName || '미등록'}</td>
                  <td style={{ fontWeight: 600 }}>{formatMoney(p.netPay)}</td>
                  <td style={{ color: '#6b7280' }}>
                    {p.transferDate ? new Date(p.transferDate).toLocaleString() : '-'}
                  </td>
                  <td>
                    {p.transferStatus === 'SUCCESS' ? (
                      <span className={`${styles.badge} ${styles.success}`}><IconCheck /> 이체 완료</span>
                    ) : p.transferStatus === 'FAILED' ? (
                      <span className={`${styles.badge} ${styles.danger}`}><IconAlert /> 이체 실패</span>
                    ) : (
                      <span className={`${styles.badge} ${styles.default}`}>대기</span>
                    )}
                  </td>
                  <td>
                    {p.transferStatus === 'FAILED' ? (
                      <button style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#dc2626', border: '1px solid #fca5a5', backgroundColor: '#fef2f2', borderRadius: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }} onClick={() => alert('재이도 실행')}>
                        <IconRefresh /> 재이도
                      </button>
                    ) : (
                      <span style={{ color: '#d1d5db' }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
              {paginatedTransferList.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    지급 대상이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination for Transfer */}
          {transferTotalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1rem' }}>
              <button 
                onClick={() => setTransferPage(p => Math.max(1, p - 1))} 
                disabled={transferPage === 1}
                style={{ padding: '0.25rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', backgroundColor: '#fff', cursor: transferPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                이전
              </button>
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>{transferPage} / {transferTotalPages}</span>
              <button 
                onClick={() => setTransferPage(p => Math.min(transferTotalPages, p + 1))} 
                disabled={transferPage === transferTotalPages}
                style={{ padding: '0.25rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', backgroundColor: '#fff', cursor: transferPage === transferTotalPages ? 'not-allowed' : 'pointer' }}
              >
                다음
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Section 3: Payroll History */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <div className={`${styles.iconBox} ${styles.purple}`}>↻</div>
            <div>
              <h2>급여 이력</h2>
              <p>월별 급여 처리 이력 및 통계 조회 · {targetYear}년 귀속분</p>
            </div>
          </div>
        </div>

        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={history} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value / 10000}만`} />
              <Tooltip formatter={(value: any) => formatMoney(value) + "원"} />
              <Legend />
              <Bar dataKey="총지급액" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="실지급액" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="공제액" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {detailOpen && (
        <div className={styles.modalOverlay} onClick={closeDetail}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>급여 상세 내역</h3>
              <button type="button" className={styles.modalClose} onClick={closeDetail}>×</button>
            </div>
            <div className={styles.modalBody}>
              {detailLoading && <p style={{ textAlign: "center", color: "#6b7280" }}>불러오는 중...</p>}
              {!detailLoading && detailError && (
                <p style={{ textAlign: "center", color: "#dc2626" }}>{detailError}</p>
              )}
              {!detailLoading && !detailError && detailRecord && (
                <>
                  <div className={styles.modalSummary}>
                    <div>
                      <strong>{detailRecord.employeeName}</strong>
                      <span>{detailRecord.empNo} · {detailRecord.departmentName || "부서없음"}</span>
                    </div>
                    <span>{detailRecord.payrollYear}년 {detailRecord.payrollMonth}월 귀속</span>
                  </div>

                  <div className={styles.modalRow}>
                    <span>기본급</span>
                    <span>{formatMoney(detailRecord.baseSalary)}원</span>
                  </div>

                  <h4 className={styles.modalGroupTitle}>수당</h4>
                  {detailItems.filter(d => d.itemType === "ALLOWANCE").length === 0 ? (
                    <p className={styles.modalEmpty}>지급된 수당이 없습니다.</p>
                  ) : (
                    detailItems.filter(d => d.itemType === "ALLOWANCE").map(d => (
                      <div key={d.id} className={styles.modalRow}>
                        <span>{d.itemName}</span>
                        <span style={{ color: "#059669" }}>+ {formatMoney(d.amount)}원</span>
                      </div>
                    ))
                  )}

                  <h4 className={styles.modalGroupTitle}>공제</h4>
                  {detailItems.filter(d => d.itemType === "DEDUCTION").length === 0 ? (
                    <p className={styles.modalEmpty}>공제 내역이 없습니다.</p>
                  ) : (
                    detailItems.filter(d => d.itemType === "DEDUCTION").map(d => (
                      <div key={d.id} className={styles.modalRow}>
                        <span>{d.itemName}</span>
                        <span style={{ color: "#dc2626" }}>- {formatMoney(d.amount)}원</span>
                      </div>
                    ))
                  )}

                  <div className={styles.modalNetPay}>
                    <span>실지급액</span>
                    <strong>{formatMoney(detailRecord.netPay)}원</strong>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
