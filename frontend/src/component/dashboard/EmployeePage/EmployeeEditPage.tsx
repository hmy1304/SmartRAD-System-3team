"use client";

import { useEffect, useState, useMemo, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  getEmployeeProfile,
  updateEmployee,
} from "@/services/employeeService";
import { useCommonCodes } from "@/hooks/useCommonCodes";
import type { EmployeeUpdateRequest, EmployeeProfileResponse } from "@/types/employee";
import AddressSearchModal from "./AddressSearchModal";
import BankAccountVerifyModal from "./BankAccountVerifyModal";
import styles from "./EmployeeCreatePage.module.scss";

type FormState = {
  name: string;
  birthDate: string;
  gender: string;
  phone: string;
  internalPhone: string;
  email: string;
  zipCode: string;
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
  bankName: string;
  bankAccount: string;
  taxTypeCode: string;
};

const emptyForm: FormState = {
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
  empNo: "",
  payStep: "",
  payrollTypeCode: "",
  payrollDate: "",
  bankName: "",
  bankAccount: "",
  taxTypeCode: "",
};

type Props = {
  employeeId: string;
};

export default function EmployeeEditPage({ employeeId }: Props) {
  const router = useRouter();
  const { userProfile } = useAuthStore();

  const canEdit = useMemo(() => {
    const perm = userProfile?.perms?.find(p => p.menuCode === 'EMP_LIST');
    return perm ? perm.canWrite : false;
  }, [userProfile]);

  useEffect(() => {
    if (userProfile && !canEdit) {
      alert("해당 메뉴의 수정 권한이 없습니다.");
      router.push("/dashboard/employees");
    }
  }, [userProfile, canEdit, router]);

  const { codes, isLoading: codesLoading } = useCommonCodes([
    "POS",
    "JOB",
    "EMP_TYPE",
    "WORK_TYPE",
    "HIRE_ROUTE",
    "PAY_TYPE",
    "TAX_TYPE",
  ]);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [original, setOriginal] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [addressOpen, setAddressOpen] = useState(false);
  const [bankVerifyOpen, setBankVerifyOpen] = useState(false);
  const [bankVerified, setBankVerified] = useState(true);
  
  const [activeTab, setActiveTab] = useState<"basic" | "appointments" | "leave" | "education">("basic");
  const [profileData, setProfileData] = useState<EmployeeProfileResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const data = await getEmployeeProfile(employeeId);
        const basic = data.basicInfo;

        const mapped: FormState = {
          name: basic.name ?? "",
          birthDate: basic.birthDate ? String(basic.birthDate).slice(0, 10) : "",
          gender: basic.gender ?? "",
          phone: basic.phone ?? "",
          internalPhone: basic.internalPhone ?? "",
          email: basic.email ?? "",
          zipCode: basic.zipCode ?? "",
          address: basic.address ?? "",
          emergencyContact: basic.emergencyContact ?? "",
          emergencyRelation: basic.emergencyRelation ?? "",
          departmentId: basic.departmentId != null ? String(basic.departmentId) : "",
          positionCode: basic.positionCode ?? "",
          jobCategoryCode: basic.jobCategoryCode ?? "",
          employmentTypeCode: basic.employmentTypeCode ?? "",
          joinDate: basic.joinDate ? String(basic.joinDate).slice(0, 10) : "",
          hireRouteCode: basic.hireRouteCode ?? "",
          workTypeCode: basic.workTypeCode ?? "",
          workWard: basic.workWard ?? "",
          empNo: basic.empNo ?? "",
          payStep: basic.payStep != null ? String(basic.payStep) : "",
          payrollTypeCode: basic.payrollTypeCode ?? "",
          payrollDate: basic.payrollDate != null ? String(basic.payrollDate) : "",
          bankName: basic.bankName ?? "",
          bankAccount: basic.bankAccount ?? "",
          taxTypeCode: basic.taxTypeCode ?? "",
        };

        if (!cancelled) {
          setForm(mapped);
          setOriginal(mapped);
          setBankVerified(true);
          setProfileData(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "직원 정보를 불러오지 못했습니다.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  const changedCount = (Object.keys(form) as (keyof FormState)[]).filter(
    (key) => form[key] !== original[key],
  ).length;

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "bankName" || name === "bankAccount") {
      setBankVerified(false);
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("성명은 필수입니다.");
      return;
    }
    if (form.bankAccount && !bankVerified) {
      setError("계좌번호가 변경되었습니다. 재인증 후 저장하세요.");
      return;
    }

    setSubmitting(true);
    setError("");

    const payload: EmployeeUpdateRequest = {
      name: form.name.trim() || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
      gender: form.gender || undefined,
      birthDate: form.birthDate || undefined,
      address: form.address || undefined,
      internalPhone: form.internalPhone || undefined,
      emergencyContact: form.emergencyContact || undefined,
      emergencyRelation: form.emergencyRelation || undefined,
      departmentId: form.departmentId ? Number(form.departmentId) : undefined,
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
      bankName: form.bankName || undefined,
      taxTypeCode: form.taxTypeCode || undefined,
    };

    try {
      await updateEmployee(employeeId, payload);
      alert("변경사항이 저장되었습니다.");
      router.push("/dashboard/employees");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className={styles.main}><p>불러오는 중...</p></div>;
  }

  return (
    <div className={styles.main}>
      <div className={styles.pageHeader}>
        <div className={styles.breadcrumb}>
          직원관리 &gt; {form.name || "직원"} &gt; 정보 수정
        </div>
        <div className={styles.editTitleRow}>
          <h1>직원 정보 수정</h1>
          <span className={styles.editModeBadge}>수정 모드</span>
        </div>
        <p>{form.name} 직원의 기본 정보를 수정합니다. 변경된 항목은 저장 시 반영됩니다.</p>
      </div>

      <div className={styles.editBanner}>
        <span>
          현재 수정 모드가 활성화되어 있습니다. 변경 내용이 발생하면 "변경사항 저장"을 눌러주세요.
        </span>
        <em>{changedCount}건 변경됨</em>
      </div>

      <div className={styles.tabs} style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
        <button 
          type="button"
          onClick={() => setActiveTab('basic')}
          style={{ fontWeight: activeTab === 'basic' ? 'bold' : 'normal', border: 'none', background: 'none', cursor: 'pointer', color: activeTab === 'basic' ? '#0070f3' : '#666' }}>
          기본 인적사항
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('appointments')}
          style={{ fontWeight: activeTab === 'appointments' ? 'bold' : 'normal', border: 'none', background: 'none', cursor: 'pointer', color: activeTab === 'appointments' ? '#0070f3' : '#666' }}>
          인사 발령 이력
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('leave')}
          style={{ fontWeight: activeTab === 'leave' ? 'bold' : 'normal', border: 'none', background: 'none', cursor: 'pointer', color: activeTab === 'leave' ? '#0070f3' : '#666' }}>
          휴가/연차
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('education')}
          style={{ fontWeight: activeTab === 'education' ? 'bold' : 'normal', border: 'none', background: 'none', cursor: 'pointer', color: activeTab === 'education' ? '#0070f3' : '#666' }}>
          법정 교육
        </button>
      </div>

      {activeTab === 'basic' && (
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
                <span>성명 <b>필수</b></span>
                <input name="name" value={form.name} onChange={onChange} />
              </label>
              <label className={styles.field}>
                <span>생년월일</span>
                <input type="date" name="birthDate" value={form.birthDate} onChange={onChange} />
              </label>
              <div className={styles.field}>
                <span>성별</span>
                <div className={styles.segment}>
                  <button type="button" className={form.gender === "M" ? styles.segActive : ""} onClick={() => setForm((p) => ({ ...p, gender: "M" }))}>남성</button>
                  <button type="button" className={form.gender === "F" ? styles.segActive : ""} onClick={() => setForm((p) => ({ ...p, gender: "F" }))}>여성</button>
                </div>
              </div>
            </div>

            <div className={styles.grid3}>
              <label className={styles.field}>
                <span>휴대폰</span>
                <input name="phone" value={form.phone} onChange={onChange} />
              </label>
              <label className={styles.field}>
                <span>내선 번호</span>
                <input name="internalPhone" value={form.internalPhone} onChange={onChange} />
              </label>
              <label className={styles.field}>
                <span>이메일</span>
                <input name="email" value={form.email} onChange={onChange} />
              </label>
            </div>

            <label className={styles.field}>
              <span>주소</span>
              <div className={styles.addressRow}>
                <input name="zipCode" value={form.zipCode} readOnly placeholder="우편번호" />
                <button type="button" className={styles.addressSearchBtn} onClick={() => setAddressOpen(true)}>
                  검색
                </button>
              </div>
              <input name="address" value={form.address} onChange={onChange} placeholder="상세 주소" />
            </label>

            <div className={styles.grid2}>
              <label className={styles.field}>
                <span>긴급 연락처</span>
                <input name="emergencyContact" value={form.emergencyContact} onChange={onChange} />
              </label>
              <label className={styles.field}>
                <span>관계</span>
                <input name="emergencyRelation" value={form.emergencyRelation} onChange={onChange} />
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
                <span>부서</span>
                <select name="departmentId" value={form.departmentId} onChange={onChange}>
                  <option value="">부서 선택</option>
                  <option value="1">원장실</option>
                  <option value="2">중환자실</option>
                  <option value="3">영상의학과</option>
                  <option value="4">간호부</option>
                </select>
              </label>
              <label className={styles.field}>
                <span>직위</span>
                <select name="positionCode" value={form.positionCode} onChange={onChange}>
                  <option value="">직위 선택</option>
                  {codes.POS?.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>직군</span>
                <select name="jobCategoryCode" value={form.jobCategoryCode} onChange={onChange}>
                  <option value="">직군 선택</option>
                  {codes.JOB?.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className={styles.grid3}>
              <label className={styles.field}>
                <span>고용 형태</span>
                <select name="employmentTypeCode" value={form.employmentTypeCode} onChange={onChange}>
                  <option value="">선택</option>
                  {codes.EMP_TYPE?.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>입사일</span>
                <input type="date" name="joinDate" value={form.joinDate} readOnly />
              </label>
              <label className={styles.field}>
                <span>사번</span>
                <input name="empNo" value={form.empNo} readOnly />
              </label>
            </div>

            <div className={styles.grid3}>
              <label className={styles.field}>
                <span>근무 형태</span>
                <select name="workTypeCode" value={form.workTypeCode} onChange={onChange}>
                  <option value="">선택</option>
                  {codes.WORK_TYPE?.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>근무 병동</span>
                <input name="workWard" value={form.workWard} onChange={onChange} />
              </label>
              <label className={styles.field}>
                <span>입사 경로</span>
                <select name="hireRouteCode" value={form.hireRouteCode} onChange={onChange}>
                  <option value="">선택</option>
                  {codes.HIRE_ROUTE?.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          {/* 직급 / 호봉 */}
          <section className={styles.card}>
            <div className={styles.cardTitle}>
              <span className={styles.badgeBlue}>📈</span>
              <h2>직급 / 호봉</h2>
            </div>
            <div className={styles.grid2}>
              <label className={styles.field}>
                <span>직급</span>
                <select name="positionCode" value={form.positionCode} onChange={onChange}>
                  <option value="">선택</option>
                  {codes.POS?.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>호봉</span>
                <select name="payStep" value={form.payStep} onChange={onChange}>
                  <option value="18">18호봉</option>
                  <option value="15">15호봉</option>
                  <option value="12">12호봉</option>
                </select>
              </label>
            </div>
          </section>

          {/* 행정 / 급여 */}
          <section className={styles.card}>
            <div className={styles.cardTitle}>
              <span className={styles.badgePurple}>💳</span>
              <h2>행정 / 급여 정보</h2>
            </div>

            <div className={styles.grid3}>
              <label className={styles.field}>
                <span>직원 코드</span>
                <input value={form.empNo ? `INT-${form.empNo}` : ""} readOnly />
              </label>
              <label className={styles.field}>
                <span>급여 유형</span>
                <select name="payrollTypeCode" value={form.payrollTypeCode} onChange={onChange}>
                  <option value="">선택</option>
                  {codes.PAY_TYPE?.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>급여 지급일</span>
                <select name="payrollDate" value={form.payrollDate} onChange={onChange}>
                  <option value="">선택</option>
                  <option value="25">매월 25일</option>
                  <option value="28">매월 28일</option>
                </select>
              </label>
            </div>

            <label className={styles.field}>
              <span>계좌 정보</span>
              <div className={styles.accountRow}>
                <select name="bankName" value={form.bankName} onChange={onChange}>
                  <option value="">은행 선택</option>
                  <option value="국민은행">국민은행</option>
                  <option value="신한은행">신한은행</option>
                  <option value="우리은행">우리은행</option>
                  <option value="하나은행">하나은행</option>
                </select>
                <input
                  name="bankAccount"
                  value={form.bankAccount}
                  onChange={onChange}
                  placeholder="계좌번호"
                />
                <button
                  type="button"
                  className={styles.verifyBtn}
                  onClick={() => {
                    if (!form.bankName || !form.bankAccount.trim()) {
                      setError("은행과 계좌번호를 먼저 입력하세요.");
                      return;
                    }
                    setError("");
                    setBankVerifyOpen(true);
                  }}
                >
                  {bankVerified ? "✓ 인증완료" : "재인증"}
                </button>
              </div>
              {!bankVerified && form.bankAccount && (
                <p className={styles.warnNote}>계좌번호가 변경되었습니다. 저장 전 재인증이 필요합니다.</p>
              )}
            </label>

            <label className={styles.field}>
              <span>세금 유형</span>
              <select name="taxTypeCode" value={form.taxTypeCode} onChange={onChange}>
                <option value="">선택</option>
                <option value="TAX_EARNED">근로소득세 (일반)</option>
              </select>
            </label>
          </section>
        </div>

        {/* 에러 메시지 */}
        {error && <div className={styles.errorAlert}>{error}</div>}

        {/* 하단 버튼 */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => router.push(`/dashboard/employees/${employeeId}`)}
          >
            취소
          </button>
          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={submitting || (changedCount === 0 && bankVerified)}
          >
            {submitting ? "저장 중..." : "변경사항 저장"}
          </button>
        </div>
      </form>
      )}

      {activeTab === 'appointments' && profileData?.appointmentHistory && (
        <section className={styles.section}>
          <h2>인사 발령 이력</h2>
          <table className={styles.historyTable} style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>발령일</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>발령 종류</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>부서</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>직급</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>사유</th>
              </tr>
            </thead>
            <tbody>
              {profileData.appointmentHistory.map((h, i) => (
                <tr key={i}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{h.effectiveDate}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{h.type || '-'}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{h.department || '-'}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{h.position || '-'}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{h.reason || '-'}</td>
                </tr>
              ))}
              {profileData.appointmentHistory.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#999' }}>인사 발령 이력이 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {activeTab === 'leave' && profileData?.leaveQuota && (
        <section className={styles.section}>
          <h2>휴가/연차 현황</h2>
          <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
            <div style={{ flex: 1, padding: '24px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#666' }}>총 연차</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333' }}>{profileData.leaveQuota.total || 0}일</div>
            </div>
            <div style={{ flex: 1, padding: '24px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#666' }}>사용 연차</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0070f3' }}>{profileData.leaveQuota.used || 0}일</div>
            </div>
            <div style={{ flex: 1, padding: '24px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#666' }}>잔여 연차</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>{profileData.leaveQuota.remaining || 0}일</div>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'education' && profileData?.statutoryEducations && (
        <section className={styles.section}>
          <h2>법정 의무 교육 이수 현황</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {profileData.statutoryEducations.map((edu, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #eee', borderRadius: '8px' }}>
                <span style={{ fontWeight: '500' }}>{edu.title}</span>
                <span style={{ 
                  padding: '4px 12px', 
                  borderRadius: '16px', 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  background: edu.completed ? '#e6f4ea' : '#fce8e6',
                  color: edu.completed ? '#137333' : '#c5221f'
                }}>
                  {edu.completed ? '이수 완료' : '미이수'}
                </span>
              </div>
            ))}
            {profileData.statutoryEducations.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: '#999' }}>등록된 법정 의무 교육이 없습니다.</div>
            )}
          </div>
        </section>
      )}

      <AddressSearchModal
        open={addressOpen}
        onClose={() => setAddressOpen(false)}
        onSelect={({ zipCode, address }) => {
          setForm((prev) => ({ ...prev, zipCode, address }));
        }}
      />

      <BankAccountVerifyModal
        open={bankVerifyOpen}
        bankName={form.bankName}
        accountNo={form.bankAccount}
        onClose={() => setBankVerifyOpen(false)}
        onVerified={() => {
          setBankVerified(true);
          setBankVerifyOpen(false);
        }}
        onChangeAccount={() => setBankVerified(false)}
      />
    </div>
  );
}