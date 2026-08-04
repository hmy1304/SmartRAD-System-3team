"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  checkIn,
  checkOut,
  getMyAttendanceToday,
  formatAttendanceTime,
  type AttendanceRecord,
} from "@/services/attendanceService";
import styles from "./AttendanceCheckCard.module.scss";

export default function AttendanceCheckCard() {
  const { userProfile } = useAuthStore();
  const [today, setToday] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const employeeId = userProfile?.employeeId as number | undefined;

  const reload = () => {
    if (!employeeId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getMyAttendanceToday(employeeId)
      .then(setToday)
      .catch(() => setToday(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const handleCheckIn = async () => {
    if (!employeeId) return;
    setActionLoading(true);
    try {
      await checkIn(employeeId);
      reload();
    } catch (err: any) {
      alert(err.message || "출근 체크에 실패했습니다.");
      reload();
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!employeeId) return;
    setActionLoading(true);
    try {
      await checkOut(employeeId);
      reload();
    } catch (err: any) {
      alert(err.message || "퇴근 체크에 실패했습니다.");
      reload();
    } finally {
      setActionLoading(false);
    }
  };

  if (!employeeId || loading) return null;

  const checkInTime = formatAttendanceTime(today?.checkInTime);
  const checkOutTime = formatAttendanceTime(today?.checkOutTime);

  return (
    <section className={styles.checkCard}>
      <div className={styles.info}>
        <span className={styles.label}>오늘 출퇴근</span>
        {!today ? (
          <strong className={styles.state}>아직 출근 전입니다</strong>
        ) : !checkOutTime ? (
          <strong className={styles.state}>
            출근 {checkInTime} · 근무 중
          </strong>
        ) : (
          <strong className={styles.state}>
            출근 {checkInTime} · 퇴근 {checkOutTime} · 근무 완료
          </strong>
        )}
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.checkInBtn}
          onClick={handleCheckIn}
          disabled={actionLoading || !!today}
        >
          출근 체크
        </button>
        <button
          type="button"
          className={styles.checkOutBtn}
          onClick={handleCheckOut}
          disabled={actionLoading || !today || !!checkOutTime}
        >
          퇴근 체크
        </button>
      </div>
    </section>
  );
}
