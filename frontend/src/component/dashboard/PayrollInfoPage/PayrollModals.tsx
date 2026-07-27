import React, { useState, useEffect, useRef } from "react";
import styles from "./PayrollModals.module.scss";

// SVG Icons
const EditIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="16"></line>
    <line x1="8" y1="12" x2="16" y2="12"></line>
  </svg>
);

const SaveIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  theme?: "blue" | "red" | "green" | "purple";
  footer?: React.ReactNode;
}

export function BaseModal({ isOpen, onClose, title, subtitle, children, theme = "blue", footer }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={`${styles.modalHeader} ${styles[theme]}`}>
          <div className={styles.headerInfo}>
            <div className={styles.iconBox}>
              {theme === "blue" || theme === "purple" ? <EditIcon /> : <PlusIcon />}
            </div>
            <div className={styles.titleWrap}>
              <h3>{title}</h3>
              <p>{subtitle}</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.modalBody}>
          {children}
        </div>
        {footer && <div className={styles.modalFooter}>{footer}</div>}
      </div>
    </div>
  );
}

// 1. Base Salary Edit Modal (Blue)
export function BaseSalaryEditModal({ isOpen, onClose, item, onSuccess }: { isOpen: boolean, onClose: () => void, item?: any, onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    minAmount: "",
    maxAmount: "",
    actualAmount: ""
  });

  useEffect(() => {
    if (item) {
      setFormData({
        minAmount: item.minAmount?.toString() || "",
        maxAmount: item.maxAmount?.toString() || "",
        actualAmount: item.actualAmount?.toString() || ""
      });
    }
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!item?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/payroll-settings/base-salaries/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          minAmount: formData.minAmount ? parseInt(formData.minAmount) : null,
          maxAmount: formData.maxAmount ? parseInt(formData.maxAmount) : null,
          actualAmount: formData.actualAmount ? parseInt(formData.actualAmount) : null
        })
      });
      if (res.ok) {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="기본급 수정"
      subtitle="직급별 기본급 기준 금액을 수정합니다"
      theme="blue"
      footer={
        <>
          <button className={styles.cancelBtn} onClick={onClose} disabled={loading}>취소</button>
          <button className={`${styles.submitBtn} ${styles.blue}`} onClick={handleSave} disabled={loading}>
            <SaveIcon /> {loading ? "저장 중..." : "저장"}
          </button>
        </>
      }
    >
      <div className={styles.formGroup}>
        <label className={styles.fieldLabel}>직급</label>
        <div className={styles.fakeInput}>
          <span className={styles.jobBadge}>{item?.jobTitle || "직급"}</span>
          <svg style={{ marginLeft: "auto", color: "#8b95a1" }} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </div>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.fieldLabel}>호봉 시작</label>
          <input type="text" defaultValue="1" disabled />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.fieldLabel}>호봉 끝</label>
          <input type="text" defaultValue="10" disabled />
        </div>
      </div>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.fieldLabel}>기본급 최소 (원)</label>
          <input type="text" name="minAmount" value={formData.minAmount} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.fieldLabel}>기본급 최대 (원)</label>
          <input type="text" name="maxAmount" value={formData.maxAmount} onChange={handleChange} />
        </div>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.fieldLabel}>기본 수당 포함액 (원)</label>
        <input type="text" name="actualAmount" value={formData.actualAmount} onChange={handleChange} placeholder="해당없음" />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.fieldLabel}>적용일</label>
        <div style={{ position: "relative" }}>
          <input type="text" defaultValue="2026-01-01" style={{ paddingLeft: "2.5rem" }} disabled />
          <svg style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#8b95a1" }} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </div>
      </div>
      <div className={styles.alertBox}>
        <InfoIcon /> 변경 시 해당 직급 전체 직원 급여에 즉시 반영됩니다.
      </div>
    </BaseModal>
  );
}

// Custom Dropdown Component for Deduction Methods
const deductionCalcOptions = [
  { value: "기본급*요율", label: "기본급 × 요율", icon: "%" },
  { value: "건강보험료*요율", label: "건강보험료 × 요율", icon: "%" },
  { value: "정액", label: "정액 차감", icon: "⊝" },
  { value: "간이세액표", label: "간이세액표 적용", icon: "⊟" }
];

