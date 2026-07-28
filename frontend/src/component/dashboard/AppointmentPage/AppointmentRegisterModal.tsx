"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./AppointmentRegisterModal.module.scss";

export type AppointmentRegisterForm = {
  appointmentType: string;
  applyDate: string;
  employeeId: string;
  employeeName: string;
  currentDepartment: string;
  currentPosition: string;
  afterDepartmentId: string;
  afterPositionCode: string;
  note: string;
};

type EmployeeOption = {
  id: string;
  name: string;
  department: string;
  position: string;
};

type DeptOption = { id: string; name: string };
type PositionOption = { code: string; name: string };

type Props = {
  open: boolean;
  employees?: EmployeeOption[];
  departments?: DeptOption[];
  positions?: PositionOption[];
  onClose: () => void;
  onSubmit: (data: AppointmentRegisterForm) => void | Promise<void>;
};

const APPOINTMENT_TYPES = [
  "승진",
  "전보",
  "보직변경",
  "휴직",
  "복직",
  "퇴직",
  "기타",
];

const DEFAULT_EMPLOYEES: EmployeeOption[] = [
  { id: "1", name: "박서준", department: "영상의학과", position: "부장" },
  { id: "2", name: "오하윤", department: "진단검사과", position: "과장" },
  { id: "3", name: "신유나", department: "영양팀", position: "대리" },
  { id: "4", name: "배준혁", department: "원무과", position: "주임" },
];

const DEFAULT_DEPARTMENTS: DeptOption[] = [
  { id: "3", name: "영상의학과" },
  { id: "2", name: "중환자실" },
  { id: "4", name: "간호부" },
  { id: "5", name: "원무과" },
  { id: "1", name: "원장실" },
];

const DEFAULT_POSITIONS: PositionOption[] = [
  { code: "POS_05", name: "수석부장" },
  { code: "POS_04", name: "부장" },
  { code: "POS_03", name: "과장" },
  { code: "POS_02", name: "대리" },
  { code: "POS_01", name: "주임" },
];

const emptyForm: AppointmentRegisterForm = {
  appointmentType: "승진",
  applyDate: "",
  employeeId: "",
  employeeName: "",
  currentDepartment: "",
  currentPosition: "",
  afterDepartmentId: "",
  afterPositionCode: "",
  note: "",
};

export default function AppointmentRegisterModal({
  open,
  employees = DEFAULT_EMPLOYEES,
  departments = DEFAULT_DEPARTMENTS,
  positions = DEFAULT_POSITIONS,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<AppointmentRegisterForm>(emptyForm);
  const [keyword, setKeyword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      ...emptyForm,
      applyDate: new Date().toISOString().slice(0, 10),
    });
    setKeyword("");
    setError("");
  }, [open]);

  const filteredEmployees = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return employees.slice(0, 8);
    return employees
      .filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q) ||
          e.position.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [employees, keyword]);

  if (!open) return null;

  const selectEmployee = (emp: EmployeeOption) => {
    setForm((prev) => ({
      ...prev,
      employeeId: emp.id,
      employeeName: emp.name,
      currentDepartment: emp.department,
      currentPosition: emp.position,
    }));
    setKeyword(emp.name);
  };

  const submit = async () => {
    if (!form.appointmentType) {
      setError("발령 유형을 선택하세요.");
      return;
    }
    if (!form.applyDate) {
      setError("발령일을 선택하세요.");
      return;
    }
    if (!form.employeeId) {
      setError("대상 직원을 선택하세요.");
      return;
    }
    if (!form.afterDepartmentId) {
      setError("변경 부서를 선택하세요.");
      return;
    }
    if (!form.afterPositionCode) {
      setError("변경 직위를 선택하세요.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "발령 등록에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2>발령 등록</h2>
            <p>새로운 인사발령 정보를 입력하세요.</p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.grid2}>
            <label className={styles.field}>
              <span>
                발령 유형 <b>*</b>
              </span>
              <select
                value={form.appointmentType}
                onChange={(e) =>
                  setForm((p) => ({ ...p, appointmentType: e.target.value }))
                }
              >
                {APPOINTMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>
                발령일 <b>*</b>
              </span>
              <input
                type="date"
                value={form.applyDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, applyDate: e.target.value }))
                }
              />
            </label>
          </div>

          <div className={styles.field}>
            <span>
              대상 직원 <b>*</b>
            </span>
            <div className={styles.employeeSearch}>
              <input
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  if (form.employeeId) {
                    setForm((p) => ({
                      ...p,
                      employeeId: "",
                      employeeName: "",
                      currentDepartment: "",
                      currentPosition: "",
                    }));
                  }
                }}
                placeholder="직원 이름 검색"
              />
              {form.employeeId && (
                <span className={styles.empChip}>
                  {form.currentDepartment} · {form.currentPosition}
                </span>
              )}
            </div>

            {!form.employeeId && keyword.trim() && (
              <div className={styles.suggestList}>
                {filteredEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    className={styles.suggestItem}
                    onClick={() => selectEmployee(emp)}
                  >
                    <strong>{emp.name}</strong>
                    <span>
                      {emp.department} · {emp.position}
                    </span>
                  </button>
                ))}
                {filteredEmployees.length === 0 && (
                  <p className={styles.emptySuggest}>검색 결과가 없습니다.</p>
                )}
              </div>
            )}
          </div>

          <div className={styles.grid2}>
            <label className={styles.field}>
              <span>현재 부서</span>
              <input value={form.currentDepartment} readOnly />
            </label>
            <label className={styles.field}>
              <span>현재 직위</span>
              <input value={form.currentPosition} readOnly />
            </label>
          </div>

          <div className={styles.arrow}>↓</div>

          <div className={styles.grid2}>
            <label className={styles.field}>
              <span>
                변경 부서 <b>*</b>
              </span>
              <select
                value={form.afterDepartmentId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, afterDepartmentId: e.target.value }))
                }
              >
                <option value="">선택</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>
                변경 직위 <b>*</b>
              </span>
              <select
                value={form.afterPositionCode}
                onChange={(e) =>
                  setForm((p) => ({ ...p, afterPositionCode: e.target.value }))
                }
              >
                <option value="">선택</option>
                {positions.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className={styles.field}>
            <span>발령 사유</span>
            <textarea
              rows={3}
              value={form.note}
              onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
              placeholder="발령 사유를 입력하세요"
            />
          </label>

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
            {saving ? "등록 중..." : "✓ 발령 등록"}
          </button>
        </div>
      </div>
    </div>
  );
}