"use client";

import { useEffect, useState } from "react";
import styles from "./StatutoryPage.module.scss";
import { getDashboardSummary, getUrgentSchedules } from "@/services/statutoryService";
import type { StatutoryDashboardSummaryResponse, StatutoryScheduleResponse } from "@/types/statutory";

export default function StatutoryDashboardTab() {
  const [summary, setSummary] = useState<StatutoryDashboardSummaryResponse | null>(null);
  const [urgent, setUrgent] = useState<StatutoryScheduleResponse[]>([]);

  useEffect(() => {
    const today = new Date();
    getDashboardSummary(today.getFullYear(), today.getMonth() + 1).then(setSummary);
    getUrgentSchedules(5).then(setUrgent);
  }, []);

  return (
    <div>
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.cardHeader}>
            <div className={`${styles.icon} ${styles.iconBlue}`}>📋</div>
            이달 신고 현황
          </div>
          <div className={styles.cardBody}>
            <span className={styles.value}>{summary?.thisMonthCompleted || 0} / {summary?.thisMonthTotal || 0}</span>
            <span className={styles.label}>완료</span>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.cardHeader}>
            <div className={`${styles.icon} ${styles.iconOrange}`}>⏰</div>
            기한 임박 신고
          </div>
          <div className={styles.cardBody}>
            <span className={styles.value}>{summary?.urgentCount || 0}</span>
            <span className={styles.label}>건</span>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.cardHeader}>
            <div className={`${styles.icon} ${styles.iconGreen}`}>✅</div>
            최근 완료 신고
          </div>
          <div className={styles.cardBody}>
            <span className={styles.value}>4대보험 취득</span>
            <span className={styles.label}>완료</span>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.cardHeader}>
            <div className={`${styles.icon} ${styles.iconPurple}`}>📄</div>
            연말정산 기준연도
          </div>
          <div className={styles.cardBody}>
            <span className={styles.value}>2025년도</span>
            <span className={styles.label}>신고 완료</span>
          </div>
        </div>
      </div>

      <div className={styles.dashboardMain}>
        <div>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>4대보험 신고</h2>
              <button className={`${styles.btnSmall} ${styles.btnPrimary}`}>신고서 다운로드</button>
            </div>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>신고 항목</th>
                  <th>신고 유형</th>
                  <th>기한</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {urgent.map(s => (
                  <tr key={s.id}>
                    <td>{s.title}</td>
                    <td><span className={`${styles.badge} ${styles.info}`}>{s.category}</span></td>
                    <td>{s.deadline}</td>
                    <td>
                      <span className={`${styles.badge} ${s.status === 'COMPLETED' ? styles.success : styles.warning}`}>
                        {s.status === 'COMPLETED' ? '신고 완료' : '신고 대기'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
        <div>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>다가오는 신고 일정</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {urgent.map(s => (
                <div key={s.id} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{s.title}</div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>기한: {s.deadline}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