const CustomSelect = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOpt = deductionCalcOptions.find(o => o.value === value) || deductionCalcOptions[0];

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '0.875rem 1rem', border: `1px solid ${isOpen ? '#3182f6' : '#e5e8eb'}`, borderRadius: '0.5rem', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
          backgroundColor: '#fff', boxShadow: isOpen ? '0 0 0 3px rgba(49, 130, 246, 0.1)' : 'none'
        }}
      >
        <span>{selectedOpt.label}</span>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#8b95a1" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.25rem', backgroundColor: '#fff', border: '1px solid #e5e8eb', borderRadius: '0.5rem', overflow: 'hidden', zIndex: 10, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          {deductionCalcOptions.map(opt => (
            <div 
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              style={{ 
                padding: '0.75rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                backgroundColor: value === opt.value ? '#eff6ff' : '#fff',
                color: value === opt.value ? '#1c51ce' : '#4e5968',
                fontWeight: value === opt.value ? 700 : 500
              }}
            >
              <span style={{ fontSize: '1.125rem', display: 'inline-block', width: '20px', textAlign: 'center' }}>{opt.icon}</span> {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


// 2. Deduction Add Modal (Red)
export function DeductionAddModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "법정",
    deductionType: "기본급*요율",
    rateOrAmount: "",
    isActive: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({ ...prev, category }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/payroll-settings/deductions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="공제 항목 추가"
      subtitle="새 공제 항목을 등록합니다"
      theme="red"
      footer={
        <>
          <button className={styles.cancelBtn} onClick={onClose} disabled={loading}>취소</button>
          <button className={`${styles.submitBtn} ${styles.red}`} onClick={handleSave} disabled={loading}>
            + {loading ? "저장 중..." : "항목 추가"}
          </button>
        </>
      }
    >
      <div className={styles.formGroup}>
        <label className={styles.fieldLabel}>공제 항목명</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="항목명을 입력하세요" />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.fieldLabel}>구분</label>
        <div className={styles.radioGroup}>
          <label className={`${styles.radioItem} ${formData.category === '법정' ? `${styles.active} ${styles.red}` : ''}`}>
            <input type="radio" name="category" checked={formData.category === '법정'} onChange={() => handleCategoryChange('법정')} />
            <div className={styles.radioCircle}></div>
            법정공제
          </label>
          <label className={`${styles.radioItem} ${formData.category === '자체' ? `${styles.active} ${styles.red}` : ''}`}>
            <input type="radio" name="category" checked={formData.category === '자체'} onChange={() => handleCategoryChange('자체')} />
            <div className={styles.radioCircle}></div>
            자체공제
          </label>
        </div>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.fieldLabel}>계산 방식</label>
        <CustomSelect value={formData.deductionType} onChange={(val) => setFormData(prev => ({ ...prev, deductionType: val }))} />
      </div>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.fieldLabel}>요율 / 금액</label>
          <input type="text" name="rateOrAmount" value={formData.rateOrAmount} onChange={handleChange} placeholder="예: 4.5% 또는 30000" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.fieldLabel}>적용 여부</label>
          <div className={styles.toggleWrap}>
            <label className={styles.toggleSwitch}>
              <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} />
              <span className={styles.slider}></span>
            </label>
            <span className={styles.statusText}>{formData.isActive ? "적용 중" : "미적용"}</span>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

