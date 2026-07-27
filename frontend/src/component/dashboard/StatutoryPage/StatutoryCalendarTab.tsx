"use client";

import { useEffect, useState } from "react";
import styles from "./StatutoryPage.module.scss";
import { getSchedulesByMonth, updateScheduleStatus } from "@/services/statutoryService";
import type { StatutoryScheduleResponse } from "@/types/statutory";

export default function StatutoryCalendarTab() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<StatutoryScheduleResponse[]>([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    getSchedulesByMonth(year, month).then(setSchedules);
  }, [year, month]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 2, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month, 1));

  const handleStatusToggle = async (schedule: StatutoryScheduleResponse) => {
    const newStatus = schedule.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    await updateScheduleStatus(schedule.id, newStatus);
    getSchedulesByMonth(year, month).then(setSchedules);
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className={styles.dayCell}></div>);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const dayEvents = schedules.filter(s => s.deadline === dateStr);

    days.push(
      <div key={`day-${i}`} className={styles.dayCell}>
        <div className={styles.dateNum}>{i}</div>
        {dayEvents.map(ev => (
          <div 
            key={ev.id} 
            className={`${styles.event} ${ev.status === 'COMPLETED' ? styles.done : styles.pending}`}
            onClick={() => handleStatusToggle(ev)}
            style={{ cursor: 'pointer' }}
          >
            {ev.title}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.calendarHeader}>
        <h2>{year}년 {month}월 신고 일정</h2>
        <div className={styles.nav}>
          <button onClick={prevMonth}>&lt;</button>
          <button onClick={nextMonth}>&gt;</button>
        </div>
      </div>
      <div className={styles.calendarGrid}>
        <div className={styles.dayName}>일</div>
        <div className={styles.dayName}>월</div>
        <div className={styles.dayName}>화</div>
        <div className={styles.dayName}>수</div>
        <div className={styles.dayName}>목</div>
        <div className={styles.dayName}>금</div>
        <div className={styles.dayName}>토</div>
        {days}
      </div>
    </div>
  );
}
