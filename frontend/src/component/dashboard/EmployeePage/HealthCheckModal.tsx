"use client";

import { useEffect, useState } from "react";
import type {
  HealthCheckRecord,
  HealthCheckItemResult,
  HealthResult,
} from "@/types/employee";
import styles from "./HealthCheckModal.module.scss";

type Props = {
  open: boolean;
  employeeLabel: string;
  onClose: () => void;
  onSave: (data: Omit<HealthCheckRecord, "id">) => void;
};

const TYPES = [
  "일반 건강검진",
  "특수 건강검진",
  "채용 신체검사",
  "기타",
] as const;

const GRADES: { key: HealthResult; label: string }[] = [
  { key: "normal", label: "정상 (A등급)" },
  { key: "caution", label: "주의 (B등급)" },
  { key: "abnormal", label: "이상 (C등급)" },
  { key: "missed", label: "미실시" },
];

const emptyItem = (): HealthCheckItemResult => ({
  name: "",
  value: "",
  range: "",
  judgment: "정상",
});

export default function HealthCheckModal({
  open,
  employeeLabel,
  onClose,
  onSave,
}: Props) {
  const [type, setType] = useState<(typeof TYPES)[number]>("일반 건강검진");
  const [date, setDate] = useState("");
  const [org, setOrg] = useState("");
  const [result, setResult] = useState<HealthResult>("normal");
  const [note, setNote] = useState("");
  const [items, setItems] = useState<HealthCheckItemResult[]>([
    { name: "신장 / 체중", value: "", range: "-", judgment: "정상" },
    { name: "혈압", value: "", range: "120/80 미만", judgment: "정상" },
  ]);
  const [memo, setMemo] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setType("일반 건강검진");
    setDate("");
    setOrg("");
    setResult("normal");
    setNote("");
    setItems([
      { name: "신장 / 체중", value: "", range: "-", judgment: "정상" },
      { name: "혈압", value: "", range: "120/80 미만", judgment: "정상" },
    ]);
    setMemo("");
    setError("");
  }, [open]);

  if (!open) return null;

  const submit = () => {
    if (!date || !org.trim()) {
      setError("검진일과 검진 기관을 입력하세요.");
      return;
    }
    const gradeMap: Record<HealthResult, string> = {
      normal: "정상",
      caution: "주의",
      abnormal: "이상",
      missed: "미실시",
    };
    onSave({
      date,
      type,
      result,
      resultLabel: gradeMap[result],
      note: note.trim() || "이상 소견 없음",
      org: org.trim(),
      grade: GRADES.find((g) => g.key === result)?.label,
      items: items.filter((i) => i.name.trim()),
      memo: memo.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2>건강검진 추가</h2>
            <p>{employeeLabel}</p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.body}>
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
                검진일 <b>필수</b>
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
                placeholder="예) 원내 의원, 국민건강보험공단"
              />
            </label>
          </div>

          <div className={styles.field}>
            <span>종합 판정</span>
            <div className={styles.chipRow}>
              {GRADES.map((g) => (
                <button
                  key={g.key}
                  type="button"
                  className={result === g.key ? styles.chipActive : styles.chip}
                  onClick={() => setResult(g.key)}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <label className={styles.field}>
            <span>주요 소견</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="예) 이상 소견 없음 / 콜레스테롤 수치 경계"
            />
          </label>

          <div className={styles.field}>
            <div className={styles.rowBetween}>
              <span>검사 항목별 결과 입력 (선택)</span>
              <button
                type="button"
                className={styles.addItemBtn}
                onClick={() => setItems((p) => [...p, emptyItem()])}
              >
                + 항목 추가
              </button>
            </div>
            {items.map((item, idx) => (
              <div key={idx} className={styles.itemRow}>
                <input
                  placeholder="검사 항목명"
                  value={item.name}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...next[idx], name: e.target.value };
                    setItems(next);
                  }}
                />
                <input
                  placeholder="결과값"
                  value={item.value}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...next[idx], value: e.target.value };
                    setItems(next);
                  }}
                />
                <input
                  placeholder="정상 범위"
                  value={item.range}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...next[idx], range: e.target.value };
                    setItems(next);
                  }}
                />
                <select
                  value={item.judgment}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = {
                      ...next[idx],
                      judgment: e.target
                        .value as HealthCheckItemResult["judgment"],
                    };
                    setItems(next);
                  }}
                >
                  <option value="정상">정상</option>
                  <option value="주의">주의</option>
                  <option value="이상">이상</option>
                </select>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => setItems((p) => p.filter((_, i) => i !== idx))}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <label className={styles.field}>
            <span>메모 (선택)</span>
            <textarea
              rows={3}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="추가 소견 또는 담당 의사 메모를 입력하세요"
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            × 취소
          </button>
          <button type="button" className={styles.saveBtn} onClick={submit}>
            + 검진 기록 추가
          </button>
        </div>
      </div>
    </div>
  );
}