// 3. Deduction Edit Modal (Purple)
export function DeductionEditModal({ isOpen, onClose, item, onSuccess }: { isOpen: boolean, onClose: () => void, item?: any, onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "법정",
    deductionType: "기본급*요율",
    rateOrAmount: "",
    isActive: true
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        category: item.category === '법정공제' ? '법정' : (item.category || '법정'),
        deductionType: item.deductionType || "기본급*요율",
        rateOrAmount: item.rateOrAmount || "",
        isActive: true
      });
    }
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({ ...prev, category }));
  };

  const handleSave = async () => {
    if (!item?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/payroll-settings/deductions/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!item?.id) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/payroll-settings/deductions/${item.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="공제 항목 수정"
      subtitle="기존 공제 항목을 수정합니다"
      theme="purple"
      footer={
        <>
          <div className={styles.leftAction}>
            <button className={styles.deleteBtn} onClick={handleDelete} disabled={loading}>
              <TrashIcon /> 항목 삭제
            </button>
          </div>
          <button className={styles.cancelBtn} onClick={onClose} disabled={loading}>취소</button>
          <button className={`${styles.submitBtn} ${styles.purple}`} onClick={handleSave} disabled={loading}>
            <SaveIcon /> {loading ? "저장 중..." : "저장"}
          </button>
        </>
      }
    >
      <div className={styles.disabledItemBox}>
        <div className={styles.dot}></div>
        <span><span className={styles.label}>현재 항목:</span> {item?.name} ({item?.category} · {item?.rateOrAmount})</span>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.fieldLabel}>공제 항목명</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.fieldLabel}>구분</label>
        <div className={styles.radioGroup}>
          <label className={`${styles.radioItem} ${formData.category === '법정' ? `${styles.active} ${styles.red}` : ''}`}>
            <input type="radio" name="category" checked={formData.category === '법정'} onChange={() => handleCategoryChange('법정')} />
            <div className={styles.radioCircle}></div>
            법정공제
          </label>
          <label className={`${styles.radioItem} ${formData.category === '자체' ? `${styles.active} ${styles.red}` : ''}`}>
            <input type="radio" name="category" checked={formData.category === '자체'} onChange={() => handleCategoryChange('자체')} />
            <div className={styles.radioCircle}></div>
            자체공제
          </label>
        </div>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.fieldLabel}>계산 방식</label>
        <CustomSelect value={formData.deductionType} onChange={(val) => setFormData(prev => ({ ...prev, deductionType: val }))} />
      </div>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.fieldLabel}>요율 / 금액</label>
          <input type="text" name="rateOrAmount" value={formData.rateOrAmount} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.fieldLabel}>적용 여부</label>
          <div className={styles.toggleWrap}>
            <label className={styles.toggleSwitch}>
              <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} />
              <span className={styles.slider}></span>
            </label>
            <span className={styles.statusText}>{formData.isActive ? "적용 중" : "미적용"}</span>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

