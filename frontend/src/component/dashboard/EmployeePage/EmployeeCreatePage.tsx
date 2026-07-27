"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";


import {
  CreateEmployeeRequest,
  createEmployeeDetailed,
} from "@/services/employeeService";
import styles from "./EmployeeCreatePage.module.scss";

type FormState = {
  name: string;
  birthDate: string;
  gender: string;
  phone: string;
  internalPhone: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyRelation: string;
  departmentId: string;
  positionCode: string;
  jobCategoryCode: string;
  employmentTypeCode: string;
  joinDate: string;
  hireRouteCode: string;
  workTypeCode: string;
  workWard: string;
  empNo: string;
  payStep: string;
  payrollTypeCode: string;
  payrollDate: string;
  bankAccount: string;
  taxTypeCode: string;
  isShiftWorker: boolean;
};

const initialForm: FormState = {
  name: "",
  birthDate: "",
  gender: "",
  phone: "",
  internalPhone: "",
  email: "",
  address: "",
  emergencyContact: "",
  emergencyRelation: "",
  departmentId: "",
  positionCode: "",
  jobCategoryCode: "",
  employmentTypeCode: "",
  joinDate: "",
  hireRouteCode: "",
  workTypeCode: "",
  workWard: "",
  empNo: "",
  payStep: "",
  payrollTypeCode: "",
  payrollDate: "",
  bankAccount: "",
  taxTypeCode: "",
  isShiftWorker: false,
};

