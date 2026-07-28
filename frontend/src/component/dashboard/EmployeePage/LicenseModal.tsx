"use client";

import { useEffect, useState } from "react";
import type { EmployeeLicenseItem } from "@/types/employee";
import styles from "./LicenseModal.module.scss";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  employeeLabel: string;
  initial?: EmployeeLicenseItem | null;
  onClose: () => void;
  onSave: (
    data: Omit<EmployeeLicenseItem, "id" | "status"> & { id?: string },
  ) => void;
  onDelete?: () => void;
};

const TYPES = ["의료면허", "전문 자격증", "안전 자격증", "기타"] as const;

export default function LicenseModal({
  open,
  mode,
  employeeLabel,
  initial,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [type, setType] = useState<(typeof TYPES)[number]>("의료면허");
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [issuer, setIssuer] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expireDate, setExpireDate] = useState("");
  const [noExpire, setNoExpire] = useState(false);
  const [needRenewAlarm, setNeedRenewAlarm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initial) {
      setType(initial.type);
      setName(initial.name);
      setNumber(initial.number);
      setIssuer(initial.issuer);
      setSpecialty(initial.specialty ?? "");
      setIssueDate(initial.issueDate);
      setExpireDate(initial.expireDate ?? "");
      setNoExpire(initial.noExpire);
      setNeedRenewAlarm(initial.needRenewAlarm);
    } else {
      setType("의료면허");
      setName("");
      setNumber("");
      setIssuer("");
      setSpecialty("");
      setIssueDate("");
      setExpireDate("");
      setNoExpire(false);
      setNeedRenewAlarm(false);
    }
    setError("");
  }, [open, mode, initial]);

  if (!open) return null;

  const submit = () => {
    if (!name.trim() || !number.trim() || !issuer.trim() || !issueDate) {
      setError("필수 항목을 입력하세요.");
      return;
    }
    if (!noExpire && !expireDate) {
      setError("만료일을 입력하거나 '만료일 없음'을 체크하세요.");
      return;
    }
    onSave({
      id: initial?.id,
      type,
      name: name.trim(),
      number: number.trim(),
      issuer: issuer.trim(),
      specialty: specialty.trim() || undefined,
      issueDate,
      expireDate: noExpire ? undefined : expireDate,
      noExpire,
      needRenewAlarm,
    });
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2>
              {mode === "create" ? "면허 / 자격증 추가" : "면허 / 자격증 수정"}
            </h2>
            <p>{employeeLabel}</p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.body}>
          {mode === "edit" && initial && (
            <div className={styles.editBanner}>
              <strong>{initial.name}</strong>
              <span className={styles.badgeValid}>유효</span>
              <p>현재 수정 중인 자격증 정보입니다. 변경 사항은 즉시 반영됩니다.</p>
            </div>
          )}

          <div className={styles.field}>
            <span>
              자격 유형 <b>필수</b>
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
                면허 / 자격증명 <b>필수</b>
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예) 방사선사 면허"
              />
            </label>
            <label className={styles.field}>
              <span>
                발급 기관 <b>필수</b>
              </span>
              <input
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="예) 보건복지부"
              />
            </label>
          </div>

          <div className={styles.grid2}>
            <label className={styles.field}>
              <span>
                자격 번호 <b>필수</b>
              </span>
              <input
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="예) RAD-26-09821"
              />
            </label>
            <label className={styles.field}>
              <span>전문 분야 (선택)</span>
              <input
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="예) 영상의학"
              />
            </label>
          </div>

          <div className={styles.grid2}>
            <label className={styles.field}>
              <span>
                취득일 <b>필수</b>
              </span>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>만료일 (없으면 영구)</span>
              <input
                type="date"
                value={expireDate}
                onChange={(e) => setExpireDate(e.target.value)}
                disabled={noExpire}
              />
            </label>
          </div>

          <label className={styles.check}>
            <input
              type="checkbox"
              checked={noExpire}
              onChange={(e) => setNoExpire(e.target.checked)}
            />
            만료일 없음 (영구 유효)
          </label>
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={needRenewAlarm}
              onChange={(e) => setNeedRenewAlarm(e.target.checked)}
            />
            갱신 필요 자격 (만료 전 알림 발송)
          </label>

          {error && <p className={styles.error}>{error}</p>}
        </div>

        <div className={styles.footer}>
          {mode === "edit" && onDelete && (
            <button type="button" className={styles.deleteBtn} onClick={onDelete}>
              자격 삭제
            </button>
          )}
          <div className={styles.footerRight}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              × 취소
            </button>
            <button type="button" className={styles.saveBtn} onClick={submit}>
              {mode === "create" ? "+ 자격 추가" : "✓ 수정 저장"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}