// 4. Allowance Add Modal (Green)
export function AllowanceAddModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    taxType: "과세",
    amountType: "정액",
    amountOrRate: "",
    calculationBasis: "",
    isActive: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTaxType = (taxType: string) => setFormData(prev => ({ ...prev, taxType }));
  const handleAmountType = (amountType: string) => setFormData(prev => ({ ...prev, amountType }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/payroll-settings/allowances`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="수당 항목 추가"
      subtitle="새 수당 항목을 등록합니다"
      theme="green"
      footer={
        <>
          <button className={styles.cancelBtn} onClick={onClose} disabled={loading}>취소</button>
          <button className={`${styles.submitBtn} ${styles.green}`} onClick={handleSave} disabled={loading}>
            + {loading ? "저장 중..." : "수당 추가"}
          </button>
        </>
      }
    >
      <div className={styles.formGroup}>
        <label className={styles.fieldLabel}>수당 항목명</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="수당명을 입력하세요" />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.fieldLabel}>과세 구분</label>
        <div className={styles.radioGroup}>
          <label className={`${styles.radioItem} ${formData.taxType === '과세' ? `${styles.active} ${styles.blue}` : ''}`}>
            <input type="radio" checked={formData.taxType === '과세'} onChange={() => handleTaxType('과세')} />
            <div className={styles.radioCircle}></div>
            과세 수당
          </label>
          <label className={`${styles.radioItem} ${formData.taxType === '비과세' ? `${styles.active} ${styles.blue}` : ''}`}>
            <input type="radio" checked={formData.taxType === '비과세'} onChange={() => handleTaxType('비과세')} />
            <div className={styles.radioCircle}></div>
            비과세 수당
          </label>
        </div>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.fieldLabel}>계산 방식 (DB 기준)</label>
        <div className={styles.radioGroup}>
          <label className={`${styles.radioItem} ${formData.amountType === '비율' ? `${styles.active} ${styles.green}` : ''}`}>
            <input type="radio" checked={formData.amountType === '비율'} onChange={() => handleAmountType('비율')} />
            <div className={styles.radioCircle}></div>
            비율 (요율/배율)
          </label>
          <label className={`${styles.radioItem} ${formData.amountType === '정액' ? `${styles.active} ${styles.green}` : ''}`}>
            <input type="radio" checked={formData.amountType === '정액'} onChange={() => handleAmountType('정액')} />
            <div className={styles.radioCircle}></div>
            정액
          </label>
        </div>
      </div>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.fieldLabel}>지급 금액 / 비율</label>
          <input type="text" name="amountOrRate" value={formData.amountOrRate} onChange={handleChange} placeholder="예: 100,000 또는 150%" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.fieldLabel}>계산 기준 설명</label>
          <input type="text" name="calculationBasis" value={formData.calculationBasis} onChange={handleChange} placeholder="예: 통상임금 * 1.5" />
        </div>
      </div>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.fieldLabel}>적용 여부</label>
        </div>
        <div className={styles.formGroup} style={{ alignItems: "flex-end", marginTop: "-1.5rem" }}>
          <div className={styles.toggleWrap}>
            <label className={styles.toggleSwitch}>
              <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} />
              <span className={`${styles.slider} ${styles.green}`}></span>
            </label>
            <span className={`${styles.statusText} ${styles.green}`}>{formData.isActive ? "즉시 적용" : "미적용"}</span>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

// Allowance Edit Modal
export function AllowanceEditModal({ isOpen, onClose, item, onSuccess }: { isOpen: boolean, onClose: () => void, item?: any, onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    taxType: "과세",
    amountType: "정액",
    amountOrRate: "",
    calculationBasis: "",
    isActive: true
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        taxType: item.taxType || "과세",
        amountType: item.amountType || "정액",
        amountOrRate: item.amountOrRate || "",
        calculationBasis: item.calculationBasis || "",
        isActive: true
      });
    }
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTaxType = (taxType: string) => setFormData(prev => ({ ...prev, taxType }));
  const handleAmountType = (amountType: string) => setFormData(prev => ({ ...prev, amountType }));

  const handleSave = async () => {
    if (!item?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/payroll-settings/allowances/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!item?.id) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/payroll-settings/allowances/${item.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="수당 항목 수정"
      subtitle="기존 수당 항목을 수정합니다"
      theme="green"
      footer={
        <>
          <div className={styles.leftAction}>
            <button className={styles.deleteBtn} onClick={handleDelete} disabled={loading}>
              <TrashIcon /> 항목 삭제
            </button>
          </div>
          <button className={styles.cancelBtn} onClick={onClose} disabled={loading}>취소</button>
          <button className={`${styles.submitBtn} ${styles.green}`} onClick={handleSave} disabled={loading}>
            <SaveIcon /> {loading ? "저장 중..." : "저장"}
          </button>
        </>
      }
    >
      <div className={styles.disabledItemBox}>
        <div className={styles.dot} style={{ backgroundColor: '#0E8A5E' }}></div>
        <span style={{ color: '#0B6B49' }}><span className={styles.label}>현재 항목:</span> {item?.name} ({item?.taxType} · {item?.amountOrRate})</span>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.fieldLabel}>수당 항목명</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.fieldLabel}>과세 구분</label>
        <div className={styles.radioGroup}>
          <label className={`${styles.radioItem} ${formData.taxType === '과세' ? `${styles.active} ${styles.blue}` : ''}`}>
            <input type="radio" checked={formData.taxType === '과세'} onChange={() => handleTaxType('과세')} />
            <div className={styles.radioCircle}></div>
            과세 수당
          </label>
          <label className={`${styles.radioItem} ${formData.taxType === '비과세' ? `${styles.active} ${styles.blue}` : ''}`}>
            <input type="radio" checked={formData.taxType === '비과세'} onChange={() => handleTaxType('비과세')} />
            <div className={styles.radioCircle}></div>
            비과세 수당
          </label>
        </div>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.fieldLabel}>계산 방식</label>
        <div className={styles.radioGroup}>
          <label className={`${styles.radioItem} ${formData.amountType === '비율' ? `${styles.active} ${styles.green}` : ''}`}>
            <input type="radio" checked={formData.amountType === '비율'} onChange={() => handleAmountType('비율')} />
            <div className={styles.radioCircle}></div>
            비율 (요율/배율)
          </label>
          <label className={`${styles.radioItem} ${formData.amountType === '정액' ? `${styles.active} ${styles.green}` : ''}`}>
            <input type="radio" checked={formData.amountType === '정액'} onChange={() => handleAmountType('정액')} />
            <div className={styles.radioCircle}></div>
            정액
          </label>
        </div>
      </div>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.fieldLabel}>지급 금액 / 비율</label>
          <input type="text" name="amountOrRate" value={formData.amountOrRate} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.fieldLabel}>계산 기준 설명</label>
          <input type="text" name="calculationBasis" value={formData.calculationBasis} onChange={handleChange} />
        </div>
      </div>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.fieldLabel}>적용 여부</label>
        </div>
        <div className={styles.formGroup} style={{ alignItems: "flex-end", marginTop: "-1.5rem" }}>
          <div className={styles.toggleWrap}>
            <label className={styles.toggleSwitch}>
              <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} />
              <span className={`${styles.slider} ${styles.green}`}></span>
            </label>
            <span className={`${styles.statusText} ${styles.green}`}>{formData.isActive ? "즉시 적용" : "미적용"}</span>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
