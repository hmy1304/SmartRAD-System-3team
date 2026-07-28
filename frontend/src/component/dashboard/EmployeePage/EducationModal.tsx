"use client";

import { useEffect, useState } from "react";
import type {
  EmployeeEducationItem,
  EducationStatus,
} from "@/types/employee";
import styles from "./EducationModal.module.scss";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  employeeLabel: string;
  initial?: EmployeeEducationItem | null;
  onClose: () => void;
  onSave: (data: Omit<EmployeeEducationItem, "id"> & { id?: string }) => void;
  onDelete?: () => void;
};

const CATEGORIES = [
  "법정 의무교육",
  "전문 기술교육",
  "직무 역량교육",
  "외부 교육",
  "기타",
] as const;

const STATUS_OPTS: { key: EducationStatus; label: string }[] = [
  { key: "done", label: "이수완료" },
  { key: "pending", label: "대기중 (예정)" },
  { key: "missed", label: "미이수" },
];

export default function EducationModal({
  open,
  mode,
  employeeLabel,
  initial,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [category, setCategory] =
    useState<(typeof CATEGORIES)[number]>("법정 의무교육");
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hours, setHours] = useState("");
  const [org, setOrg] = useState("");
  const [status, setStatus] = useState<EducationStatus>("done");
  const [score, setScore] = useState("");
  const [completion, setCompletion] = useState<"수료" | "미수료" | "예정" | "">("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initial) {
      setCategory(initial.category);
      setName(initial.name);
      setStartDate(initial.startDate);
      setEndDate(initial.endDate);
      setHours(initial.hours);
      setOrg(initial.org);
      setStatus(initial.status);
      setScore(initial.score ?? "");
      setCompletion(initial.completion ?? "");
    } else {
      setCategory("법정 의무교육");
      setName("");
      setStartDate("");
      setEndDate("");
      setHours("");
      setOrg("");
      setStatus("done");
      setScore("");
      setCompletion("");
    }
    setError("");
  }, [open, mode, initial]);

  if (!open) return null;

  const submit = () => {
    if (!name.trim() || !startDate || !endDate || !hours.trim() || !org.trim()) {
      setError("필수 항목을 입력하세요.");
      return;
    }
    onSave({
      id: initial?.id,
      category,
      name: name.trim(),
      startDate,
      endDate,
      hours: hours.trim(),
      org: org.trim(),
      status,
      score: score.trim() || undefined,
      completion: completion || undefined,
    });
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2>{mode === "create" ? "교육 이수 추가" : "교육 이수 수정"}</h2>
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
              {initial.score && (
                <span className={styles.scoreBadge}>
                  {initial.score}점 · {initial.completion}
                </span>
              )}
              <p>현재 수정 중인 교육 이수 정보입니다. 변경 사항은 즉시 반영됩니다.</p>
            </div>
          )}

          <div className={styles.field}>
            <span>
              교육 카테고리 <b>필수</b>
            </span>
            <div className={styles.chipRow}>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={category === c ? styles.chipActive : styles.chip}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <label className={styles.field}>
            <span>
              교육명 <b>필수</b>
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="교육과정명을 입력하세요"
            />
          </label>

          <div className={styles.grid2}>
            <label className={styles.field}>
              <span>
                교육 시작일 <b>필수</b>
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>
                교육 종료일 <b>필수</b>
              </span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
          </div>

          <div className={styles.grid2}>
            <label className={styles.field}>
              <span>
                교육 시간 <b>필수</b>
              </span>
              <input
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="예) 8 (시간 단위)"
              />
            </label>
            <label className={styles.field}>
              <span>
                교육 기관 / 장소 <b>필수</b>
              </span>
              <input
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                placeholder="예) 한국방사선진흥협회"
              />
            </label>
          </div>

          <div className={styles.field}>
            <span>이수 상태</span>
            <div className={styles.chipRow}>
              {STATUS_OPTS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  className={status === s.key ? styles.chipActive : styles.chip}
                  onClick={() => setStatus(s.key)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.grid2}>
            <label className={styles.field}>
              <span>이수 점수 (선택)</span>
              <input
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="예) 96"
              />
            </label>
            <label className={styles.field}>
              <span>수료 구분 (선택)</span>
              <select
                value={completion}
                onChange={(e) =>
                  setCompletion(e.target.value as "수료" | "미수료" | "예정" | "")
                }
              >
                <option value="">선택</option>
                <option value="수료">수료</option>
                <option value="미수료">미수료</option>
                <option value="예정">예정</option>
              </select>
            </label>
          </div>

          {error && <p className={styles.error}>{error}</p>}
        </div>

        <div className={styles.footer}>
          {mode === "edit" && onDelete && (
            <button type="button" className={styles.deleteBtn} onClick={onDelete}>
              교육 삭제
            </button>
          )}
          <div className={styles.footerRight}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              × 취소
            </button>
            <button type="button" className={styles.saveBtn} onClick={submit}>
              {mode === "create" ? "+ 교육 추가" : "✓ 수정 저장"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}