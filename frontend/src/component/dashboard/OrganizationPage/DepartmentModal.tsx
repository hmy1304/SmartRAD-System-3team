"use client";

import { useEffect, useState } from "react";
import styles from "./DepartmentModal.module.scss";

export type DepartmentForm = {
  id?: string | number;
  nameKo: string;
  nameEn: string;
  code: string;
  parentId: string;
  manager: string;
  location: string;
  phone: string;
  establishedAt: string;
  description: string;
};

type ParentOption = { id: string; name: string };

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial?: Partial<DepartmentForm> | null;
  parentOptions: ParentOption[];
  onClose: () => void;
  onSubmit: (data: DepartmentForm) => void | Promise<void>;
};

const emptyForm: DepartmentForm = {
  nameKo: "",
  nameEn: "",
  code: "DEPT-AUTO",
  parentId: "",
  manager: "",
  location: "",
  phone: "",
  establishedAt: "",
  description: "",
};

export default function DepartmentModal({
  open,
  mode,
  initial,
  parentOptions,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<DepartmentForm>(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initial) {
      setForm({
        id: initial.id,
        nameKo: initial.nameKo ?? "",
        nameEn: initial.nameEn ?? "",
        code: initial.code ?? "DEPT-AUTO",
        parentId: initial.parentId ?? "",
        manager: initial.manager ?? "",
        location: initial.location ?? "",
        phone: initial.phone ?? "",
        establishedAt: initial.establishedAt ?? "",
        description: initial.description ?? "",
      });
    } else {
      setForm({
        ...emptyForm,
        code: `DEPT-${Date.now().toString().slice(-4)}`,
        establishedAt: new Date().toISOString().slice(0, 10),
      });
    }
    setError("");
  }, [open, mode, initial]);

  if (!open) return null;

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async () => {
    if (!form.nameKo.trim()) {
      setError("부서명(한국어)을 입력하세요.");
      return;
    }
    if (!form.parentId) {
      setError("상위 부서를 선택하세요.");
      return;
    }
    if (!form.manager.trim()) {
      setError("부서장을 입력하세요.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>🏢</span>
            <div>
              <h2>{mode === "create" ? "부서 등록" : "부서 수정"}</h2>
              <p>
                {mode === "create"
                  ? "새로운 부서 정보를 입력하고 조직에 추가합니다."
                  : "조직의 부서 정보를 수정 입력합니다."}
              </p>
            </div>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.body}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <i className={styles.barBlue} /> 기본 정보
            </h3>
            <div className={styles.grid2}>
              <label className={styles.field}>
                <span>
                  부서명 (한국어) <b>*</b>
                </span>
                <input
                  name="nameKo"
                  value={form.nameKo}
                  onChange={onChange}
                  placeholder="부서명 입력(한국어)"
                />
              </label>
              <label className={styles.field}>
                <span>부서명 (영문)</span>
                <input
                  name="nameEn"
                  value={form.nameEn}
                  onChange={onChange}
                  placeholder="부서명 입력(영문)"
                />
              </label>
              <label className={styles.field}>
                <span>
                  부서 코드 <b>*</b>
                </span>
                <input
                  name="code"
                  value={form.code}
                  readOnly
                  className={styles.readonly}
                />
              </label>
              <label className={styles.field}>
                <span>
                  상위 부서 <b>*</b>
                </span>
                <select
                  name="parentId"
                  value={form.parentId}
                  onChange={onChange}
                >
                  <option value="">선택</option>
                  {parentOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <i className={styles.barGreen} /> 담당자 및 위치 정보
            </h3>
            <div className={styles.grid2}>
              <label className={styles.field}>
                <span>
                  부서장 <b>*</b>
                </span>
                <input
                  name="manager"
                  value={form.manager}
                  onChange={onChange}
                  placeholder="부서장 검색..."
                />
              </label>
              <label className={styles.field}>
                <span>위치</span>
                <input
                  name="location"
                  value={form.location}
                  onChange={onChange}
                  placeholder="위치 입력"
                />
              </label>
              <label className={styles.field}>
                <span>내선 번호</span>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  placeholder="번호 입력"
                />
              </label>
              <label className={styles.field}>
                <span>설립일</span>
                <input
                  type="date"
                  name="establishedAt"
                  value={form.establishedAt}
                  onChange={onChange}
                />
              </label>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <i className={styles.barOrange} /> 부서 설명
            </h3>
            <label className={styles.field}>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                rows={4}
                placeholder="부서의 주요 업무 및 역할을 입력하세요."
              />
            </label>
          </section>

          {error && <p className={styles.error}>{error}</p>}
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            취소
          </button>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={submit}
            disabled={saving}
          >
            {saving
              ? "저장 중..."
              : mode === "create"
                ? "부서 등록"
                : "부서 수정"}
          </button>
        </div>
      </div>
    </div>
  );
}