"use client";

import { useState } from "react";
import styles from "./StatutoryPage.module.scss";
import StatutoryDashboardTab from "./StatutoryDashboardTab";
import StatutoryCalendarTab from "./StatutoryCalendarTab";
import StatutoryScheduleModal from "./StatutoryScheduleModal";
import StatutoryGuideTab from "./StatutoryGuideTab";
export default function StatutoryPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "calendar" | "guide">("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setIsModalOpen(false);
    setRefreshKey(prev => prev + 1); // Trigger re-render of child components to fetch latest data
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.titleBox}>
          <div>
            <h1>법정 신고</h1>
            <p>4대보험 신고, 원천징수 납부, 연말정산 등 법정 의무 신고 업무를 통합 관리합니다.</p>
          </div>
        </div>
        
        <div className={styles.tabList}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'dashboard' ? styles.active : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            법정 신고 대시보드
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'calendar' ? styles.active : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            신고 일정 보기
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'guide' ? styles.active : ''}`}
            onClick={() => setActiveTab('guide')}
          >
            신고 가이드
          </button>

          <button className={styles.primaryAction} onClick={() => setIsModalOpen(true)}>
            + 일정 추가
          </button>
        </div>
      </header>

      <main key={refreshKey}>
        {activeTab === 'dashboard' && <StatutoryDashboardTab />}
        {activeTab === 'calendar' && <StatutoryCalendarTab />}
        {activeTab === 'guide' && <StatutoryGuideTab />}
      </main>

      {isModalOpen && (
        <StatutoryScheduleModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleSuccess} 
        />
      )}
    </div>
  );
}
