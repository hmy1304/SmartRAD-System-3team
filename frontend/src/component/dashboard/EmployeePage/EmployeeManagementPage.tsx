"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  getEmployees,
  updateEmployeeRole,
  updateAccountStatus,
  issueAccount,
  deleteEmployees,
  createEmployeeDetailed,
} from "@/services/employeeService";

import type { EmployeeManagementData } from "@/types/employee";
import styles from "./EmployeeManagementPage.module.scss";
import AddressSearchModal from "./AddressSearchModal";
import BankAccountVerifyModal from "./BankAccountVerifyModal";

interface Props {
  initialData: EmployeeManagementData;
}

const FILTERS = ["전체", "정규직", "계약직", "인턴"] as const;

const initialForm = {
  empNo: "",
  name: "",
  birthDate: "",
  gender: "",
  phone: "",
  internalPhone: "",
  email: "",
  zipCode: "",
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
  payStep: "",
  payrollTypeCode: "",
  payrollDate: "",
  bankName: "",      
  bankAccount: "",   
  taxTypeCode: "",
};

export default function EmployeeManagementPage({ initialData }: Props) {
  const router = useRouter();

  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("전체");
  const [selectedId, setSelectedId] = useState(
    initialData.selectedEmployee?.id ?? null,
  );
  const [activeTab, setActiveTab] = useState<
    "basic" | "history" | "license" | "health"
  >("basic");

  const [mode, setMode] = useState<"list" | "create">("list");
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);

  const [bankVerifyOpen, setBankVerifyOpen] = useState(false);
  const [bankVerified, setBankVerified] = useState(false);

  const filteredEmployees = useMemo(() => {
    return initialData.employees.filter((emp) => {
      const matchFilter = filter === "전체" || emp.employmentType === filter;
      const matchKeyword =
        !keyword ||
        emp.name.includes(keyword) ||
        emp.department.includes(keyword) ||
        emp.employeeNo.toLowerCase().includes(keyword.toLowerCase());
      return matchFilter && matchKeyword;
    });
  }, [initialData.employees, filter, keyword]);

  const selected = initialData.selectedEmployee;

  const onFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openCreate = () => {
    setForm(initialForm);
    setFormError("");
    setMode("create");
  };

  const onCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.empNo.trim() || !form.name.trim() || !form.joinDate || !form.departmentId) {
      setFormError("사번, 성명, 입사일, 부서는 필수입니다.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      await createEmployeeDetailed({
        empNo: form.empNo.trim(),
        name: form.name.trim(),
        email: form.email || undefined,
        phone: form.phone || undefined,
        joinDate: form.joinDate,
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
      setMode("list");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  

  return (
    <main className={styles.main}>
          {mode === "create" ? (
            <form className={styles.createForm} onSubmit={onCreateSubmit}>
              <div className={styles.createHeader}>
                <div>
                  <h1>직원 추가</h1>
                  <p>새 직원 정보를 입력하고 등록합니다.</p>
                </div>
              </div>

              <div className={styles.createBody}>
                {/* 인적사항 */}
                <section className={styles.createCard}>
                  <div className={styles.createCardTitle}>
                    <span className={styles.createBadgeBlue}>👤</span>
                    <h2>인적사항</h2>
                    <em>필수 항목 포함</em>
                  </div>

                  <div className={styles.createGrid3}>
                    <label className={styles.createField}>
                      <span>성명 <b>필수</b></span>
                      <input name="name" value={form.name} onChange={onFormChange} placeholder="성명을 입력하세요" />
                    </label>
                    <label className={styles.createField}>
                      <span>생년월일</span>
                      <input type="date" name="birthDate" value={form.birthDate} onChange={onFormChange} />
                    </label>
                    <div className={styles.createField}>
                      <span>성별</span>
                      <div className={styles.segment}>
                        <button type="button" className={form.gender === "M" ? styles.segActive : ""} onClick={() => setForm((p) => ({ ...p, gender: "M" }))}>남성</button>
                        <button type="button" className={form.gender === "F" ? styles.segActive : ""} onClick={() => setForm((p) => ({ ...p, gender: "F" }))}>여성</button>
                      </div>
                    </div>
                  </div>

                  <div className={styles.createGrid3}>
                    <label className={styles.createField}>
                      <span>휴대폰</span>
                      <input name="phone" value={form.phone} onChange={onFormChange} placeholder="010-0000-0000" />
                    </label>
                    <label className={styles.createField}>
                      <span>내선 번호</span>
                      <input name="internalPhone" value={form.internalPhone} onChange={onFormChange} placeholder="02-0000-0000" />
                    </label>
                    <label className={styles.createField}>
                      <span>이메일</span>
                      <input name="email" value={form.email} onChange={onFormChange} placeholder="example@hospital.kr" />
                    </label>
                  </div>

                  <label className={styles.createField}>
  <span>주소</span>
  <div className={styles.addressRow}>
    <input
      name="zipCode"
      value={(form as any).zipCode ?? ""}
      onChange={onFormChange}
      placeholder="우편번호"
      readOnly
    />
    <button
      type="button"
      className={styles.addressSearchBtn}
      onClick={() => setAddressOpen(true)}
    >
      검색
    </button>
  </div>
  <input
    name="address"
    value={form.address}
    onChange={onFormChange}
    placeholder="상세 주소를 입력하세요 (동, 호수 등)"
  />
</label>

                  <div className={styles.createGrid2}>
                    <label className={styles.createField}>
                      <span>긴급 연락처</span>
                      <input name="emergencyContact" value={form.emergencyContact} onChange={onFormChange} placeholder="010-0000-0000" />
                    </label>
                    <label className={styles.createField}>
                      <span>관계</span>
                      <input name="emergencyRelation" value={form.emergencyRelation} onChange={onFormChange} placeholder="예) 배우자, 부모" />
                    </label>
                  </div>
                </section>

                {/* 소속 및 직무 */}
                <section className={styles.createCard}>
                  <div className={styles.createCardTitle}>
                    <span className={styles.createBadgeGreen}>🏢</span>
                    <h2>소속 및 직무</h2>
                  </div>

                  <div className={styles.createGrid3}>
                    <label className={styles.createField}>
                      <span>부서 <b>필수</b></span>
                      <select name="departmentId" value={form.departmentId} onChange={onFormChange}>
                        <option value="">부서 선택</option>
                        <option value="1">원장실</option>
                        <option value="2">중환자실</option>
                        <option value="3">영상의학과</option>
                        <option value="4">간호부</option>
                      </select>
                    </label>
                    <label className={styles.createField}>
                      <span>직위</span>
                      <select name="positionCode" value={form.positionCode} onChange={onFormChange}>
                        <option value="">직위 선택</option>
                        <option value="POS_01">수석</option>
                        <option value="POS_02">수간호사</option>
                        <option value="POS_03">과장</option>
                        <option value="POS_04">대리</option>
                      </select>
                    </label>
                    <label className={styles.createField}>
                      <span>직군</span>
                      <select name="jobCategoryCode" value={form.jobCategoryCode} onChange={onFormChange}>
                        <option value="">직군 선택</option>
                        <option value="JOB_01">전문의</option>
                        <option value="JOB_02">간호사</option>
                        <option value="JOB_03">행정직</option>
                      </select>
                    </label>
                  </div>

                  <div className={styles.createGrid3}>
                    <label className={styles.createField}>
                      <span>고용 형태</span>
                      <select name="employmentTypeCode" value={form.employmentTypeCode} onChange={onFormChange}>
                        <option value="">선택</option>
                        <option value="EMP_FULL">정규직</option>
                        <option value="EMP_CONTRACT">계약직</option>
                        <option value="EMP_INTERN">인턴</option>
                      </select>
                    </label>
                    <label className={styles.createField}>
                      <span>입사일 <b>필수</b></span>
                      <input type="date" name="joinDate" value={form.joinDate} onChange={onFormChange} />
                    </label>
                    <label className={styles.createField}>
                      <span>사번 <b>필수</b></span>
                      <input name="empNo" value={form.empNo} onChange={onFormChange} placeholder="예) RN-2002" />
                    </label>
                  </div>

                  <div className={styles.createGrid3}>
                    <label className={styles.createField}>
                      <span>입사 경로</span>
                      <select name="hireRouteCode" value={form.hireRouteCode} onChange={onFormChange}>
                        <option value="">선택</option>
                        <option value="HIRE_OPEN">공개채용</option>
                        <option value="HIRE_REF">추천</option>
                      </select>
                    </label>
                    <label className={styles.createField}>
                      <span>근무 형태</span>
                      <select name="workTypeCode" value={form.workTypeCode} onChange={onFormChange}>
                        <option value="">선택</option>
                        <option value="WORK_DAY">상근</option>
                        <option value="WORK_SHIFT">교대</option>
                      </select>
                    </label>
                    <label className={styles.createField}>
                      <span>근무 병동</span>
                      <input name="workWard" value={form.workWard} onChange={onFormChange} placeholder="근무 장소" />
                    </label>
                  </div>
                </section>

                {/* 행정 / 급여 */}
                <section className={styles.createCard}>
                  <div className={styles.createCardTitle}>
                    <span className={styles.createBadgePurple}>💳</span>
                    <h2>행정 / 급여</h2>
                  </div>

                  <div className={styles.createGrid3}>
                    <label className={styles.createField}>
                      <span>호봉</span>
                      <input name="payStep" value={form.payStep} onChange={onFormChange} placeholder="숫자" />
                    </label>
                    <label className={styles.createField}>
                      <span>급여 유형</span>
                      <select name="payrollTypeCode" value={form.payrollTypeCode} onChange={onFormChange}>
                        <option value="">선택</option>
                        <option value="PAY_ANNUAL">연봉</option>
                        <option value="PAY_STEP">호봉제</option>
                      </select>
                    </label>
                    <label className={styles.createField}>
                      <span>지급일</span>
                      <select name="payrollDate" value={form.payrollDate} onChange={onFormChange}>
                        <option value="">선택</option>
                        <option value="25">25일</option>
                        <option value="28">28일</option>
                      </select>
                    </label>
                  </div>

                  <div className={styles.createGrid2}>
                    <label className={styles.createField}>
  <span>계좌 정보</span>
  <div className={styles.accountRow}>
    <select
      name="bankName"
      value={form.bankName}
      onChange={(e) => {
        setBankVerified(false);
        onFormChange(e);
      }}
    >
      <option value="">은행 선택</option>
      <option value="국민은행">국민은행</option>
      <option value="신한은행">신한은행</option>
      <option value="우리은행">우리은행</option>
      <option value="하나은행">하나은행</option>
    </select>

    <input
      name="bankAccount"
      value={form.bankAccount}
      onChange={(e) => {
        setBankVerified(false);
        onFormChange(e);
      }}
      placeholder="계좌번호를 입력하세요"
    />

    <button
      type="button"
      className={styles.verifyBtn}
      onClick={() => {
        if (!form.bankName || !form.bankAccount.trim()) {
          setFormError("은행과 계좌번호를 먼저 입력하세요.");
          return;
        }
        setFormError("");
        setBankVerifyOpen(true);
      }}
    >
      {bankVerified ? "✓ 인증완료" : "인증"}
    </button>
  </div>
</label>

<label className={styles.createField}>
  <span>세금 유형</span>
  <select
    name="taxTypeCode"
    value={form.taxTypeCode}
    onChange={onFormChange}
  >
    <option value="">선택</option>
    <option value="TAX_EARNED">근로소득</option>
  </select>
</label>
                  </div>
                </section>
              </div>

              <div className={styles.createFooter}>
                {formError && <p className={styles.formError}>{formError}</p>}
                <p className={styles.createNote}>* 사번, 성명, 입사일, 부서는 필수입니다.</p>
                <div className={styles.createActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setMode("list")}>
                    × 취소
                  </button>
                  <button type="submit" className={styles.submitBtn} disabled={submitting}>
                    {submitting ? "등록 중..." : "직원 등록 완료"}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className={styles.contentLayout}>
              <section className={styles.listBox}>
                <div className={styles.listHeader}>
                  <div>
                    <h1 className={styles.listTitle}>직원 목록</h1>
                    <p className={styles.listCount}>총 {initialData.totalCount.toLocaleString()}명</p>
                  </div>
                  <button type="button" className={styles.addBtn} onClick={openCreate}>
                    + 직원 추가
                  </button>
                </div>

                <div className={styles.listSearch}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="직원 검색" />
                </div>

                <div className={styles.filterTabs}>
                  {FILTERS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      className={filter === f ? styles.filterActive : ""}
                      onClick={() => setFilter(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div className={styles.empList}>
                  {filteredEmployees.map((emp) => (
                    <button
                      key={emp.id}
                      type="button"
                      className={`${styles.empCard} ${selectedId === emp.id ? styles.empCardActive : ""}`}
                      onClick={() => setSelectedId(emp.id)}
                    >
                      <span className={`${styles.avatar} ${styles[emp.avatarTone]}`}>{emp.initial}</span>
                      <div className={styles.empInfo}>
                        <div className={styles.empNameRow}>
                          <strong>{emp.name}</strong>
                          <span className={`${styles.statusBadge} ${styles[emp.status]}`}>{emp.statusLabel}</span>
                        </div>
                        <p>{emp.department} · {emp.position}</p>
                        <small>{emp.employeeNo}</small>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {selected && (
                <section className={styles.detailPanel}>
                  <div className={styles.profileHeader}>
                    <div className={styles.profileLeft}>
                      <span className={`${styles.profileAvatar} ${styles[selected.avatarTone]}`}>
                        {selected.initial}
                      </span>
                      <div className={styles.profileMeta}>
                        <div className={styles.profileNameRow}>
                          <h2>{selected.name}</h2>
                          <span className={`${styles.statusBadge} ${styles[selected.status]}`}>
                            {selected.statusLabel}
                          </span>
                        </div>
                        <p className={styles.profileDept}>{selected.department} · {selected.position}</p>
                        <p className={styles.profileSub}>
                          <span>{selected.employeeNo}</span>
                          <span className={styles.dot}>·</span>
                          <span>입사일 {selected.hireDate}</span>
                        </p>
                      </div>
                    </div>
                    <button type="button" className={styles.editBtn}>정보 수정</button>
                  </div>

                  <div className={styles.tabs}>
                    {[
                      { key: "basic", label: "기본정보" },
                      { key: "history", label: "재직 이력" },
                      { key: "license", label: "자격증·교육" },
                      { key: "health", label: "건강검진" },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        className={activeTab === tab.key ? styles.tabActive : ""}
                        onClick={() => setActiveTab(tab.key as typeof activeTab)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {activeTab === "basic" && (
                    <div className={styles.detailBody}>
                      <div className={styles.cardGrid}>
                        <article className={styles.card}>
                          <div className={styles.cardTitle}>
                            <span className={`${styles.cardIcon} ${styles.iconBlue}`}>👤</span>
                            <h3>인적사항</h3>
                          </div>
                          <div className={styles.infoGrid}>
                            <div><label>성명</label><p>{selected.name}</p></div>
                            <div><label>생년월일</label><p>{selected.birthDate}</p></div>
                            <div><label>성별</label><p>{selected.gender}</p></div>
                            <div><label>연락처</label><p>{selected.phone}</p></div>
                            <div><label>이메일</label><p>{selected.email}</p></div>
                            <div className={styles.full}><label>주소</label><p>{selected.address}</p></div>
                            <div className={styles.full}><label>긴급 연락처</label><p>{selected.emergencyContact}</p></div>
                          </div>
                        </article>

                        <article className={styles.card}>
                          <div className={styles.cardTitle}>
                            <span className={`${styles.cardIcon} ${styles.iconGreen}`}>🏢</span>
                            <h3>소속 및 직무</h3>
                          </div>
                          <div className={styles.infoGrid}>
                            <div><label>부서</label><p>{selected.departmentFull}</p></div>
                            <div><label>직위</label><p>{selected.jobTitle}</p></div>
                            <div><label>입사일</label><p>{selected.hireDate}</p></div>
                            <div><label>사번</label><p>{selected.employeeNoFull}</p></div>
                          </div>
                        </article>
                      </div>
                    </div>
                  )}
                </section>
              )}
            </div>
          )}
        </main>
  );
}