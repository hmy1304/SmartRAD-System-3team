"use client";

import { useState, useEffect } from "react";
import styles from "./PayrollInfoPage.module.scss";
import { DeductionAddModal, DeductionEditModal, BaseSalaryEditModal, AllowanceAddModal, AllowanceEditModal } from "./PayrollModals";


// SVG Icons (Inline for immediate styling)
const SaveIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const DownloadIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const CheckCircleIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const PlusIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const EditIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;

export default function PayrollInfoPage() {
  const [activeTab, setActiveTab] = useState<"taxable" | "non-taxable">("taxable");
  
  // Data states
  const [summary, setSummary] = useState<any>(null);
  const [baseSalaries, setBaseSalaries] = useState<any[]>([]);
  const [allowances, setAllowances] = useState<any[]>([]);
  const [deductions, setDeductions] = useState<any[]>([]);
  const [minWage, setMinWage] = useState<any>(null);

  const [deductionPage, setDeductionPage] = useState(1);
  const DEDUCTIONS_PER_PAGE = 6;

  // Modal states
  const [isDeductionAddOpen, setIsDeductionAddOpen] = useState(false);
  const [editingDeduction, setEditingDeduction] = useState<any>(null);
  const [editingBaseSalary, setEditingBaseSalary] = useState<any>(null);
  const [isAllowanceAddOpen, setIsAllowanceAddOpen] = useState(false);
  const [editingAllowance, setEditingAllowance] = useState<any>(null);

  const fetchData = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const headers = { "Content-Type": "application/json" };
      
      const [sumRes, bsRes, alRes, dedRes, mwRes] = await Promise.all([
        fetch(`${backendUrl}/payroll-settings/summary`, { headers }),
        fetch(`${backendUrl}/payroll-settings/base-salaries`, { headers }),
        fetch(`${backendUrl}/payroll-settings/allowances`, { headers }),
        fetch(`${backendUrl}/payroll-settings/deductions`, { headers }),
        fetch(`${backendUrl}/payroll-settings/minimum-wage`, { headers }),
      ]);

      if (sumRes.ok) setSummary(await sumRes.json());
      if (bsRes.ok) setBaseSalaries(await bsRes.json());
      if (alRes.ok) setAllowances(await alRes.json());
      if (dedRes.ok) setDeductions(await dedRes.json());
      if (mwRes.ok) setMinWage(await mwRes.json());
    } catch (error) {
      console.error("Failed to fetch payroll settings data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalDeductionPages = Math.ceil(deductions.length / DEDUCTIONS_PER_PAGE);
  
  useEffect(() => {
    if (deductionPage > totalDeductionPages) {
      setDeductionPage(Math.max(1, totalDeductionPages));
    }
  }, [totalDeductionPages, deductionPage]);

  const currentDeductions = deductions.slice(
    (deductionPage - 1) * DEDUCTIONS_PER_PAGE,
    deductionPage * DEDUCTIONS_PER_PAGE
  );

  const taxableAllowances = allowances.filter(a => a.taxType === "과세" || a.type === "과세");
  const nonTaxableAllowances = allowances.filter(a => a.taxType === "비과세" || a.type === "비과세");

  const displayAllowances = activeTab === "taxable" ? taxableAllowances : nonTaxableAllowances;

  // Helper for progress bar
  const getJobColor = (jobTitle: string) => {
    if (jobTitle.includes("간호부장")) return "purple";
    if (jobTitle.includes("수간호사")) return "blue";
    if (jobTitle.includes("일반간호사")) return "green";
    if (jobTitle.includes("의사")) return "yellow";
    return "gray";
  };

  return (
    <>
        <div className={styles.pageContainer}>
          {/* Top Header */}
          <div className={styles.header}>
            <div className={styles.titleBox}>
              <h1>기본 정보 관리</h1>
              <p>급여 계산의 기준이 되는 기본급 테이블, 수당 및 공제 항목을 관리합니다.</p>
            </div>
            <div className={styles.actionBox}>
              <button type="button">
                <SaveIcon /> 전체 저장
              </button>
              <button type="button" className={styles.greenText}>
                <DownloadIcon /> 엑셀 다운로드
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className={styles.summaryCards}>
            <div className={styles.card}>
              <div className={styles.cardLeft}>
                <div className={`${styles.iconBox} ${styles.blue}`}>₩</div>
                <div className={styles.infoBox}>
                  <div className={styles.cardTitle}>기본급 평균</div>
                  <div className={styles.cardValue}>
                    {summary?.averageBaseSalary ? summary.averageBaseSalary.toLocaleString() : '3,842,000'} <span>원</span>
                  </div>
                </div>
              </div>
              <div className={styles.cardRight}>
                <div className={`${styles.badge} ${styles.blueText}`}>전월 대비 +2.1%</div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardLeft}>
                <div className={`${styles.iconBox} ${styles.green}`}>$</div>
                <div className={styles.infoBox}>
                  <div className={styles.cardTitle}>수당 항목 수</div>
                  <div className={styles.cardValue}>
                    {summary?.allowanceCount ?? '14'} <span>개</span>
                  </div>
                </div>
              </div>
              <div className={styles.cardRight}>
                <div className={`${styles.badge} ${styles.greenBg}`}>과세 9 - 비과세 5</div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardLeft}>
                <div className={`${styles.iconBox} ${styles.red}`}>−</div>
                <div className={styles.infoBox}>
                  <div className={styles.cardTitle}>공제 항목 수</div>
                  <div className={styles.cardValue}>
                    {summary?.deductionCount ?? '8'} <span>개</span>
                  </div>
                </div>
              </div>
              <div className={styles.cardRight}>
                <div className={`${styles.badge} ${styles.redBg}`}>법정 5 - 자체 3</div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardLeft}>
                <div className={`${styles.iconBox} ${styles.yellow}`}>📅</div>
                <div className={styles.infoBox}>
                  <div className={styles.cardTitle}>적용 기준월</div>
                  <div className={styles.cardValue}>
                    {summary?.applicableMonth ?? '2026년 7월'}
                  </div>
                </div>
              </div>
              <div className={styles.cardRight}>
                <div className={`${styles.badge} ${styles.orangeText}`}>다음 갱신: 2026.08.01</div>
              </div>
            </div>
          </div>

          <div className={styles.mainLayout}>
            {/* LEFT COLUMN */}
            <div className={styles.leftCol}>
              
              {/* Base Salary Table */}
              <div className={styles.dataCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>
                    <div className={`${styles.titleIcon} ${styles.blue}`}>🔗</div>
                    <h2>기본급 테이블</h2>
                    <p>직급별 기본급 기준 금액 (세전 기준)</p>
                  </div>
                  <div className={styles.headerAction}>
                    <div className={styles.badge}>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> 2026년 기준
                    </div>
                  </div>
                </div>

                <div className={styles.tableWrap}>
                  <table>
                    <thead>
                      <tr>
                        <th>직급</th>
                        <th>호봉</th>
                        <th style={{width: '35%'}}>기본급 (원)</th>
                        <th>기본 수당 포함액</th>
                        <th>적용일</th>
                        <th>관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {baseSalaries.length > 0 ? baseSalaries.map((item, idx) => (
                        <tr key={idx}>
                          <td><span className={`${styles.jobBadge} ${styles[getJobColor(item.jobTitle)]}`}>{item.jobTitle}</span></td>
                          <td>1 ~ 10호봉</td>
                          <td>
                            <div className={styles.rangeBar}>
                              <div className={styles.value}>{item.minAmount?.toLocaleString()} ~ {item.maxAmount?.toLocaleString()}</div>
                              <div className={styles.bar}>
                                <div className={`${styles.fill} ${styles[getJobColor(item.jobTitle)]}`}></div>
                              </div>
                            </div>
                          </td>
                          <td>{item.actualAmount ? item.actualAmount.toLocaleString() : '-'}</td>
                          <td>2026-01-01</td>
                          <td><button className={styles.editBtn} onClick={() => setEditingBaseSalary(item)}><EditIcon /></button></td>
                        </tr>
                      )) : (
                        <tr><td colSpan={6} style={{textAlign: 'center', padding: '2rem'}}>데이터가 없습니다.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Deduction Items Table */}
              <div className={styles.dataCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>
                    <div className={`${styles.titleIcon} ${styles.red}`}>⊖</div>
                    <h2>공제 항목 관리</h2>
                    <p>급여에서 차감되는 법정 및 자체 공제 항목</p>
                  </div>
                  <div className={styles.headerAction}>
                    <button className={`${styles.solidBtn} ${styles.blue}`} onClick={() => setIsDeductionAddOpen(true)}>
                      공제 항목 추가
                    </button>
                  </div>
                </div>

                <div className={styles.tableWrap}>
                  <table>
                    <thead>
                      <tr>
                        <th>공제 항목명</th>
                        <th>구분</th>
                        <th>계산 방식</th>
                        <th>요율 / 정액</th>
                        <th>적용 여부</th>
                        <th>관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentDeductions.length > 0 ? currentDeductions.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.name}</td>
                          <td>
                            <span className={`${styles.typeBadge} ${item.category === '법정' || item.category === '법정공제' ? styles.red : styles.purple}`}>
                              {item.category === '법정' ? '법정공제' : '자체공제'}
                            </span>
                          </td>
                          <td className={styles.calcMethod}>{item.deductionType}</td>
                          <td>
                            <span className={`${styles.rateValue} ${item.category === '법정' ? styles.blue : styles.purple}`}>
                              {item.rateOrAmount}
                            </span>
                          </td>
                          <td>
                            <label className={styles.toggleSwitch}>
                              <input type="checkbox" defaultChecked={true} />
                              <span className={styles.slider}></span>
                            </label>
                          </td>
                          <td><button className={styles.editBtn} onClick={() => setEditingDeduction(item)}><EditIcon /></button></td>
                        </tr>
                      )) : (
                        <tr><td colSpan={6} style={{textAlign: 'center', padding: '2rem'}}>데이터가 없습니다.</td></tr>
                      )}
                    </tbody>
                  </table>
                  {totalDeductionPages > 1 && (
                    <div className={styles.pagination}>
                      {Array.from({ length: totalDeductionPages }).map((_, i) => (
                        <button
                          key={i}
                          className={`${styles.pageBtn} ${deductionPage === i + 1 ? styles.active : ""}`}
                          onClick={() => setDeductionPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className={styles.rightCol}>
              
              {/* Allowance Items */}
              <div className={styles.dataCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>
                    <div className={`${styles.titleIcon} ${styles.green}`}>⨁</div>
                    <h2>수당 항목 관리</h2>
                    <p>총 {allowances.length}개 항목</p>
                  </div>
                  <div className={styles.headerAction}>
                    <button className={`${styles.solidBtn} ${styles.green}`} onClick={() => setIsAllowanceAddOpen(true)}>
                      <PlusIcon /> 추가
                    </button>
                  </div>
                </div>

                <div className={styles.tabList}>
                  <button 
                    className={`${styles.tabBtn} ${activeTab === 'taxable' ? styles.active : ''}`}
                    onClick={() => setActiveTab('taxable')}
                  >
                    과세 수당 ({taxableAllowances.length})
                  </button>
                  <button 
                    className={`${styles.tabBtn} ${activeTab === 'non-taxable' ? styles.active : ''}`}
                    onClick={() => setActiveTab('non-taxable')}
                  >
                    비과세 수당 ({nonTaxableAllowances.length})
                  </button>
                </div>

                <div className={styles.allowanceList}>
                  {displayAllowances.map((item, idx) => (
                    <div key={idx} className={styles.allowanceItem}>
                      <div className={styles.itemLeft}>
                        <div className={styles.itemIcon}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </div>
                        <div className={styles.itemInfo}>
                          <h3>{item.name}</h3>
                          <p>{item.calculationBasis || "금액 직접 입력"}</p>
                        </div>
                      </div>
                      <div className={styles.itemRight}>
                        <div className={styles.itemRate}>
                          {item.amountOrRate}
                        </div>
                        <div className={styles.itemActions}>
                          <label className={styles.toggleSwitch}>
                            <input type="checkbox" defaultChecked={true} />
                            <span className={styles.slider}></span>
                          </label>
                          <button className={styles.editBtn} onClick={() => setEditingAllowance(item)}><EditIcon /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {displayAllowances.length === 0 && (
                    <div style={{textAlign: 'center', padding: '2rem', color: '#8b95a1'}}>수당 항목이 없습니다.</div>
                  )}
                </div>
                {displayAllowances.length > 4 && (
                   <button style={{width: '100%', padding: '0.75rem', marginTop: '1rem', background: '#eff6ff', color: '#3182f6', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer'}}>나머지 항목 더 보기 ⌄</button>
                )}
              </div>

              {/* Minimum Wage */}
              <div className={styles.dataCard}>
                <div className={styles.cardHeader} style={{marginBottom: '0.5rem'}}>
                  <div className={styles.cardTitle}>
                    <div className={`${styles.titleIcon} ${styles.yellow}`}>💰</div>
                    <h2>최저임금 기준</h2>
                  </div>
                  <div className={styles.headerAction}>
                    <div className={`${styles.badge} ${styles.yellowBg}`} style={{backgroundColor: '#fefce8', color: '#a16207', border: 'none'}}>
                      2026년 기준
                    </div>
                  </div>
                </div>

                <div className={styles.minWageWrap}>
                  <div className={styles.minWageDetails}>
                    <div className={styles.detailCol}>
                      <span className={styles.label}>시간당 최저임금</span>
                      <span className={styles.amount}>{minWage?.hourlyWage ? minWage.hourlyWage.toLocaleString() : '10,030'}원</span>
                    </div>
                    <div className={styles.detailCol} style={{alignItems: 'flex-end'}}>
                      <span className={styles.label}>월 환산액 (209시간)</span>
                      <span className={styles.amount}>{minWage?.monthlyWage ? minWage.monthlyWage.toLocaleString() : '2,096,270'}원</span>
                    </div>
                  </div>
                  
                  <div className={styles.complianceAlert}>
                    <div className={styles.alertText}>
                      <CheckCircleIcon /> 최저임금 준수 여부
                    </div>
                    <div className={styles.alertStatus}>전 직원 준수</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <DeductionAddModal isOpen={isDeductionAddOpen} onClose={() => setIsDeductionAddOpen(false)} onSuccess={fetchData} />
        <DeductionEditModal isOpen={!!editingDeduction} onClose={() => setEditingDeduction(null)} item={editingDeduction} onSuccess={fetchData} />
        <BaseSalaryEditModal isOpen={!!editingBaseSalary} onClose={() => setEditingBaseSalary(null)} item={editingBaseSalary} onSuccess={fetchData} />
        <AllowanceAddModal isOpen={isAllowanceAddOpen} onClose={() => setIsAllowanceAddOpen(false)} onSuccess={fetchData} />
        <AllowanceEditModal isOpen={!!editingAllowance} onClose={() => setEditingAllowance(null)} item={editingAllowance} onSuccess={fetchData} />
    </>
  );
}
