"use client";

import { useEffect, useState } from "react";
import type { HealthSchedule } from "@/types/employee";
import styles from "./HealthScheduleModal.module.scss";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  employeeLabel: string;
  employeeSub?: string;
  initial?: HealthSchedule | null;
  onClose: () => void;
  onSave: (data: HealthSchedule) => void;
  onDelete?: () => void;
};

const TYPES = ["일반 건강검진", "특수 건강검진", "기타"] as const;

const ALARMS = [
  { key: "30" as const, label: "30일 전" },
  { key: "14" as const, label: "14일 전" },
  { key: "7" as const, label: "7일 전" },
  { key: "none" as const, label: "알림 없음" },
];

export default function HealthScheduleModal({
  open,
  mode,
  employeeLabel,
  employeeSub,
  initial,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [type, setType] = useState<(typeof TYPES)[number]>("일반 건강검진");
  const [date, setDate] = useState("");
  const [org, setOrg] = useState("");
  const [alarm, setAlarm] = useState<"30" | "14" | "7" | "none">("30");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initial) {
      setType(initial.type);
      setDate(initial.date);
      setOrg(initial.org);
      setAlarm(initial.alarm);
    } else {
      setType("일반 건강검진");
      setDate("");
      setOrg("");
      setAlarm("30");
    }
    setError("");
  }, [open, mode, initial]);

  if (!open) return null;

  const submit = () => {
    if (!date || !org.trim()) {
      setError("검진 예정일과 기관을 입력하세요.");
      return;
    }
    onSave({ date, type, org: org.trim(), alarm });
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2>{mode === "create" ? "검진 일정 등록" : "검진 일정 수정"}</h2>
            <p>
              {mode === "create"
                ? "다음 건강검진 예정일을 등록합니다"
                : "등록된 검진 일정을 변경합니다"}
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.body}>
          {mode === "create" && (
            <div className={styles.empCard}>
              <strong>{employeeLabel}</strong>
              {employeeSub && <p>{employeeSub}</p>}
            </div>
          )}

          {mode === "edit" && initial && (
            <div className={styles.editBanner}>
              현재 등록된 일정 · {initial.date} · {initial.type} · {initial.org}
            </div>
          )}

          <div className={styles.field}>
            <span>
              검진 종류 <b>필수</b>
            </span>
            <div className={styles.chipRow}>
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={type === t ? styles.chipActive : styles.chip}
                  onClick={() => setType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.grid2}>
            <label className={styles.field}>
              <span>
                검진 예정일 <b>필수</b>
              </span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>
                검진 기관 / 장소 <b>필수</b>
              </span>
              <input
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                placeholder="예) 원내 의원"
              />
            </label>
          </div>

          <div className={styles.field}>
            <span>알림 설정</span>
            <div className={styles.chipRow}>
              {ALARMS.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  className={alarm === a.key ? styles.chipActive : styles.chip}
                  onClick={() => setAlarm(a.key)}
                >
                  {a.label}
                </button>
              ))}
            </div>
            <p className={styles.hint}>
              설정된 일자에 인사팀과 해당 직원에게 자동 알림이 발송됩니다.
            </p>
          </div>

          {error && <p className={styles.error}>{error}</p>}
        </div>

        <div className={styles.footer}>
          {mode === "edit" && onDelete && (
            <button type="button" className={styles.deleteBtn} onClick={onDelete}>
              일정 삭제
            </button>
          )}
          <div className={styles.footerRight}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              × 취소
            </button>
            <button type="button" className={styles.saveBtn} onClick={submit}>
              {mode === "create" ? "일정 등록" : "✓ 수정 저장"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}