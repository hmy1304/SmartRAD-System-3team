"use client";

import { useEffect, useState } from "react";
import styles from "./EmploymentHistoryModal.module.scss";

export type HistoryType =
  | "재직"
  | "승진"
  | "부서 이동"
  | "인사발령"
  | "표창/수상";

export type EmploymentHistoryForm = {
  type: HistoryType;
  startDate: string;
  endDate: string;
  department: string;
  position: string;
  employmentType: string;
  handler: string;
};

type Props = {
  open: boolean;
  employeeLabel: string;
  onClose: () => void;
  onSave: (data: EmploymentHistoryForm) => void | Promise<void>;
};

const TYPES: HistoryType[] = [
  "재직",
  "승진",
  "부서 이동",
  "인사발령",
  "표창/수상",
];

const INITIAL_FORM: EmploymentHistoryForm = {
  type: "재직",
  startDate: "",
  endDate: "",
  department: "영상의학과",
  position: "",
  employmentType: "정규직",
  handler: "",
};

export default function EmploymentHistoryModal({
  open,
  employeeLabel,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState<EmploymentHistoryForm>(INITIAL_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(INITIAL_FORM);
    setError("");
    setSaving(false);
  }, [open]);

  if (!open) return null;

  const submit = async () => {
    if (!form.startDate) {
      setError("이력 일자를 입력하세요.");
      return;
    }
    if (!form.department) {
      setError("부서를 선택하세요.");
      return;
    }
    if (!form.position) {
      setError("직위를 선택하세요.");
      return;
    }
    if (!form.handler.trim()) {
      setError("처리자를 입력하세요.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      await Promise.resolve(onSave(form));
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2>재직·발령 이력 추가</h2>
            <p>{employeeLabel}</p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.field}>
            <span>
              이력 유형 <b>필수</b>
            </span>
            <div className={styles.typeRow}>
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={
                    form.type === t ? styles.typeActive : styles.typeBtn
                  }
                  onClick={() => setForm((p) => ({ ...p, type: t }))}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.grid2}>
            <label className={styles.field}>
              <span>
                이력 일자 <b>필수</b>
              </span>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, startDate: e.target.value }))
                }
              />
            </label>
            <label className={styles.field}>
              <span>종료 일자 (없으면 현재)</span>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, endDate: e.target.value }))
                }
              />
            </label>
          </div>

          <div className={styles.grid2}>
            <label className={styles.field}>
              <span>
                부서 <b>필수</b>
              </span>
              <select
                value={form.department}
                onChange={(e) =>
                  setForm((p) => ({ ...p, department: e.target.value }))
                }
              >
                <option value="원장실">원장실</option>
                <option value="중환자실">중환자실</option>
                <option value="영상의학과">영상의학과</option>
                <option value="간호부">간호부</option>
                <option value="원무과">원무과</option>
              </select>
            </label>
            <label className={styles.field}>
              <span>
                직위 <b>필수</b>
              </span>
              <select
                value={form.position}
                onChange={(e) =>
                  setForm((p) => ({ ...p, position: e.target.value }))
                }
              >
                <option value="">직위 선택</option>
                <option value="수석">수석</option>
                <option value="수간호사">수간호사</option>
                <option value="부장">부장</option>
                <option value="과장">과장</option>
                <option value="대리">대리</option>
                <option value="주임">주임</option>
              </select>
            </label>
          </div>

          <div className={styles.grid2}>
            <label className={styles.field}>
              <span>고용 형태</span>
              <select
                value={form.employmentType}
                onChange={(e) =>
                  setForm((p) => ({ ...p, employmentType: e.target.value }))
                }
              >
                <option value="정규직">정규직</option>
                <option value="계약직">계약직</option>
                <option value="인턴">인턴</option>
              </select>
            </label>
            <label className={styles.field}>
              <span>
                처리자 <b>필수</b>
              </span>
              <input
                value={form.handler}
                onChange={(e) =>
                  setForm((p) => ({ ...p, handler: e.target.value }))
                }
                placeholder="담당자 이름 입력"
              />
            </label>
          </div>

          {error && <p className={styles.error}>{error}</p>}
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={saving}
          >
            × 취소
          </button>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={submit}
            disabled={saving}
          >
            {saving ? "저장 중..." : "✓ 이력 저장"}
          </button>
        </div>
      </div>
    </div>
  );
}