export default function EmployeeCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.empNo.trim()) return "사번을 입력하세요.";
    if (!form.name.trim()) return "성명을 입력하세요.";
    if (!form.joinDate) return "입사일을 입력하세요.";
    if (!form.departmentId) return "부서를 선택하세요.";
    return "";
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await createEmployeeDetailed({
        empNo: form.empNo.trim(),
        name: form.name.trim(),
        email: form.email || undefined,
        phone: form.phone || undefined,
        joinDate: form.joinDate,
        isShiftWorker: form.isShiftWorker,
        gender: form.gender || undefined,
        birthDate: form.birthDate || undefined,
        address: form.address || undefined,
        internalPhone: form.internalPhone || undefined,
        emergencyContact: form.emergencyContact || undefined,
        emergencyRelation: form.emergencyRelation || undefined,
        departmentId: Number(form.departmentId),
        positionCode: form.positionCode || undefined,
        jobCategoryCode: form.jobCategoryCode || undefined,
        employmentTypeCode: form.employmentTypeCode || undefined,
        hireRouteCode: form.hireRouteCode || undefined,
        workTypeCode: form.workTypeCode || undefined,
        workWard: form.workWard || undefined,
        payStep: form.payStep ? Number(form.payStep) : undefined,
        payrollTypeCode: form.payrollTypeCode || undefined,
        payrollDate: form.payrollDate ? Number(form.payrollDate) : undefined,
        bankAccount: form.bankAccount || undefined,
        taxTypeCode: form.taxTypeCode || undefined,
      });

      alert("직원이 등록되었습니다.");
      router.push("/dashboard/employees");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.main}>
          <div className={styles.pageHeader}>
            <div>
              <h1>직원 추가</h1>
              <p>새 직원 정보를 입력하고 등록합니다.</p>
            </div>
          </div>

          <form className={styles.form} onSubmit={onSubmit}>
            <div className={styles.formBody}>
              {/* 인적사항 */}
              <section className={styles.card}>
                <div className={styles.cardTitle}>
                  <span className={styles.badgeBlue}>👤</span>
                  <h2>인적사항</h2>
                  <em>필수 항목 포함</em>
                </div>

                <div className={styles.grid3}>
                  <label className={styles.field}>
                    <span>
                      성명 <b>필수</b>
                    </span>
                    <input
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      placeholder="성명을 입력하세요"
                    />
                  </label>
                  <label className={styles.field}>
                    <span>생년월일</span>
                    <input
                      type="date"
                      name="birthDate"
                      value={form.birthDate}
                      onChange={onChange}
                    />
                  </label>
                  <div className={styles.field}>
                    <span>성별</span>
                    <div className={styles.segment}>
                      <button
                        type="button"
                        className={form.gender === "M" ? styles.segActive : ""}
                        onClick={() => setForm((p) => ({ ...p, gender: "M" }))}
                      >
                        남성
                      </button>
                      <button
                        type="button"
                        className={form.gender === "F" ? styles.segActive : ""}
                        onClick={() => setForm((p) => ({ ...p, gender: "F" }))}
                      >
                        여성
                      </button>
                    </div>
                  </div>
                </div>

                <div className={styles.grid3}>
                  <label className={styles.field}>
                    <span>휴대폰</span>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={onChange}
                      placeholder="010-0000-0000"
                    />
                  </label>
                  <label className={styles.field}>
                    <span>내선 번호</span>
                    <input
                      name="internalPhone"
                      value={form.internalPhone}
                      onChange={onChange}
                      placeholder="02-0000-0000"
                    />
                  </label>
                  <label className={styles.field}>
                    <span>이메일</span>
                    <input
                      name="email"
                      value={form.email}
                      onChange={onChange}
                      placeholder="example@hospital.kr"
                    />
                  </label>
                </div>

                <label className={styles.field}>
                  <span>주소</span>
                  <input
                    name="address"
                    value={form.address}
                    onChange={onChange}
                    placeholder="주소를 입력하세요"
                  />
                </label>

                <div className={styles.grid2}>
                  <label className={styles.field}>
                    <span>긴급 연락처</span>
                    <input
                      name="emergencyContact"
                      value={form.emergencyContact}
                      onChange={onChange}
                      placeholder="010-0000-0000"
                    />
                  </label>
                  <label className={styles.field}>
                    <span>관계</span>
                    <input
                      name="emergencyRelation"
                      value={form.emergencyRelation}
                      onChange={onChange}
                      placeholder="예) 배우자, 부모"
                    />
                  </label>
                </div>
              </section>

              {/* 소속 및 직무 */}
              <section className={styles.card}>
                <div className={styles.cardTitle}>
                  <span className={styles.badgeGreen}>🏢</span>
                  <h2>소속 및 직무</h2>
                </div>

                <div className={styles.grid3}>
                  <label className={styles.field}>
                    <span>
                      부서 <b>필수</b>
                    </span>
                    <select
                      name="departmentId"
                      value={form.departmentId}
                      onChange={onChange}
                    >
                      <option value="">부서 선택</option>
                      <option value="1">원장실</option>
                      <option value="2">중환자실</option>
                      <option value="3">영상의학과</option>
                      <option value="4">간호부</option>
                    </select>
                  </label>
                  <label className={styles.field}>
                    <span>직위</span>
                    <select
                      name="positionCode"
                      value={form.positionCode}
                      onChange={onChange}
                    >
                      <option value="">직위 선택</option>
                      <option value="POS_01">수석</option>
                      <option value="POS_02">수간호사</option>
                      <option value="POS_03">과장</option>
                      <option value="POS_04">대리</option>
                    </select>
                  </label>
                  <label className={styles.field}>
                    <span>직군</span>
                    <select
                      name="jobCategoryCode"
                      value={form.jobCategoryCode}
                      onChange={onChange}
                    >
                      <option value="">직군 선택</option>
                      <option value="JOB_01">전문의</option>
                      <option value="JOB_02">간호사</option>
                      <option value="JOB_03">행정직</option>
                    </select>
                  </label>
                </div>

                <div className={styles.grid3}>
                  <label className={styles.field}>
                    <span>고용 형태</span>
                    <select
                      name="employmentTypeCode"
                      value={form.employmentTypeCode}
                      onChange={onChange}
                    >
                      <option value="">고용 형태 선택</option>
                      <option value="EMP_FULL">정규직</option>
                      <option value="EMP_CONTRACT">계약직</option>
                      <option value="EMP_INTERN">인턴</option>
                    </select>
                  </label>
                  <label className={styles.field}>
                    <span>
                      입사일 <b>필수</b>
                    </span>
                    <input
                      type="date"
                      name="joinDate"
                      value={form.joinDate}
                      onChange={onChange}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>입사 경로</span>
                    <select
                      name="hireRouteCode"
                      value={form.hireRouteCode}
                      onChange={onChange}
                    >
                      <option value="">입사 경로 선택</option>
                      <option value="HIRE_OPEN">공개채용</option>
                      <option value="HIRE_REF">추천</option>
                    </select>
                  </label>
                </div>

                <div className={styles.grid3}>
                  <label className={styles.field}>
                    <span>근무 형태</span>
                    <select
                      name="workTypeCode"
                      value={form.workTypeCode}
                      onChange={onChange}
                    >
                      <option value="">근무 형태 선택</option>
                      <option value="WORK_DAY">상근</option>
                      <option value="WORK_SHIFT">교대</option>
                    </select>
                  </label>
                  <label className={styles.field}>
                    <span>근무 병동</span>
                    <input
                      name="workWard"
                      value={form.workWard}
                      onChange={onChange}
                      placeholder="근무 장소"
                    />
                  </label>
                  <label className={styles.field}>
                    <span>
                      사번 <b>필수</b>
                    </span>
                    <input
                      name="empNo"
                      value={form.empNo}
                      onChange={onChange}
                      placeholder="예) RN-2002"
                    />
                  </label>
                </div>
              </section>

              {/* 직급 · 행정 / 급여 */}
              <section className={styles.card}>
                <div className={styles.cardTitle}>
                  <span className={styles.badgePurple}>💳</span>
                  <h2>직급 · 행정 / 급여</h2>
                </div>

                <div className={styles.grid3}>
                  <label className={styles.field}>
                    <span>호봉</span>
                    <input
                      name="payStep"
                      value={form.payStep}
                      onChange={onChange}
                      placeholder="숫자"
                    />
                  </label>
                  <label className={styles.field}>
                    <span>급여 유형</span>
                    <select
                      name="payrollTypeCode"
                      value={form.payrollTypeCode}
                      onChange={onChange}
                    >
                      <option value="">급여 유형 선택</option>
                      <option value="PAY_ANNUAL">연봉</option>
                      <option value="PAY_STEP">호봉제</option>
                    </select>
                  </label>
                  <label className={styles.field}>
                    <span>급여 지급일</span>
                    <select
                      name="payrollDate"
                      value={form.payrollDate}
                      onChange={onChange}
                    >
                      <option value="">지급일 선택</option>
                      <option value="25">25일</option>
                      <option value="28">28일</option>
                    </select>
                  </label>
                </div>

                <div className={styles.grid2}>
                  <label className={styles.field}>
                    <span>계좌번호</span>
                    <input
                      name="bankAccount"
                      value={form.bankAccount}
                      onChange={onChange}
                      placeholder="계좌번호"
                    />
                  </label>
                  <label className={styles.field}>
                    <span>세금 유형</span>
                    <select
                      name="taxTypeCode"
                      value={form.taxTypeCode}
                      onChange={onChange}
                    >
                      <option value="">세금 유형 선택</option>
                      <option value="TAX_EARNED">근로소득</option>
                    </select>
                  </label>
                </div>
              </section>
            </div>

            <div className={styles.formFooter}>
              {error && <p className={styles.error}>{error}</p>}
              <p className={styles.note}>
                * 표시 항목은 백엔드 필수값입니다. (사번, 성명, 입사일, 부서)
              </p>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => router.back()}
                >
                  × 취소
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={submitting}
                >
                  {submitting ? "등록 중..." : "직원 등록 완료"}
                </button>
              </div>
            </div>
          </form>
        </main>
  );
}